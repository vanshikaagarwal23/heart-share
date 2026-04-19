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
        const res = await apiRequest("/volunteers");
        const data = res.data || res;

        const formatted = data.map((v) => ({
          name: v.user?.name || "User",
          role: "Volunteer",
          hours: v.hours || 0,
          campaigns: v.campaigns?.length || 0,
          status: v.status,
          initials: (v.user?.name || "U")
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
    <div className="flex-1 p-7 flex flex-col overflow-hidden">
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="font-['DM_Serif_Display'] text-[22px] text-[#1a1a1a]">
            Volunteers
          </div>
          <div className="text-[12px] text-[#888] mt-[2px]">
            Team managing field operations
          </div>
        </div>

        <input
          placeholder="Search volunteers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-[12px] px-[14px] py-[7px] rounded-full border border-black/10 bg-[#f4f0ec] outline-none w-[180px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card>
          <div>Total Volunteers</div>
          <div>{volunteers.length}</div>
        </Card>

        <Card>
          <div>Active Now</div>
          <div>
            {volunteers.filter((v) => v.status === "Active").length}
          </div>
        </Card>

        <Card>
          <div>Total Hours</div>
          <div>
            {volunteers.reduce((a, v) => a + v.hours, 0)}
          </div>
        </Card>
      </div>

      <Card className="flex-1 overflow-y-auto">
        
        {filtered.length === 0 && (
          <div className="text-center text-[#aaa] text-[13px] py-10">
            No volunteers found.
          </div>
        )}

        {filtered.map((v, i) => (
          <div
            key={i}
            className={`flex items-center gap-[14px] py-3 ${
              i < filtered.length - 1
                ? "border-b border-black/5"
                : ""
            }`}
          >
            <Avatar
              initials={v.initials}
              bg={v.bg}
              text={v.text}
              size={38}
            />

            <div className="flex-1">
              <div className="text-[13px] font-medium text-[#1a1a1a]">
                {v.name}
              </div>
              <div className="text-[11px] text-[#888]">
                {v.role}
              </div>
            </div>

            <div className="text-right mr-4">
              <div className="text-[13px] font-medium text-[#1a1a1a]">
                {v.hours}h
              </div>
              <div className="text-[11px] text-[#aaa]">
                {v.campaigns} campaigns
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