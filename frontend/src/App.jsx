import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import LandingPage  from "./pages/LandingPage b";
import Login        from "./pages/Login";
import Signup       from "./pages/Signup";
import Admin        from "./pages/Admin";
import Sidebar      from "./components/layout/Sidebar";
import RightPanel   from "./components/layout/RightPanel";
import Dashboard    from "./pages/Dashboard";
import Donations    from "./pages/Donations";
import Campaigns    from "./pages/Campaigns";
import Volunteers   from "./pages/Volunteers";
import Reports      from "./pages/Reports";
import Organization from "./pages/Organization";

// Maps the custom "switch tabs" event some pages dispatch (e.g. Donations'
// "set up your NGO profile" prompt, Signup's post-registration redirect)
// onto a real route, now that tabs are routes rather than local state.
const NAV_EVENT_ROUTES = {
  Dashboard:    "/dashboard",
  Donations:    "/dashboard/donations",
  Campaigns:    "/dashboard/campaigns",
  Volunteers:   "/dashboard/volunteers",
  Reports:      "/dashboard/reports",
  Organization: "/dashboard/organization",
  Admin:        "/dashboard/admin",
};

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => { if (e.detail && NAV_EVENT_ROUTES[e.detail]) navigate(NAV_EVENT_ROUTES[e.detail]); };
    window.addEventListener("heartshare:navigate", handler);
    return () => window.removeEventListener("heartshare:navigate", handler);
  }, [navigate]);

  // The right-hand "at a glance" panel is specific to the Dashboard
  // overview — every other nested route gets the full width instead.
  const isDashboardHome = location.pathname === "/dashboard";

  return (
    <div className="font-[DM_Sans] min-h-screen flex items-center justify-center p-4 md:p-6 relative" style={{ backgroundColor: "var(--color-bg-app)" }}>
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-[var(--shadow-md)] text-[#555]"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden animate-overlay-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex gap-5 w-full max-w-[1040px]">
        <div className={`fixed md:static top-0 left-0 h-full z-40 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <div className="flex flex-1 bg-white rounded-[10px] border border-black/10 overflow-hidden shadow-[var(--shadow-lg)]">
          <div className="flex flex-1 overflow-hidden">
            {/* Only the tab content swaps/animates on navigation — Sidebar
                and this shell stay mounted, so switching tabs no longer
                tears down sidebarOpen state or replays the shell's own
                mount animation on every click (it did briefly, when tabs
                first became real routes instead of local state). */}
            <div key={location.pathname} className="flex-1 flex flex-col overflow-y-auto animate-rise-in">
              <Outlet />
            </div>
            {isDashboardHome && <div className="hidden lg:block"><RightPanel /></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AnimatedRoutes() {
  const location = useLocation();
  // Keying <Routes> by the full pathname would remount DashboardLayout (and
  // therefore Sidebar) on every tab click now that tabs are nested routes —
  // it only needs to change for genuine top-level transitions (landing →
  // login → dashboard shell, etc.). Nested /dashboard/* moves keep this key
  // stable; DashboardLayout's own inner key handles the tab-content swap.
  const topLevelKey = location.pathname.startsWith("/dashboard") ? "/dashboard" : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={topLevelKey}>

        {/* Landing page — always public */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages — redirect if already logged in */}
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected dashboard — each tab is now a real, bookmarkable,
            back/forward-navigable nested route instead of client-side
            tab state. Organization and Admin get role-gated at the
            routing layer (in addition to each page's own internal
            check) as defense-in-depth. */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index               element={<Dashboard />} />
          <Route path="donations"    element={<Donations />} />
          <Route path="campaigns"    element={<Campaigns />} />
          <Route path="volunteers"   element={<Volunteers />} />
          <Route path="reports"      element={<Reports />} />
          <Route
            path="organization"
            element={<ProtectedRoute allowedRoles={["ngo"]}><Organization /></ProtectedRoute>}
          />
          <Route
            path="admin"
            element={<ProtectedRoute allowedRoles={["admin"]}><Admin /></ProtectedRoute>}
          />
          {/* Unknown sub-route under /dashboard falls back to the overview
              instead of the global "*" redirect (which would bounce a
              signed-in user all the way out to the landing page). */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}