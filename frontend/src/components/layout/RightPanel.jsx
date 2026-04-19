import { useEffect, useState } from "react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import { apiRequest } from "../../services/api";

export default function RightPanel() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest("/donations/getdonation");
        const data = res.data || res;
        setDonations(data);
      } catch (err) {
        console.error("RightPanel Error:", err.message);
      }
    };

    fetchData();
  }, []);

  // 🟢 Top donors logic
  const donorMap = {};
  donations.forEach((d) => {
    const key = d.donor?.name || "User";
    donorMap[key] = (donorMap[key] || 0) + (d.amount || 0);
  });

  const topDonors = Object.entries(donorMap)
    .map(([name, amount]) => ({
      name,
      amount,
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // 🔵 Campaign progress (based on status)
  const total = donations.length || 1;
  const accepted = donations.filter((d) => d.status === "accepted").length;
  const completed = donations.filter((d) => d.status === "completed").length;

  const campaigns = [
    {
      name: "Accepted",
      pct: Math.floor((accepted / total) * 100),
      color: "#22c55e",
    },
    {
      name: "Completed",
      pct: Math.floor((completed / total) * 100),
      color: "#3b82f6",
    },
  ];

  return (
    <div className="w-52.5 p-5 border-l border-[#eee]">
      
      <h4 className="mb-3 font-medium">Top donors</h4>

      {topDonors.map((d, i) => (
        <div key={d.name} className="flex items-center gap-[10px] mb-[10px]">
          <Avatar
            initials={d.initials}
            bg="#e8c1a0"
            text="#7a4a2a"
            size={30}
          />

          <div className="flex-1">
            <div className="text-sm">{d.name}</div>
            <small className="text-xs text-gray-500">#{i + 1} donor</small>
          </div>

          <span className="text-sm">₹{d.amount}</span>
        </div>
      ))}

      <h4 className="mt-4 mb-3 font-medium">Campaigns</h4>

      {campaigns.map((c) => (
        <div key={c.name} className="mb-3">
          <div className="flex justify-between text-[12px] mb-1">
            <span>{c.name}</span>
            <span>{c.pct}%</span>
          </div>
          <ProgressBar pct={c.pct} color={c.color} />
        </div>
      ))}
    </div>
  );
}