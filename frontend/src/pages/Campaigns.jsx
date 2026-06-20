import { useState, useEffect } from "react";
import {
  X, Plus, Megaphone, Users, IndianRupee, Target,
  CheckCircle2, XCircle, Clock, PauseCircle, PlayCircle, Pencil, Save,
} from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import ProgressBar from "../components/ui/ProgressBar";
import ProgressRing from "../components/ui/ProgressRing";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Skeleton from "../components/common/Skeleton";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// ── Campaign card skeleton (grid) ───────────────────────────────────────
function CampaignCardSkeleton() {
  return (
    <Card>
      <div className="flex justify-between mb-3">
        <Skeleton.Bar className="w-1/2 h-3" />
        <Skeleton.Bar className="w-12 h-4 rounded-full" />
      </div>
      <Skeleton.Bar className="w-full h-2 mb-2" />
      <Skeleton.Bar className="w-1/3 h-2" />
    </Card>
  );
}

const VOLUNTEER_BADGE = {
  approved: { icon: CheckCircle2, label: "Approved" },
  rejected: { icon: XCircle,      label: "Rejected" },
  pending:  { icon: Clock,        label: "Pending" },
};

export default function CampaignsPage() {
  const { role, user } = useAuth();
  const toast = useToast();

  const [campaigns, setCampaigns]               = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [volunteerStatus, setVolunteerStatus]   = useState(null);
  const [loadingApply, setLoadingApply]         = useState(false);
  const [togglingCampaign, setTogglingCampaign] = useState(false);
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [createForm, setCreateForm]             = useState({ title: "", description: "", goalAmount: "" });
  const [createFormError, setCreateFormError]   = useState("");
  const [createFormLoading, setCreateFormLoading] = useState(false);

  // Editing an existing campaign's title/description/goal — separate from
  // the create-modal form above; toggleCampaign only ever flips isActive,
  // it never lets the owner fix a typo or adjust the goal after the fact.
  const [editMode, setEditMode]                 = useState(false);
  const [editForm, setEditForm]                 = useState({ title: "", description: "", goalAmount: "" });
  const [editFormError, setEditFormError]       = useState("");
  const [editFormLoading, setEditFormLoading]   = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/campaigns");
      const data = (res.data || []).map((c) => ({
        ...c,
        pct: Math.min(Math.floor(((c.raised || 0) / c.goalAmount) * 100), 100),
        color: c.isActive ? "#c0453a" : "#a39a8e",
      }));
      setCampaigns(data);
    } catch (err) { toast.error(err.message || "Failed to load campaigns"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  useEffect(() => {
    if (!selectedCampaign || role !== "donor") return;
    setVolunteerStatus(null);
    const checkStatus = async () => {
      try {
        const res = await apiRequest("/volunteers/my");
        const match = (res.data || []).find(
          (v) => v.campaign?._id?.toString() === selectedCampaign._id?.toString()
        );
        setVolunteerStatus(match ? match.status : null);
      } catch { setVolunteerStatus(null); }
    };
    checkStatus();
  }, [selectedCampaign, role]);

  const handleCreate = async () => {
    setCreateFormError("");
    const { title, description, goalAmount } = createForm;
    if (!title.trim() || title.trim().length < 3) return setCreateFormError("Title must be at least 3 characters");
    if (!description.trim() || description.trim().length < 10) return setCreateFormError("Description must be at least 10 characters");
    if (!goalAmount || Number(goalAmount) < 1) return setCreateFormError("Goal amount must be greater than 0");
    try {
      setCreateFormLoading(true);
      await apiRequest("/campaigns/create", "POST", { title: title.trim(), description: description.trim(), goalAmount: Number(goalAmount) });
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", goalAmount: "" });
      toast.success("Campaign created successfully");
      fetchCampaigns();
    } catch (err) { setCreateFormError(err.message || "Failed to create campaign"); }
    finally { setCreateFormLoading(false); }
  };

  const handleApply = async () => {
    if (!selectedCampaign || loadingApply) return;
    try {
      setLoadingApply(true);
      await apiRequest("/volunteers/apply", "POST", { campaignId: selectedCampaign._id });
      setVolunteerStatus("pending");
      toast.success("Volunteer application submitted");
    } catch (err) { toast.error(err.message || "Failed to apply"); }
    finally { setLoadingApply(false); }
  };

  const handleToggleActive = async () => {
    if (!selectedCampaign || togglingCampaign) return;
    if (selectedCampaign.createdBy !== user?._id) return; // guarded in the UI too; this is a defensive backstop
    try {
      setTogglingCampaign(true);
      const res = await apiRequest(`/campaigns/toggle/${selectedCampaign._id}`, "PATCH");
      toast.success(res.message || "Campaign updated");
      setSelectedCampaign((prev) => prev && { ...prev, isActive: res.data.isActive });
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message || "Failed to update campaign");
    } finally {
      setTogglingCampaign(false);
    }
  };

  const startEdit = () => {
    if (!selectedCampaign) return;
    setEditForm({
      title: selectedCampaign.title || "",
      description: selectedCampaign.description || "",
      goalAmount: String(selectedCampaign.goalAmount ?? ""),
    });
    setEditFormError("");
    setEditMode(true);
  };

  const cancelEdit = () => { setEditMode(false); setEditFormError(""); };

  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return;
    setEditFormError("");
    const { title, description, goalAmount } = editForm;
    if (!title.trim() || title.trim().length < 3) return setEditFormError("Title must be at least 3 characters");
    if (!description.trim() || description.trim().length < 10) return setEditFormError("Description must be at least 10 characters");
    if (!goalAmount || Number(goalAmount) < 1) return setEditFormError("Goal amount must be greater than 0");
    try {
      setEditFormLoading(true);
      const res = await apiRequest(`/campaigns/${selectedCampaign._id}`, "PATCH", {
        title: title.trim(), description: description.trim(), goalAmount: Number(goalAmount),
      });
      toast.success("Campaign updated successfully");
      setSelectedCampaign((prev) => prev && {
        ...prev, ...res.data,
        pct: Math.min(Math.floor(((prev.raised || 0) / res.data.goalAmount) * 100), 100),
      });
      setEditMode(false);
      fetchCampaigns();
    } catch (err) {
      setEditFormError(err.message || "Failed to update campaign");
    } finally {
      setEditFormLoading(false);
    }
  };

  const closeDetail = () => { setSelectedCampaign(null); setVolunteerStatus(null); setEditMode(false); setEditFormError(""); };

  return (
    <div className="flex-1 p-4 md:p-7 flex flex-col gap-5">

      <PageHeader
        title="Campaigns"
        subtitle="All active fundraising campaigns"
        actions={
          (role === "ngo" || role === "admin") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <Plus size={15} /> Create campaign
            </button>
          )
        }
      />

      {/* Campaign grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((k) => <CampaignCardSkeleton key={k} />)}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={26} strokeWidth={1.5} />}
          title="No campaigns yet"
          subtitle={
            (role === "ngo" || role === "admin")
              ? "Create your first campaign to start raising funds."
              : "Check back soon — campaigns will appear here."
          }
          action={
            (role === "ngo" || role === "admin") && (
              <button onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ backgroundColor: "var(--color-accent)" }}>
                <Plus size={15} /> Create campaign
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
          {campaigns.map((c, i) => (
            <Card
              key={c._id}
              variant="interactive"
              onClick={() => setSelectedCampaign(c)}
              className="stagger-item animate-rise-in"
              style={{ "--stagger-index": i }}
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="font-medium text-sm truncate" style={{ color: "var(--color-text-primary)" }}>{c.title}</div>
                <StatusBadge status={c.isActive ? "active" : "inactive"} />
              </div>

              <div className="flex items-center gap-3.5">
                <ProgressRing pct={c.pct} color={c.color} size={52} stroke={4.5} />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold tabular-nums" style={{ color: "var(--color-text-primary)" }}>
                    ₹{(c.raised || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--color-text-faint)" }}>
                    of ₹{c.goalAmount?.toLocaleString("en-IN")} goal
                  </div>
                  <div className="flex items-center gap-1 text-[11px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                    <Users size={11} /> {c.donationsCount || 0} donations
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Campaign detail modal */}
      {selectedCampaign && (() => {
        const isOwner = selectedCampaign.createdBy === user?._id;
        return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3 animate-overlay-in" onClick={closeDetail}>
          <div className="bg-white w-full max-w-md p-5 rounded-xl shadow-[var(--shadow-lg)] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-1 gap-2">
              <div className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {editMode ? "Edit campaign" : selectedCampaign.title}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!editMode && (role === "ngo" || role === "admin") && isOwner && (
                  <button
                    onClick={startEdit}
                    aria-label="Edit campaign"
                    className="rounded-md p-1 transition hover:bg-black/5"
                    style={{ color: "var(--color-text-faint)" }}
                  >
                    <Pencil size={14} />
                  </button>
                )}
                <button onClick={closeDetail} className="rounded-md p-1 transition hover:bg-black/5" style={{ color: "var(--color-text-faint)" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {editMode ? (
              <div className="mt-3">
                <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Campaign title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full mb-3 p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow"
                />

                <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Description <span style={{ color: "var(--color-text-faint)" }}>(min. 10 characters)</span></label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full mb-3 p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm resize-none transition-shadow"
                />

                <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Goal amount (₹)</label>
                <input
                  type="number" min="1"
                  value={editForm.goalAmount}
                  onChange={(e) => setEditForm({ ...editForm, goalAmount: e.target.value })}
                  className="w-full mb-3 p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow"
                />

                {editFormError && (
                  <p className="text-xs mb-3 rounded-lg px-3 py-2 border animate-rise-in" style={{ color: "var(--status-rejected-fg)", backgroundColor: "var(--status-rejected-bg)", borderColor: "var(--status-rejected-dot)" }}>
                    {editFormError}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button onClick={cancelEdit} disabled={editFormLoading} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-lg transition disabled:opacity-60" style={{ color: "var(--color-text-secondary)" }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCampaign}
                    disabled={editFormLoading}
                    className="inline-flex items-center gap-1.5 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-60 transition font-medium"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {editFormLoading ? "Saving…" : <><Save size={13} /> Save changes</>}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <StatusBadge status={selectedCampaign.isActive ? "active" : "inactive"} />

                <div className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {selectedCampaign.description || "No description available"}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <ProgressRing pct={selectedCampaign.pct} color={selectedCampaign.color} size={64} stroke={5} />
                  <div className="flex-1 grid grid-cols-2 gap-y-2 text-[13px]">
                    <Stat icon={IndianRupee} label="Raised"    value={`₹${(selectedCampaign.raised || 0).toLocaleString("en-IN")}`} />
                    <Stat icon={Target}      label="Goal"      value={`₹${selectedCampaign.goalAmount?.toLocaleString("en-IN")}`} />
                    <Stat icon={Users}       label="Donations" value={selectedCampaign.donationsCount || 0} />
                    <Stat icon={Clock}       label="Created"   value={new Date(selectedCampaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar pct={selectedCampaign.pct} color={selectedCampaign.color} />
                </div>

                {role === "donor" && (
                  <div className="mt-5">
                    <button
                      onClick={handleApply}
                      disabled={!!volunteerStatus || loadingApply}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-sm font-medium transition disabled:cursor-not-allowed"
                      style={{ backgroundColor: volunteerStatus ? "var(--status-neutral-dot)" : "var(--color-accent)" }}
                    >
                      {loadingApply ? "Applying…" : volunteerStatus ? (
                        <>{(() => { const V = VOLUNTEER_BADGE[volunteerStatus]?.icon || Clock; return <V size={14} />; })()} {VOLUNTEER_BADGE[volunteerStatus]?.label}</>
                      ) : (
                        <><Users size={14} /> Volunteer myself</>
                      )}
                    </button>
                    {volunteerStatus && (
                      <p className="text-xs text-center mt-2" style={{ color: "var(--color-text-muted)" }}>
                        Application status: <span className="capitalize font-medium">{volunteerStatus}</span>
                      </p>
                    )}
                  </div>
                )}

                {(role === "ngo" || role === "admin") && (
                  <div className="mt-5">
                    <button
                      onClick={handleToggleActive}
                      disabled={togglingCampaign || !isOwner}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed border"
                      style={
                        selectedCampaign.isActive
                          ? { backgroundColor: "var(--status-rejected-bg)", color: "var(--status-rejected-fg)", borderColor: "var(--status-rejected-dot)" }
                          : { backgroundColor: "var(--status-accepted-bg)", color: "var(--status-accepted-fg)", borderColor: "var(--status-accepted-dot)" }
                      }
                    >
                      {togglingCampaign ? "Updating…" : selectedCampaign.isActive
                        ? <><PauseCircle size={14} /> Deactivate campaign</>
                        : <><PlayCircle size={14} /> Activate campaign</>}
                    </button>
                    <p className="text-[11px] text-center mt-1.5" style={{ color: "var(--color-text-faint)" }}>
                      {isOwner
                        ? "Only the campaign creator can change this status."
                        : "Only this campaign's creator can change its status."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        );
      })()}

      {/* Create campaign modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3 animate-overlay-in" onClick={() => { setShowCreateModal(false); setCreateFormError(""); }}>
          <div className="bg-white p-5 md:p-6 rounded-xl w-full max-w-md shadow-[var(--shadow-lg)] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>Create campaign</div>
              <button onClick={() => { setShowCreateModal(false); setCreateFormError(""); }} className="rounded-md p-1 transition hover:bg-black/5" style={{ color: "var(--color-text-faint)" }}>
                <X size={16} />
              </button>
            </div>

            <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Campaign title</label>
            <input
              placeholder="e.g. Monsoon Relief Drive"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full mb-3 p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow"
            />

            <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Description <span style={{ color: "var(--color-text-faint)" }}>(min. 10 characters)</span></label>
            <textarea
              rows={3}
              placeholder="What is this campaign raising funds for?"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full mb-3 p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm resize-none transition-shadow"
            />

            <label className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Goal amount (₹)</label>
            <input
              placeholder="50000"
              type="number" min="1"
              value={createForm.goalAmount}
              onChange={(e) => setCreateForm({ ...createForm, goalAmount: e.target.value })}
              className="w-full mb-3 p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow"
            />

            {createFormError && (
              <p className="text-xs mb-3 rounded-lg px-3 py-2 border animate-rise-in" style={{ color: "var(--status-rejected-fg)", backgroundColor: "var(--status-rejected-bg)", borderColor: "var(--status-rejected-dot)" }}>
                {createFormError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowCreateModal(false); setCreateFormError(""); }} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-lg transition" style={{ color: "var(--color-text-secondary)" }}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createFormLoading}
                className="text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-60 transition font-medium"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                {createFormLoading ? "Creating…" : "Create campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} style={{ color: "var(--color-text-faint)" }} />
      <div>
        <div className="text-[10px] leading-none" style={{ color: "var(--color-text-faint)" }}>{label}</div>
        <div className="font-medium leading-tight mt-0.5" style={{ color: "var(--color-text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}