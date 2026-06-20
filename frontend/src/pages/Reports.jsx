import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Wallet, Megaphone, Package, BarChart3, Download, PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Skeleton from "../components/common/Skeleton";
import Pagination from "../components/common/Pagination";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useCountUp from "../hooks/useCountUp";

const PIE_COLORS = ["#c0453a", "#ff6600", "#e07b39", "#b03a2e", "#f5a623"];
const PAGE_SIZE = 8;

function splitValue(value) {
  if (typeof value === "number") return { prefix: "", numeric: value, suffix: "" };
  const match = String(value).match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return { prefix: "", numeric: null, suffix: String(value) };
  return { prefix: match[1], numeric: Number(match[2].replace(/,/g, "")), suffix: match[3] };
}
function AnimatedValue({ value }) {
  const { prefix, numeric, suffix } = splitValue(value);
  const animated = useCountUp(numeric ?? 0);
  if (numeric === null) return <>{value}</>;
  return <>{prefix}{animated.toLocaleString("en-IN")}{suffix}</>;
}

// ── Export campaign data as CSV ─────────────────────────────────────────
function exportCampaignsCSV(campaigns) {
  const headers = ["Campaign", "Raised", "Goal", "Progress %", "Donations", "Status", "Created"];
  const rows = campaigns.map((c) => [
    `"${c.title.replace(/"/g, '""')}"`,
    c.raised,
    c.goalAmount || 0,
    c.pct,
    c.donationsCount || 0,
    c.isActive ? "Active" : "Inactive",
    new Date(c.createdAt).toLocaleDateString("en-IN"),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `heartshare-campaigns-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Export a donor's own donation history as CSV ────────────────────────
function exportDonationsCSV(donations) {
  const headers = ["Title", "Type", "Amount/Qty", "Campaign", "Status", "Date"];
  const rows = donations.map((d) => [
    `"${(d.title || "").replace(/"/g, '""')}"`,
    d.type,
    d.type === "money" ? d.amount || 0 : d.quantity || 0,
    `"${(d.campaign?.title || "").replace(/"/g, '""')}"`,
    d.status,
    new Date(d.createdAt).toLocaleDateString("en-IN"),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `heartshare-my-donations-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StatCard({ icon: Icon, label, value, sub, accent, hero }) {
  return (
    <Card className={`flex items-start gap-3 lift-on-hover ${hero ? "hero-glow" : ""}`} padding={hero ? "p-5" : "p-4"}>
      <div
        className={`rounded-xl flex items-center justify-center shrink-0 ${hero ? "w-11 h-11" : "w-9 h-9"}`}
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={hero ? 20 : 16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{label}</div>
        <div className={`font-semibold leading-tight tabular-nums ${hero ? "text-[22px]" : "text-[18px]"}`} style={{ color: "var(--color-text-primary)" }}>
          <AnimatedValue value={value} />
        </div>
        <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--color-text-faint)" }}>{sub}</div>
      </div>
    </Card>
  );
}

export default function ReportsPage() {
  const { role } = useAuth();
  const toast = useToast();
  const isDonor = role === "donor";

  const [campaigns,  setCampaigns]  = useState([]);
  const [donations,  setDonations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [campRes, donRes] = await Promise.all([
          apiRequest("/campaigns"),
          // /donations already comes back donor-scoped from the backend
          // when role === "donor" — this is each donor's own history, not
          // a platform-wide list, so no extra filtering is needed here.
          apiRequest("/donations"),
        ]);

        const camps = (campRes.data || []).map((c) => ({
          ...c,
          raised: c.raised || 0,
          pct:    Math.min(Math.floor(((c.raised || 0) / (c.goalAmount || 1)) * 100), 100),
          color:  c.isActive ? "#c0453a" : "#a39a8e",
        }));

        setCampaigns(camps);
        setDonations(donRes.data || []);
      } catch (err) {
        toast.error(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Donor-scoped metrics ───────────────────────────────────────────────
  // A donor's report is about their own giving, not the platform's overall
  // fundraising — campaign-level totals belong to NGOs/admins, who can see
  // (and are accountable for) every campaign's performance. Showing a donor
  // every other donor's contributions and every NGO's campaign numbers was
  // an unintentional over-share, not a deliberate transparency feature.
  const myTotalGiven    = donations.reduce((a, d) => a + (d.amount || 0), 0);
  const myCompletedCount = donations.filter((d) => d.status === "completed").length;
  const myCampaignsSupported = new Set(donations.map((d) => d.campaign?._id).filter(Boolean)).size;

  // Note: the donation-status pie chart further down reuses `statusCounts`
  // (defined below) rather than a separate donor-only variant — it's built
  // from `donations`, which the backend already scopes to "my donations"
  // for a donor, so the same derived value is correct for both views.

  const myDonationsByCampaign = Object.values(
    donations.reduce((acc, d) => {
      const key = d.campaign?.title || "General giving";
      acc[key] = acc[key] || { name: key.length > 14 ? key.slice(0, 14) + "…" : key, raised: 0 };
      acc[key].raised += d.amount || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.raised - a.raised).slice(0, 6);

  const DONOR_STATS = [
    { icon: Wallet,    label: "Total given",       value: `₹${myTotalGiven.toLocaleString("en-IN")}`, sub: `across ${donations.length} donation${donations.length !== 1 ? "s" : ""}`, accent: "#22c55e", hero: true },
    { icon: Package,   label: "Completed",         value: myCompletedCount, sub: "donations fulfilled", accent: "#ff6600" },
    { icon: Megaphone, label: "Campaigns supported", value: myCampaignsSupported, sub: "unique campaigns", accent: "#c0453a" },
    { icon: BarChart3, label: "Avg donation",      value: donations.length ? `₹${Math.floor(myTotalGiven / donations.length).toLocaleString("en-IN")}` : "₹0", sub: "per contribution", accent: "#5a4a7a" },
  ];

  // ── Platform-wide metrics (NGO / admin) ────────────────────────────────
  const totalRaised = campaigns.reduce((a, c) => a + c.raised, 0);
  const totalGoal   = campaigns.reduce((a, c) => a + (c.goalAmount || 0), 0);
  const activeCamps = campaigns.filter((c) => c.isActive).length;
  const totalDonors = new Set(donations.map((d) => d.donor?._id).filter(Boolean)).size;
  const fundedPct   = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;

  const barData = [...campaigns]
    .sort((a, b) => b.raised - a.raised)
    .slice(0, 6)
    .map((c) => ({
      name:   c.title.length > 14 ? c.title.slice(0, 14) + "…" : c.title,
      raised: c.raised,
    }));

  const statusCounts = ["pending", "accepted", "completed", "rejected"].map((s) => ({
    name:  s.charAt(0).toUpperCase() + s.slice(1),
    value: donations.filter((d) => d.status === s).length,
  })).filter((s) => s.value > 0);

  const STATS = [
    { icon: Wallet,    label: "Total raised",     value: `₹${totalRaised.toLocaleString("en-IN")}`, sub: `of ₹${totalGoal.toLocaleString("en-IN")} goal`, accent: "#22c55e", hero: true },
    { icon: Megaphone, label: "Total campaigns",  value: campaigns.length, sub: `${activeCamps} active` , accent: "#c0453a" },
    { icon: Package,   label: "Total donations",  value: donations.length, sub: `from ${totalDonors} donor${totalDonors !== 1 ? "s" : ""}`, accent: "#ff6600" },
    { icon: BarChart3, label: "Avg per campaign", value: campaigns.length ? `₹${Math.floor(totalRaised / campaigns.length).toLocaleString("en-IN")}` : "₹0", sub: "raised per campaign", accent: "#5a4a7a" },
  ];

  const pageCount = Math.max(1, Math.ceil((isDonor ? donations.length : campaigns.length) / PAGE_SIZE));
  const pageItems = isDonor ? donations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : campaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col gap-5 overflow-y-auto">

      <PageHeader
        title="Reports"
        subtitle={isDonor ? "Your giving history and impact" : "Campaign and donation analytics"}
        actions={
          isDonor
            ? !loading && donations.length > 0 && (
                <button
                  onClick={() => exportDonationsCSV(donations)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition font-medium"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-sidebar-tile)", color: "var(--color-text-secondary)" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              )
            : !loading && campaigns.length > 0 && (
                <button
                  onClick={() => exportCampaignsCSV(campaigns)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition font-medium"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-sidebar-tile)", color: "var(--color-text-secondary)" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              )
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading
          ? [1,2,3,4].map((k) => <Skeleton.StatCard key={k} compact={k > 1} />)
          : (isDonor ? DONOR_STATS : STATS).map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Card className="lift-on-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: "var(--color-text-secondary)" }}>
              <TrendingUp size={14} style={{ color: "var(--color-primary)" }} />
              {isDonor ? "Your giving by campaign" : "Top campaigns by amount raised"}
            </div>
          </div>
          {loading ? <Skeleton.Chart h={200} /> : (isDonor ? myDonationsByCampaign : barData).length === 0 ? (
            <EmptyState icon={<BarChart3 size={24} strokeWidth={1.5} />} title={isDonor ? "No donations yet" : "No campaign data yet"} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={isDonor ? myDonationsByCampaign : barData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #f0ebe4", boxShadow: "var(--shadow-md)" }}
                  formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, isDonor ? "Given" : "Raised"]}
                  cursor={{ fill: "rgba(192,69,58,0.06)" }}
                />
                <Bar dataKey="raised" fill="#c0453a" radius={[5, 5, 0, 0]} animationDuration={900} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="lift-on-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: "var(--color-text-secondary)" }}>
              <PieIcon size={14} style={{ color: "var(--color-primary)" }} />
              Donation status breakdown
            </div>
          </div>
          {loading ? <Skeleton.Chart h={200} /> : statusCounts.length === 0 ? (
            <EmptyState icon={<PieIcon size={24} strokeWidth={1.5} />} title="No donation data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                  animationDuration={900} animationEasing="ease-out"
                >
                  {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #f0ebe4", boxShadow: "var(--shadow-md)" }} formatter={(v, name) => [v, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#888" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Funding progress summary strip — platform-wide context only makes
          sense for NGOs/admins, who are accountable for it */}
      {!isDonor && !loading && totalGoal > 0 && (
        <Card className="flex items-center gap-4 lift-on-hover">
          <div className="flex-1">
            <div className="flex justify-between text-[12px] mb-1.5">
              <span style={{ color: "var(--color-text-secondary)" }}>Platform-wide funding progress</span>
              <span className="font-semibold tabular-nums" style={{ color: "var(--color-text-primary)" }}>{fundedPct}%</span>
            </div>
            <ProgressBar pct={fundedPct} color="#c0453a" />
          </div>
        </Card>
      )}

      {/* Bottom table: a donor's own donation history, or — for NGOs/admins —
          every campaign on the platform */}
      <Card>
        <div className="text-[13px] font-medium mb-4" style={{ color: "var(--color-text-secondary)" }}>
          {isDonor ? "Your donation history" : "All campaigns"}
        </div>
        {loading ? (
          <div className="space-y-1">{[1,2,3].map((k) => <Skeleton.Row key={k} />)}</div>
        ) : isDonor ? (
          donations.length === 0 ? (
            <EmptyState icon={<Package size={24} strokeWidth={1.5} />} title="No donations yet" subtitle="Your giving history will show up here once you make a donation." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left border-b" style={{ color: "var(--color-text-faint)", borderColor: "var(--color-border-soft)" }}>
                      <th className="pb-2 font-medium">Title</th>
                      <th className="pb-2 font-medium">Campaign</th>
                      <th className="pb-2 font-medium">Amount/Qty</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
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
                        <td className="py-2.5 pr-3 max-w-[120px] truncate" style={{ color: "var(--color-text-muted)" }}>{d.campaign?.title || "—"}</td>
                        <td className="py-2.5 pr-3 tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                          {d.type === "money" ? `₹${(d.amount || 0).toLocaleString("en-IN")}` : `${d.quantity || 1} item(s)`}
                        </td>
                        <td className="py-2.5 pr-3"><StatusBadge status={d.status} /></td>
                        <td className="py-2.5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>{new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageCount={pageCount} total={donations.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )
        ) : campaigns.length === 0 ? (
          <EmptyState icon={<Megaphone size={24} strokeWidth={1.5} />} title="No campaigns found" subtitle="Reports will populate once campaigns are created." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left border-b" style={{ color: "var(--color-text-faint)", borderColor: "var(--color-border-soft)" }}>
                    <th className="pb-2 font-medium">Campaign</th>
                    <th className="pb-2 font-medium">Raised</th>
                    <th className="pb-2 font-medium">Goal</th>
                    <th className="pb-2 font-medium w-28">Progress</th>
                    <th className="pb-2 font-medium">Donations</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c, i) => (
                    <tr
                      key={c._id}
                      className="border-b last:border-0 transition-colors stagger-item animate-rise-in"
                      style={{ borderColor: "var(--color-border-soft)", "--stagger-index": i }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="py-2.5 pr-3 font-medium max-w-[140px] truncate" style={{ color: "var(--color-text-secondary)" }}>{c.title}</td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{ color: "var(--color-text-secondary)" }}>₹{c.raised.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{ color: "var(--color-text-muted)" }}>₹{(c.goalAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="py-2.5 pr-3 w-28">
                        <div className="flex items-center gap-1.5">
                          <ProgressBar pct={c.pct} color={c.color} />
                          <span className="text-[10px] whitespace-nowrap tabular-nums" style={{ color: "var(--color-text-muted)" }}>{c.pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{ color: "var(--color-text-muted)" }}>{c.donationsCount || 0}</td>
                      <td className="py-2.5"><StatusBadge status={c.isActive ? "active" : "inactive"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} total={campaigns.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>

    </div>
  );
}