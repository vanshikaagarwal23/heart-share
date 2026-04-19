import Avatar from "../ui/Avatar";

export default function Sidebar({ activePage, setActivePage }) {

  // 🆕 role detection
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      role = decoded.role;
    } catch (err) {
      console.error("Token decode error");
    }
  }

  // 🆕 dynamic nav
  const NAV = [
    "Dashboard",
    "Donations",
    "Campaigns",
    "Volunteers",
    "Reports",
    ...(role === "admin" ? ["Admin"] : []), // ✅ only admin sees this
  ];

  return (
    <div className="w-[200px] lg:w-[220px] bg-[#faf6f1] px-4 lg:px-5 py-6 flex flex-col h-screen rounded-[10px] border border-black/10 shadow-[0_4px_40px_rgba(0,0,0,0.08)]">
      
      <div className="flex items-center gap-2 text-[17px] font-['DM_Serif_Display'] mb-5">
        <div className="w-[10px] h-[10px] bg-[#c0453a] rounded-full" />
        Heart Share
      </div>

      <div className="flex gap-[10px] p-3 bg-[#f0ebe4] rounded-[10px] mb-6">
        <Avatar initials="NA" bg="#e8c1a0" text="#7a4a2a" size={34} />
        <div>
          <div className="text-sm font-medium">NGO Admin</div>
          <div className="text-xs text-gray-500">Volunteer Lead</div>
        </div>
      </div>

      <nav className="flex flex-col gap-[6px]">
        {NAV.map((item) => (
          <div
            key={item}
            onClick={() => setActivePage(item)}
            className={`px-[10px] py-[10px] rounded-[8px] cursor-pointer text-[#555] hover:bg-[#f3ecea] ${
              activePage === item
                ? "bg-[#efe7e5] text-[#c0453a]"
                : ""
            }`}
          >
            {item}
          </div>
        ))}
      </nav>

      <div className="mt-auto text-[12px] text-[#aaa] cursor-pointer">
        Log out
      </div>
    </div>
  );
}