const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Auth endpoints are excluded — a failed login/register attempt is a normal
// user-facing error, not a session that needs to be torn down.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register"];

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

// Fired when the server tells us the current session is no longer valid
// (expired/invalid token, or a deactivated account). AuthContext listens for
// this and clears local auth state + redirects, so a 401/403 anywhere in the
// app can't leave the UI looking authenticated while every call silently fails.
function notifySessionInvalidated(message) {
  window.dispatchEvent(new CustomEvent("heartshare:session-invalidated", { detail: { message } }));
}

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const contentType = res.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await res.json()
      : { message: await res.text() };

    if (!res.ok) {
      const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => endpoint.startsWith(p));
      const isSessionFailure =
        !isAuthEndpoint && token && (res.status === 401 || (res.status === 403 && /deactivated/i.test(data.message || "")));
      if (isSessionFailure) notifySessionInvalidated(data.message);
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    if (error.message === "Failed to fetch")
      throw new Error("Cannot connect to server. Please check your connection.");
    throw error;
  }
};