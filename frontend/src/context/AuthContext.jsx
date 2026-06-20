import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    if (!token || token === "undefined" || token === "null") return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getStoredToken() {
  const token = localStorage.getItem("token");
  const decoded = decodeToken(token);
  if (!decoded) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
  return token;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const toast = useToast();
  const [token, setToken]     = useState(() => getStoredToken());
  const [user, setUser]       = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  const role = decodeToken(token)?.role ?? null;

  const login = useCallback((userData, jwtToken) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload?.exp) return;
    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { logout(); return; }
    const timer = setTimeout(logout, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token, logout]);

  // Catches everything decode-based expiry can't: a token rejected by the
  // server (invalid/rotated secret) or a deactivated account. apiRequest
  // dispatches this the moment any call comes back 401, or 403 + deactivated,
  // so the UI can't keep looking authenticated while every request quietly fails.
  useEffect(() => {
    const handler = (e) => {
      logout();
      toast.error(e.detail?.message || "Your session has ended. Please log in again.");
    };
    window.addEventListener("heartshare:session-invalidated", handler);
    return () => window.removeEventListener("heartshare:session-invalidated", handler);
  }, [logout, toast]);

  const isAuthenticated = Boolean(token && decodeToken(token));

  return (
    <AuthContext.Provider
      value={{ user, token, role, loading, setLoading, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}