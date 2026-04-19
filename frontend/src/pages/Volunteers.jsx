import { useState, useEffect } from "react";
import StatusBadge from "../components/ui/StatusBadge";
import Avatar from "../components/ui/Avatar";
import Card from "../components/common/Card";
import { apiRequest } from "../services/api";

function VolunteersPage() {
  const [search, setSearch] = useState("");
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await apiRequest("/volunteers/my");
        const data = res.data || res;

        const formatted = data.map((v) => ({
          name: v.user?.name || "You",
          role: "Volunteer",
          hours: 0,
          campaigns: v.campaign ? 1 : 0,
          status:
            v.status === "approved"
              ? "Active"
              : v.status === "rejected"
              ? "Inactive"
              : "Pending",
          initials: (v.user?.name || "Y")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2),
          bg: "#e8c1a0",
          text: "#7a4a2a",
        }));

        setVolunteers(formatted);
      } catch (err) {
        console.error("Volunteer UI Error:", err.message);
      }
    };

    fetchVolunteers();
  }, []);

  const filtered = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 md:p-7 flex flex-col">

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
        <div>
          <div className="font-['DM_Serif_Display'] text-xl md:text-2xl text-[#1a1a1a]">
            Volunteers
          </div>
          <div className="text-xs text-[#888] mt-[2px]">
            Your volunteering activity
          </div>
        </div>

        <input
          placeholder="Search volunteers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs px-4 py-2 rounded-full border border-black/10 bg-[#f4f0ec] outline-none w-full sm:w-[200px] focus:ring-2 focus:ring-[#ff6600]/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Card>
          <div className="text-sm text-[#777]">Total</div>
          <div className="text-lg font-semibold">{volunteers.length}</div>
        </Card>

        <Card>
          <div className="text-sm text-[#777]">Approved</div>
          <div className="text-lg font-semibold">
            {volunteers.filter((v) => v.status === "Active").length}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-[#777]">Pending</div>
          <div className="text-lg font-semibold">
            {volunteers.filter((v) => v.status === "Pending").length}
          </div>
        </Card>
      </div>

      <Card className="flex-1 overflow-y-auto">
        
        {filtered.length === 0 && (
          <div className="text-center text-[#aaa] text-sm py-10">
            No volunteering activity yet.
          </div>
        )}

        {filtered.map((v, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 py-3 ${
              i < filtered.length - 1 ? "border-b border-black/5" : ""
            }`}
          >
            <Avatar
              initials={v.initials}
              bg={v.bg}
              text={v.text}
              size={36}
            />

            <div className="flex-1">
              <div className="text-sm font-medium text-[#1a1a1a]">
                {v.name}
              </div>
              <div className="text-xs text-[#888]">
                {v.role}
              </div>
            </div>

            <div className="text-right mr-2">
              <div className="text-sm font-medium text-[#1a1a1a]">
                {v.campaigns}
              </div>
              <div className="text-xs text-[#aaa]">
                campaigns
              </div>
            </div>

            <StatusBadge status={v.status} />
          </div>
        ))}

      </Card>

    </div>
  );
}

export default VolunteersPage;