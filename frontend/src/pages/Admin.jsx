import { useEffect, useState } from "react";
import {
  Users, Building2, Wallet, Package, ShieldOff, Search,
  ShieldCheck, ShieldX, UserCheck, UserX, Lock,
} from "lucide-react";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Skeleton from "../components/common/Skeleton";
import Pagination from "../components/common/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import Avatar from "../components/ui/Avatar";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useCountUp from "../hooks/useCountUp";

const PAGE_SIZE = 8;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const ROLE_STYLE = {
  admin: { bg: "#f0e8f5", fg: "#7a4a9a" },
  ngo:   { bg: "#e8eefb", fg: "#1e4ba8" },
  donor: { bg: "#fff0e0", fg: "#b35c00" },
};

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

function StatCard({ icon: Icon, label, value, sub, accent, hero, loading }) {
  if (loading) return <Skeleton.StatCard compact={!hero} />;
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
        <div className={`font-semibold leading-tight tabular-nums ${hero ? "text-[22px]" : "text-[20px]"}`} style={{ color: "var(--color-text-primary)" }}>
          <AnimatedValue value={value} />
        </div>
        {sub && <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--color-text-faint)" }}>{sub}</div>}
      </div>
    </Card>
  );
}

export default function AdminPage() {
  const { role } = useAuth();
  const toast = useToast();

  const [tab,      setTab]      = useState("ngos");
  const [ngos,     setNgos]     = useState([]);
  const [users,    setUsers]    = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);

  const isAdmin = role === "admin";

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ngoRes, userRes, statRes] = await Promise.all([
        apiRequest("/ngo/all"),
        apiRequest("/ngo/users"),
        apiRequest("/ngo/stats"),
      ]);
      setNgos(ngoRes.data   || []);
      setUsers(userRes.data || []);
      setStats(statRes.data || null);
    } catch (err) {
      toast.error(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  // Hooks must run unconditionally on every render (Rules of Hooks), so the
  // role check happens *inside* the effect rather than by skipping the
  // useEffect call itself — the early return below still prevents any of
  // this data from reaching the page for a non-admin.
  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);
  useEffect(() => { setPage(1); }, [tab, search]);

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          icon={<Lock size={26} strokeWidth={1.5} />}
          title="Admin access required"
          subtitle="You don't have permission to view this page."
        />
      </div>
    );
  }

  const handleVerify = async (id) => {
    if (updating) return;
    try {
      setUpdating(id);
      const res = await apiRequest(`/ngo/verify/${id}`, "PATCH");
      toast.success(res.message || "NGO status updated");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to update NGO");
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleUser = async (id) => {
    if (updating) return;
    try {
      setUpdating(id);
      const res = await apiRequest(`/ngo/users/${id}/toggle`, "PATCH");
      toast.success(res.message || "User status updated");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  const filteredNGOs = ngos.filter((n) =>
    n.name?.toLowerCase().includes(search.toLowerCase()) ||
    n.user?.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeList = tab === "ngos" ? filteredNGOs : filteredUsers;
  const pageCount  = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const pageItems  = activeList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STAT_CARDS = stats
    ? [
        { icon: Wallet,    label: "Total raised",    value: `₹${(stats.totalRaised || 0).toLocaleString("en-IN")}`, sub: "from money donations", accent: "#22c55e", hero: true },
        { icon: Users,     label: "Total users",     value: stats.totalUsers, sub: "all accounts", accent: "#5a4a7a" },
        { icon: Building2, label: "Total NGOs",      value: stats.totalNGOs, sub: `${stats.verifiedNGOs} verified, ${stats.pendingNGOs} pending`, accent: "#c0453a" },
        { icon: Package,   label: "Total donations", value: stats.totalDonations, sub: `across ${stats.totalCampaigns} campaigns`, accent: "#ff6600" },
      ]
    : [];

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col gap-5 overflow-y-auto">

      <PageHeader title="Admin Panel" subtitle="Platform management and oversight" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading || !stats
          ? [1,2,3,4].map((k) => <StatCard key={k} loading hero={k === 1} />)
          : STAT_CARDS.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex gap-1.5">
          {[
            { id: "ngos",  label: `NGOs (${ngos.length})`,  icon: Building2 },
            { id: "users", label: `Users (${users.length})`, icon: Users },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(""); }}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition font-medium"
              style={
                tab === t.id
                  ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                  : { backgroundColor: "var(--color-bg-sidebar-tile)", color: "var(--color-text-secondary)" }
              }
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
          <input
            placeholder={`Search ${tab === "ngos" ? "NGOs" : "users"}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-9 pr-4 py-2.5 rounded-full border w-full outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-shadow"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-sidebar-tile)" }}
          />
        </div>
      </div>

      {/* ── NGOs tab ───────────────────────────────────────────────────── */}
      {tab === "ngos" && (
        <Card className="flex-1 overflow-auto flex flex-col">
          {loading ? (
            <div className="space-y-1">{[1,2,3,4].map((k) => <Skeleton.Row key={k} />)}</div>
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={<Building2 size={26} strokeWidth={1.5} />}
              title={ngos.length === 0 ? "No NGOs registered yet" : "No results match your search"}
              subtitle={ngos.length === 0 ? "NGO profiles will appear here once NGOs sign up and register." : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left border-b" style={{ color: "var(--color-text-faint)", borderColor: "var(--color-border-soft)" }}>
                      <th className="pb-3 font-medium">NGO</th>
                      <th className="pb-3 font-medium hidden sm:table-cell">Contact</th>
                      <th className="pb-3 font-medium hidden md:table-cell">Registered</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((ngo, i) => (
                      <tr
                        key={ngo._id}
                        className="border-b last:border-0 transition-colors stagger-item animate-rise-in"
                        style={{ borderColor: "var(--color-border-soft)", "--stagger-index": i }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-sunken)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <Avatar initials={getInitials(ngo.name)} bg="#f0d4c4" text="#c0453a" size={32} />
                            <div className="min-w-0">
                              <div className="font-medium truncate max-w-[120px]" style={{ color: "var(--color-text-primary)" }}>{ngo.name}</div>
                              <div className="text-xs truncate max-w-[120px]" style={{ color: "var(--color-text-muted)" }}>{ngo.user?.email || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 hidden sm:table-cell" style={{ color: "var(--color-text-secondary)" }}>{ngo.contactNumber || "—"}</td>
                        <td className="py-3 pr-3 hidden md:table-cell" style={{ color: "var(--color-text-muted)" }}>
                          {new Date(ngo.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 pr-3"><StatusBadge status={ngo.isVerified ? "verified" : "pending"} /></td>
                        <td className="py-3">
                          <button
                            onClick={() => handleVerify(ngo._id)}
                            disabled={updating === ngo._id}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-60"
                            style={
                              ngo.isVerified
                                ? { backgroundColor: "var(--status-rejected-bg)", color: "var(--status-rejected-fg)" }
                                : { backgroundColor: "var(--status-accepted-bg)", color: "var(--status-accepted-fg)" }
                            }
                          >
                            {updating === ngo._id ? "Updating…" : ngo.isVerified
                              ? <><ShieldX size={12} /> Revoke</>
                              : <><ShieldCheck size={12} /> Verify</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageCount={pageCount} total={activeList.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </Card>
      )}

      {/* ── Users tab ──────────────────────────────────────────────────── */}
      {tab === "users" && (
        <Card className="flex-1 overflow-auto flex flex-col">
          {loading ? (
            <div className="space-y-1">{[1,2,3,4,5].map((k) => <Skeleton.Row key={k} />)}</div>
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={<Users size={26} strokeWidth={1.5} />}
              title={users.length === 0 ? "No users found" : "No results match your search"}
            />
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left border-b" style={{ color: "var(--color-text-faint)", borderColor: "var(--color-border-soft)" }}>
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium hidden sm:table-cell">Role</th>
                      <th className="pb-3 font-medium hidden md:table-cell">Joined</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((u, i) => {
                      const roleStyle = ROLE_STYLE[u.role] || ROLE_STYLE.donor;
                      return (
                        <tr
                          key={u._id}
                          className="border-b last:border-0 transition-colors stagger-item animate-rise-in"
                          style={{ borderColor: "var(--color-border-soft)", "--stagger-index": i }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-sunken)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              <Avatar initials={getInitials(u.name)} bg="#e8e4f0" text="#5a4a7a" size={32} />
                              <div className="min-w-0">
                                <div className="font-medium truncate max-w-[120px]" style={{ color: "var(--color-text-primary)" }}>{u.name}</div>
                                <div className="text-xs truncate max-w-[120px]" style={{ color: "var(--color-text-muted)" }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 hidden sm:table-cell">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ backgroundColor: roleStyle.bg, color: roleStyle.fg }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 pr-3 hidden md:table-cell" style={{ color: "var(--color-text-muted)" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-3 pr-3"><StatusBadge status={u.isActive ? "active" : "inactive"} /></td>
                          <td className="py-3">
                            {u.role !== "admin" ? (
                              <button
                                onClick={() => handleToggleUser(u._id)}
                                disabled={updating === u._id}
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-60"
                                style={
                                  u.isActive
                                    ? { backgroundColor: "var(--status-rejected-bg)", color: "var(--status-rejected-fg)" }
                                    : { backgroundColor: "var(--status-accepted-bg)", color: "var(--status-accepted-fg)" }
                                }
                              >
                                {updating === u._id ? "Updating…" : u.isActive
                                  ? <><UserX size={12} /> Deactivate</>
                                  : <><UserCheck size={12} /> Activate</>}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--color-text-faint)" }}>
                                <ShieldOff size={12} /> Protected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageCount={pageCount} total={activeList.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </Card>
      )}

    </div>
  );
}