import { useState, useEffect } from "react";
import {
  HeartHandshake, Users, CheckCircle2, Clock, XCircle, MessageSquareQuote, Pencil, Check,
} from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import Avatar from "../components/ui/Avatar";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Skeleton from "../components/common/Skeleton";
import Pagination from "../components/common/Pagination";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useCountUp from "../hooks/useCountUp";

const PAGE_SIZE = 8;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "V";
}

function AnimatedNumber({ value }) {
  const animated = useCountUp(value, 700);
  return <>{animated}</>;
}

// ── Shared stat card ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, hero }) {
  return (
    <Card className={`flex items-center gap-3 lift-on-hover ${hero ? "hero-glow" : ""}`} padding={hero ? "p-5" : "p-4"}>
      <div
        className={`rounded-xl flex items-center justify-center shrink-0 ${hero ? "w-12 h-12" : "w-9 h-9"}`}
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={hero ? 22 : 16} strokeWidth={2} />
      </div>
      <div>
        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</div>
        <div className={`font-semibold mt-0.5 tabular-nums ${hero ? "text-[26px]" : "text-lg"}`} style={{ color: "var(--color-text-primary)" }}>
          <AnimatedNumber value={value} />
        </div>
      </div>
    </Card>
  );
}

// ── Shared applicant row ─────────────────────────────────────────────────
function ApplicantRow({ title, subtitle, note, status, hours, hoursEditor, actions, index }) {
  return (
    <div
      className="flex items-center gap-3 py-3.5 border-b last:border-0 stagger-item animate-rise-in transition-colors px-2 -mx-2 rounded-lg"
      style={{ borderColor: "var(--color-border-soft)", "--stagger-index": index }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-sunken)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <Avatar initials={getInitials(title)} bg="#e8c1a0" text="#7a4a2a" size={36} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{title}</div>
        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{subtitle}</div>
        {note && (
          <div className="flex items-center gap-1 text-xs mt-1 italic" style={{ color: "var(--color-text-faint)" }}>
            <MessageSquareQuote size={11} className="shrink-0" /> "{note}"
          </div>
        )}
      </div>

      {hoursEditor ? hoursEditor : status === "approved" && hours != null && (
        <div className="text-right mr-1 shrink-0">
          <div className="text-sm font-medium tabular-nums" style={{ color: "var(--color-text-primary)" }}>{hours}h</div>
          <div className="text-[10px]" style={{ color: "var(--color-text-faint)" }}>logged</div>
        </div>
      )}

      <StatusBadge status={status} />
      {actions}
    </div>
  );
}

// ── Donor view: my volunteer applications ────────────────────────────────
function DonorView() {
  const { user } = useAuth();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/volunteers/my");
        setApplications(res.data || []);
      } catch (err) {
        toast.error(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const approved = applications.filter((a) => a.status === "approved").length;
  const pending  = applications.filter((a) => a.status === "pending").length;

  const pageCount = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const pageItems = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex-1 p-4 md:p-7 flex flex-col gap-5">
      <PageHeader title="My Volunteering" subtitle="Campaigns you applied to volunteer for" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loading ? <Skeleton.StatCard /> : <StatCard icon={HeartHandshake} label="Applications" value={applications.length} accent="#c0453a" hero />}
        {loading ? <Skeleton.StatCard compact /> : <StatCard icon={CheckCircle2} label="Approved" value={approved} accent="#22c55e" />}
        {loading ? <Skeleton.StatCard compact /> : <StatCard icon={Clock} label="Pending" value={pending} accent="#f5a623" />}
      </div>

      <Card className="flex-1 overflow-y-auto flex flex-col">
        {loading ? (
          <div className="space-y-1">{[1,2,3].map((k) => <Skeleton.Row key={k} />)}</div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={<HeartHandshake size={26} strokeWidth={1.5} />}
            title="No volunteer applications yet"
            subtitle='Go to Campaigns and click "Volunteer myself" to get started.'
          />
        ) : (
          <>
            <div className="flex-1">
              {pageItems.map((a, i) => (
                <ApplicantRow
                  key={a._id}
                  index={i}
                  title={a.campaign?.title || "Campaign"}
                  subtitle={`Applied ${new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                  note={a.note}
                  status={a.status}
                  hours={a.hours}
                />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} total={applications.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

// ── Inline editable hours control — NGO view only ─────────────────────────
function HoursEditor({ volunteer, editing, value, saving, onStartEdit, onChange, onSave, onCancel }) {
  if (editing) {
    return (
      <div className="flex items-center gap-1 mr-1 shrink-0">
        <input
          type="number" min="0" step="0.5" autoFocus value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
          className="w-16 text-sm tabular-nums border border-black/10 rounded-md px-1.5 py-1 outline-none focus:ring-2 focus:ring-[var(--status-accepted-dot)]/30"
        />
        <button
          onClick={onSave}
          disabled={saving}
          aria-label="Save hours"
          className="w-6 h-6 rounded-md flex items-center justify-center text-white disabled:opacity-60 transition"
          style={{ backgroundColor: "var(--status-accepted-dot)" }}
        >
          <Check size={12} />
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={onStartEdit}
      className="text-right mr-1 shrink-0 group flex items-center gap-1.5 rounded-md px-1.5 py-1 transition hover:bg-black/[0.03]"
      aria-label="Edit logged hours"
    >
      <div>
        <div className="text-sm font-medium tabular-nums" style={{ color: "var(--color-text-primary)" }}>{volunteer.hours || 0}h</div>
        <div className="text-[10px]" style={{ color: "var(--color-text-faint)" }}>logged</div>
      </div>
      <Pencil size={11} className="opacity-0 group-hover:opacity-60 transition" style={{ color: "var(--color-text-faint)" }} />
    </button>
  );
}

// ── NGO view: volunteers who applied to my campaigns ─────────────────────
function NGOView() {
  const { user } = useAuth();
  const toast = useToast();
  const [campaigns,   setCampaigns]   = useState([]);
  const [volunteers,  setVolunteers]  = useState([]);
  const [activeCamp,  setActiveCamp]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [updating,    setUpdating]    = useState(null);
  const [page,        setPage]        = useState(1);
  const [editingHours, setEditingHours] = useState(null); // volunteer _id currently being edited
  const [hoursValue,   setHoursValue]   = useState("");
  const [savingHours,  setSavingHours]  = useState(false);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/campaigns");
        // /campaigns returns every campaign platform-wide — volunteer
        // management should only ever show campaigns this NGO created,
        // otherwise the tab list leaks other orgs' campaign titles and
        // every click on one of those 403s server-side.
        const data = (res.data || []).filter((c) => c.createdBy === user?._id);
        setCampaigns(data);
        if (data.length > 0) setActiveCamp(data[0]._id);
      } catch (err) {
        toast.error(err.message || "Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  useEffect(() => {
    if (!activeCamp) return;
    const fetchVols = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/volunteers/campaign/${activeCamp}`);
        setVolunteers(res.data || []);
      } catch {
        setVolunteers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVols();
  }, [activeCamp]);

  useEffect(() => { setPage(1); }, [activeCamp]);

  const handleStatusUpdate = async (volunteerId, status) => {
    if (updating) return;
    try {
      setUpdating(volunteerId);
      await apiRequest(`/volunteers/status/${volunteerId}`, "PATCH", { status });
      toast.success(`Volunteer ${status} successfully`);
      const res = await apiRequest(`/volunteers/campaign/${activeCamp}`);
      setVolunteers(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const startEditHours = (v) => {
    setEditingHours(v._id);
    setHoursValue(String(v.hours || 0));
  };

  const cancelEditHours = () => {
    setEditingHours(null);
    setHoursValue("");
  };

  const saveHours = async () => {
    const hours = Number(hoursValue);
    if (!Number.isFinite(hours) || hours < 0) {
      toast.error("Enter a valid number of hours");
      return;
    }
    try {
      setSavingHours(true);
      await apiRequest(`/volunteers/hours/${editingHours}`, "PATCH", { hours });
      toast.success("Hours updated");
      setVolunteers((prev) => prev.map((v) => (v._id === editingHours ? { ...v, hours } : v)));
      setEditingHours(null);
      setHoursValue("");
    } catch (err) {
      toast.error(err.message || "Failed to update hours");
    } finally {
      setSavingHours(false);
    }
  };

  const pending  = volunteers.filter((v) => v.status === "pending").length;
  const approved = volunteers.filter((v) => v.status === "approved").length;

  const pageCount = Math.max(1, Math.ceil(volunteers.length / PAGE_SIZE));
  const pageItems = volunteers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex-1 p-4 md:p-7 flex flex-col gap-5">
      <PageHeader title="Volunteer Management" subtitle="Review and manage volunteer applications" />

      {campaigns.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {campaigns.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveCamp(c._id)}
              className="text-xs px-3 py-1.5 rounded-full border capitalize transition-all truncate max-w-[180px]"
              style={
                activeCamp === c._id
                  ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff", transform: "scale(1.03)" }
                  : { backgroundColor: "var(--color-bg-sidebar-tile)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
              }
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loading ? <Skeleton.StatCard /> : <StatCard icon={Users} label="Total applicants" value={volunteers.length} accent="#c0453a" hero />}
        {loading ? <Skeleton.StatCard compact /> : <StatCard icon={CheckCircle2} label="Approved" value={approved} accent="#22c55e" />}
        {loading ? <Skeleton.StatCard compact /> : <StatCard icon={Clock} label="Pending review" value={pending} accent="#f5a623" />}
      </div>

      <Card className="flex-1 overflow-y-auto flex flex-col">
        {loading ? (
          <div className="space-y-1">{[1,2,3].map((k) => <Skeleton.Row key={k} />)}</div>
        ) : volunteers.length === 0 ? (
          <EmptyState
            icon={<Users size={26} strokeWidth={1.5} />}
            title={campaigns.length === 0 ? "No campaigns yet" : "No applications yet"}
            subtitle={
              campaigns.length === 0
                ? "Create a campaign first to receive volunteer applications."
                : "No volunteer applications for this campaign yet."
            }
          />
        ) : (
          <>
            <div className="flex-1">
              {pageItems.map((v, i) => (
                <ApplicantRow
                  key={v._id}
                  index={i}
                  title={v.user?.name || "Volunteer"}
                  subtitle={v.user?.email || ""}
                  note={v.note}
                  status={v.status}
                  hours={v.status === "approved" ? v.hours : null}
                  hoursEditor={
                    v.status === "approved" && (
                      <HoursEditor
                        volunteer={v}
                        editing={editingHours === v._id}
                        value={hoursValue}
                        saving={savingHours}
                        onStartEdit={() => startEditHours(v)}
                        onChange={setHoursValue}
                        onSave={saveHours}
                        onCancel={cancelEditHours}
                      />
                    )
                  }
                  actions={
                    v.status === "pending" && (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStatusUpdate(v._id, "approved")}
                          disabled={updating === v._id}
                          className="inline-flex items-center gap-1 disabled:opacity-60 text-white text-xs px-2.5 py-1.5 rounded-md transition font-medium"
                          style={{ backgroundColor: "var(--status-accepted-dot)" }}
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(v._id, "rejected")}
                          disabled={updating === v._id}
                          className="inline-flex items-center gap-1 disabled:opacity-60 text-white text-xs px-2.5 py-1.5 rounded-md transition font-medium"
                          style={{ backgroundColor: "var(--status-rejected-dot)" }}
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )
                  }
                />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} total={volunteers.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

// ── Root component — role-based view switcher ────────────────────────────
export default function VolunteersPage() {
  const { role } = useAuth();

  if (role === "ngo" || role === "admin") return <NGOView />;
  return <DonorView />;
}