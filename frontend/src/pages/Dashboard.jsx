import { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Clock, CheckCircle2, Megaphone, Wallet, Package, HeartHandshake,
  TrendingUp, ArrowUpRight, Sparkles,
} from "lucide-react";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Skeleton from "../components/common/Skeleton";
import Pagination from "../components/common/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useCountUp from "../hooks/useCountUp";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_FILTERS = ["all", "pending", "accepted", "completed", "rejected"];
const PAGE_SIZE = 6;

// Splits a formatted currency/number string into prefix + animatable digits,
// so "₹12,400" count-up renders the symbol once and ticks the number live.
function splitValue(value) {
  if (typeof value === "number") return { prefix: "", numeric: value, suffix: "" };
  const match = String(value).match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return { prefix: "", numeric: null, suffix: String(value) };
  return { prefix: match[1], numeric: Number(match[2].replace(/,/g, "")), suffix: match[3] };
}

function AnimatedValue({ value, locale = "en-IN" }) {
  const { prefix, numeric, suffix } = splitValue(value);
  const animated = useCountUp(numeric ?? 0);
  if (numeric === null) return <>{value}</>;
  return <>{prefix}{animated.toLocaleString(locale)}{suffix}</>;
}

// ── Secondary stat card — compact, sits beside the hero metric ─────────────
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card padding="p-3.5" className="flex items-center gap-3 lift-on-hover">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}17`, color: accent }}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] truncate" style={{ color: "var(--color-text-muted)" }}>{label}</div>
        <div className="text-[18px] font-semibold leading-tight tabular-nums" style={{ color: "var(--color-text-primary)" }}>
          <AnimatedValue value={value} />
        </div>
        <div className="text-[10.5px] mt-0.5" style={{ color: "var(--color-text-faint)" }}>{sub}</div>
      </div>
    </Card>
  );
}

// ── Hero metric — the one number each role should see first, with depth ────
function HeroMetric({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="hero-glow flex items-center gap-4" padding="p-5">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1F`, color: accent }}
      >
        <Icon size={26} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] mb-0.5 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </div>
        <div className="text-[32px] font-semibold leading-tight tracking-tight tabular-nums" style={{ color: "var(--color-text-primary)" }}>
          <AnimatedValue value={value} />
        </div>
        <div className="flex items-center gap-1 text-[11px] mt-1 font-medium" style={{ color: accent }}>
          <TrendingUp size={12} />
          {sub}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, role } = useAuth();
  const toast = useToast();

  const [donations,    setDonations]    = useState([]);
  const [campaigns,    setCampaigns]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [donRes, campRes] = await Promise.all([
          apiRequest("/donations"),
          apiRequest("/campaigns"),
        ]);
        setDonations(donRes.data  || []);
        setCampaigns(campRes.data || []);
      } catch (err) {
        toast.error(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => { setPage(1); }, [statusFilter]);

  // ── Derived stats ──────────────────────────────────────────────────────
  const totalRaised    = donations.reduce((a, d) => a + (d.amount || 0), 0);
  const pendingCount   = donations.filter((d) => d.status === "pending").length;
  const completedCount = donations.filter((d) => d.status === "completed").length;
  const activeCamps    = campaigns.filter((c) => c.isActive).length;

  const monthlyData = MONTHS.map((month, i) => ({
    month,
    amount: donations
      .filter((d) => new Date(d.createdAt).getMonth() === i)
      .reduce((sum, d) => sum + (d.amount || 0), 0),
  }));

  // This month vs last month, to give the chart header a real signal instead
  // of a flat "total raised" repeat of the hero stat.
  const now = new Date();
  const thisMonthIdx = now.getMonth();
  const lastMonthIdx = (thisMonthIdx + 11) % 12;
  const thisMonthAmt = monthlyData[thisMonthIdx]?.amount || 0;
  const lastMonthAmt = monthlyData[lastMonthIdx]?.amount || 0;
  const momChange = lastMonthAmt > 0 ? Math.round(((thisMonthAmt - lastMonthAmt) / lastMonthAmt) * 100) : null;

  const allFiltered = useMemo(
    () => (statusFilter === "all" ? donations : donations.filter((d) => d.status === statusFilter)),
    [donations, statusFilter]
  );
  const pageCount = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));
  const pageItems = allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const HERO = role === "ngo"
    ? { icon: Clock,    label: "Pending donations", value: pendingCount, sub: pendingCount > 0 ? "needs your review" : "all caught up", accent: "#f5a623" }
    : role === "admin"
    ? { icon: Wallet,   label: "Total raised platform-wide", value: `₹${totalRaised.toLocaleString("en-IN")}`, sub: "across all NGOs", accent: "#22c55e" }
    : { icon: HeartHandshake, label: "My total donated", value: `₹${totalRaised.toLocaleString("en-IN")}`, sub: donations.length > 0 ? `${donations.length} contribution${donations.length === 1 ? "" : "s"}` : "make your first one", accent: "#22c55e" };

  const SECONDARY = role === "ngo"
    ? [
        { icon: CheckCircle2, label: "Completed",       value: completedCount, sub: "delivered",  accent: "#22c55e" },
        { icon: Megaphone,    label: "Active campaigns", value: activeCamps,    sub: "running now", accent: "#c0453a" },
      ]
    : role === "admin"
    ? [
        { icon: Package,   label: "Total donations",  value: donations.length, sub: "all records", accent: "#ff6600" },
        { icon: Megaphone, label: "Active campaigns", value: activeCamps,      sub: "running now",  accent: "#c0453a" },
      ]
    : [
        { icon: Package,      label: "My donations", value: donations.length, sub: "submitted",        accent: "#ff6600" },
        { icon: CheckCircle2, label: "Completed",    value: completedCount,   sub: "delivered to NGO",  accent: "#c0453a" },
      ];

  const firstName = user?.name?.split(" ")[0];
  const greeting  = firstName ? `Welcome back, ${firstName}` : "Impact dashboard";

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col gap-5 overflow-y-auto">

      <PageHeader title={greeting} subtitle="Overview of your activity this year" />

      {/* Stat row — hero metric carries real visual weight, secondary stats fill the rest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? <Skeleton.StatCard /> : <HeroMetric {...HERO} />}
        <div className="grid grid-cols-2 gap-3">
          {loading
            ? [1, 2].map((k) => <Skeleton.StatCard key={k} compact />)
            : SECONDARY.map((s) => <StatCard key={s.label} {...s} />)
          }
        </div>
      </div>

      {/* Monthly donations chart */}
      <Card className="lift-on-hover">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Monthly donations (₹)
          </div>
          {!loading && totalRaised > 0 && (
            <div className="flex items-center gap-3">
              {momChange !== null && (
                <span
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: momChange >= 0 ? "var(--status-accepted-fg)" : "var(--status-rejected-fg)",
                    backgroundColor: momChange >= 0 ? "var(--status-accepted-bg)" : "var(--status-rejected-bg)",
                  }}
                >
                  <ArrowUpRight size={12} style={{ transform: momChange < 0 ? "rotate(90deg)" : "none" }} />
                  {momChange >= 0 ? "+" : ""}{momChange}% vs last month
                </span>
              )}
            </div>
          )}
        </div>
        {loading ? <Skeleton.Chart h={180} /> : totalRaised === 0 ? (
          <EmptyState
            icon={<TrendingUp size={26} strokeWidth={1.5} />}
            title="No donation activity yet"
            subtitle="This chart fills in once monetary donations start coming through."
          />
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c0453a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#c0453a" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #f0ebe4", boxShadow: "var(--shadow-md)" }}
                formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]}
                cursor={{ stroke: "#c0453a", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone" dataKey="amount" stroke="#c0453a" strokeWidth={2.5}
                fill="url(#colorAmt)" dot={{ r: 3, fill: "#c0453a", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#c0453a", stroke: "#fff", strokeWidth: 2 }}
                animationDuration={1100} animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent donations table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: "var(--color-text-secondary)" }}>
            <Sparkles size={13} style={{ color: "var(--color-accent)" }} />
            Recent donations
          </div>

          {role === "ngo" && (
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border capitalize transition-all"
                  style={
                    statusFilter === s
                      ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff", transform: "scale(1.04)" }
                      : { backgroundColor: "var(--color-bg-sidebar-tile)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-1">{[1,2,3].map((k) => <Skeleton.Row key={k} />)}</div>
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={<Package size={26} strokeWidth={1.5} />}
            title="No donations found"
            subtitle={
              role === "donor"
                ? "Head to the Donations tab to make your first contribution."
                : "Donations will appear here once donors start contributing."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left border-b" style={{ color: "var(--color-text-faint)", borderColor: "var(--color-border-soft)" }}>
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((d, i) => (
                    <tr
                      key={d._id}
                      className="border-b last:border-0 transition-colors stagger-item animate-rise-in"
                      style={{ borderColor: "var(--color-border-soft)", "--stagger-index": i }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="py-2.5 pr-3 font-medium max-w-[140px] truncate" style={{ color: "var(--color-text-secondary)" }}>{d.title}</td>
                      <td className="py-2.5 pr-3 capitalize" style={{ color: "var(--color-text-muted)" }}>{d.type}</td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                        {d.type === "money" ? `₹${(d.amount||0).toLocaleString("en-IN")}` : `${d.quantity||1} item(s)`}
                      </td>
                      <td className="py-2.5 pr-3" style={{ color: "var(--color-text-muted)" }}>
                        {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-2.5"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} total={allFiltered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}