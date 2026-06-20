import { useEffect, useState } from "react";
import { Trophy, Target, Inbox } from "lucide-react";
import Avatar from "../ui/Avatar";
import ProgressBar from "../ui/ProgressBar";
import { apiRequest } from "../../services/api";
import useCountUp from "../../hooks/useCountUp";

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const RANK_STYLE = ["rank-gold", "rank-silver", "rank-bronze"];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-[10px] mb-[10px]">
      <div className="w-[30px] h-[30px] rounded-full shimmer" />
      <div className="flex-1">
        <div className="h-3 shimmer rounded w-2/3 mb-1" />
        <div className="h-2 shimmer rounded w-1/3" />
      </div>
    </div>
  );
}

function AnimatedAmount({ amount }) {
  const animated = useCountUp(amount, 700);
  return <>₹{animated.toLocaleString("en-IN")}</>;
}

export default function RightPanel() {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [donRes, campRes] = await Promise.all([
          apiRequest("/donations"),
          apiRequest("/campaigns"),
        ]);
        setDonations(donRes.data || []);
        setCampaigns(campRes.data || []);
      } catch (err) {
        console.error("RightPanel error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const donorMap = {};
  donations
    .filter((d) => d.type === "money" && d.amount > 0)
    .forEach((d) => {
      const key = d.donor?.name || "Anonymous";
      donorMap[key] = (donorMap[key] || 0) + d.amount;
    });

  const topDonors = Object.entries(donorMap)
    .map(([name, amount]) => ({ name, amount, initials: getInitials(name) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const maxDonorAmount = topDonors[0]?.amount || 1;

  const topCampaigns = campaigns
    .map((c) => ({
      name: c.title,
      pct: Math.min(Math.floor(((c.raised || 0) / (c.goalAmount || 1)) * 100), 100),
      color: c.isActive ? "#22c55e" : "#94a3b8",
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  return (
    <div className="w-52.5 p-5 border-l overflow-y-auto" style={{ borderColor: "var(--color-border-soft)" }}>

      <div className="flex items-center gap-1.5 mb-4">
        <Trophy size={14} style={{ color: "var(--color-primary)" }} />
        <h4 className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>Top donors</h4>
      </div>

      {loading ? (
        <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
      ) : topDonors.length === 0 ? (
        <div className="flex flex-col items-center text-center py-6">
          <Inbox size={20} strokeWidth={1.5} style={{ color: "var(--color-text-faint)" }} />
          <div className="text-[11px] mt-2" style={{ color: "var(--color-text-faint)" }}>No money donations yet</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {topDonors.map((d, i) => {
            const relativeSize = 0.65 + 0.35 * (d.amount / maxDonorAmount); // #1 visually larger than #3
            return (
              <div
                key={d.name}
                className="flex items-center gap-2.5 stagger-item animate-rise-in"
                style={{ "--stagger-index": i, opacity: 0.55 + relativeSize * 0.45 }}
              >
                <div className="relative shrink-0">
                  <Avatar initials={d.initials} bg="#e8c1a0" text="#7a4a2a" size={Math.round(30 * relativeSize) + 4} />
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white ${RANK_STYLE[i]}`}
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate font-medium" style={{ color: "var(--color-text-primary)" }}>{d.name}</div>
                  <small className="text-[10.5px]" style={{ color: "var(--color-text-faint)" }}>Rank #{i + 1}</small>
                </div>
                <span className="text-sm font-semibold whitespace-nowrap tabular-nums" style={{ color: "var(--color-text-primary)" }}>
                  <AnimatedAmount amount={d.amount} />
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-6 mb-4">
        <Target size={14} style={{ color: "var(--color-primary)" }} />
        <h4 className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>Top campaigns</h4>
      </div>

      {loading ? (
        <><SkeletonRow /><SkeletonRow /></>
      ) : topCampaigns.length === 0 ? (
        <div className="flex flex-col items-center text-center py-6">
          <Inbox size={20} strokeWidth={1.5} style={{ color: "var(--color-text-faint)" }} />
          <div className="text-[11px] mt-2" style={{ color: "var(--color-text-faint)" }}>No campaigns yet</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {topCampaigns.map((c, i) => (
            <div key={c.name} className="stagger-item animate-rise-in" style={{ "--stagger-index": i + 3 }}>
              <div className="flex justify-between text-[12px] mb-1.5 gap-2">
                <span className="truncate" style={{ color: "var(--color-text-secondary)" }}>{c.name}</span>
                <span className="flex-shrink-0 font-semibold tabular-nums" style={{ color: "var(--color-text-primary)" }}>{c.pct}%</span>
              </div>
              <ProgressBar pct={c.pct} color={c.color} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}