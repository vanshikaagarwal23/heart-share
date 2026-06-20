import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
}

const ROLE_LABELS = {
  donor: "Donor",
  ngo:   "NGO Manager",
  admin: "Administrator",
};

// Simple inline icons keep the sidebar text-led (no emoji) while still giving
// each destination a distinct, scannable mark.
const ICONS = {
  Dashboard: (
    <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.5" y="1.5" width="6" height="9.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1.5" y="9.5" width="6" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  Donations: (
    <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
      <path d="M8 13.5s-5.8-3.4-5.8-7.3A3 3 0 0 1 8 4.4a3 3 0 0 1 5.8 1.8c0 3.9-5.8 7.3-5.8 7.3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  Campaigns: (
    <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
      <path d="M2 9.5V3.8c2.4.6 5.2.6 7.6-.6 1-.5 2.2-.7 3.4-.4v6.8c-2.4-.6-5.2-.6-7.6.6-1 .5-2.2.7-3.4.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2 9.5V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Volunteers: (
    <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
      <circle cx="6" cy="5.2" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.8 13c.4-2.4 2.1-3.8 4.2-3.8s3.8 1.4 4.2 3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.5 3.4c1.2.2 2.1 1.2 2.1 2.6 0 1-.5 1.8-1.2 2.3M11.8 9.5c1.6.4 2.7 1.6 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Reports: (
    <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
      <path d="M3 13.5V8M7 13.5V3M11 13.5V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2 13.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Organization: (
    <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
      <path d="M3 13.5V3.2c0-.4.3-.7.7-.7h4.6c.4 0 .7.3.7.7v10.3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 6.8h3.3c.4 0 .7.3.7.7v6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 5.3h1.3M5 8h1.3M5 10.7h1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Admin: (
    <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
      <path d="M8 1.8 13 3.6v3.8c0 3.6-2.3 6-5 7-2.7-1-5-3.4-5-7V3.6L8 1.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
};

// Each nav label maps to a real URL under /dashboard, so the active tab is
// addressable, bookmarkable, and survives a refresh — previously this was
// plain React state, so reloading always bounced back to "Dashboard" and
// there was no way to deep-link to e.g. Admin.
const ROUTES = {
  Dashboard:    "/dashboard",
  Donations:    "/dashboard/donations",
  Campaigns:    "/dashboard/campaigns",
  Volunteers:   "/dashboard/volunteers",
  Reports:      "/dashboard/reports",
  Organization: "/dashboard/organization",
  Admin:        "/dashboard/admin",
};

export default function Sidebar({ onNavigate }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const NAV = [
    "Dashboard",
    "Donations",
    "Campaigns",
    "Volunteers",
    "Reports",
    ...(role === "ngo" ? ["Organization"] : []),
    ...(role === "admin" ? ["Admin"] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = user?.name || "User";
  const roleLabel   = ROLE_LABELS[role] || "Member";
  const initials    = getInitials(displayName);

  return (
    <div className="w-[200px] lg:w-[220px] bg-[#faf6f1] px-4 lg:px-5 py-6 flex flex-col h-screen rounded-[10px] border border-black/10 shadow-[0_4px_40px_rgba(0,0,0,0.08)]">

      <div className="flex items-center gap-2 text-[17px] font-['DM_Serif_Display'] text-[#2a2420] mb-6">
        <div className="w-[10px] h-[10px] bg-[#c0453a] rounded-full" />
        Heart Share
      </div>

      <div className="flex gap-[10px] p-3 bg-[#f0ebe4] rounded-[10px] mb-6 border border-black/[0.04]">
        <Avatar initials={initials} bg="#e8c1a0" text="#7a4a2a" size={34} />
        <div className="overflow-hidden">
          <div className="text-sm font-medium text-[#2a2420] truncate" title={displayName}>
            {displayName}
          </div>
          <div className="text-[11px] text-[#9a8f86] mt-0.5">{roleLabel}</div>
        </div>
      </div>

      <div className="text-[10px] font-medium tracking-wide text-[#b3a89d] uppercase px-[10px] mb-2">
        Menu
      </div>

      <nav className="flex flex-col gap-[2px]">
        {NAV.map((item) => {
          const path = ROUTES[item];
          // Dashboard's path ("/dashboard") is a prefix of every other nested
          // route, so it needs an exact match — everything else can match
          // by prefix in case a page ever grows its own sub-routes.
          const active = item === "Dashboard"
            ? location.pathname === path
            : location.pathname.startsWith(path);
          return (
            <div
              key={item}
              onClick={() => { navigate(path); onNavigate?.(); }}
              className={`flex items-center gap-2.5 px-[10px] py-[9px] rounded-[8px] cursor-pointer text-[13px] transition-colors ${
                active
                  ? "bg-[#c0453a] text-white font-medium shadow-sm"
                  : "text-[#665e57] hover:bg-[#f0e7e4] hover:text-[#3a322c]"
              }`}
            >
              <span className={active ? "text-white" : "text-[#b3a89d]"}>{ICONS[item]}</span>
              {item}
            </div>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto text-[12px] text-[#aaa] hover:text-[#c0453a] transition-colors text-left cursor-pointer pt-4 border-t border-black/5"
      >
        Log out
      </button>

    </div>
  );
}