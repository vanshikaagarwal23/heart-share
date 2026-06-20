import { useState, useEffect } from "react";
import {
  X, Wallet, Package, Clock, BarChart3,
  CalendarDays, CheckCircle2, XCircle, Plus, ShieldAlert,
  FileText, User, Building2, Phone, MessageSquareQuote, AlertCircle,
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

const STATUS_FILTERS = ["All", "pending", "accepted", "completed", "rejected"];
const PAGE_SIZE = 7;
const EMPTY_FORM = { title: "", description: "", type: "money", amount: "", quantity: "1", pickupAddress: "", scheduledPickupDate: "", campaignId: "" };

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

// ── Reject reason modal ──────────────────────────────────────────────────
function RejectModal({ donation, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3 animate-overlay-in">
      <div className="bg-white w-full max-w-sm p-5 rounded-xl shadow-[var(--shadow-lg)] animate-scale-in">
        <div className="flex justify-between items-center mb-3">
          <div className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>Reject donation</div>
          <button onClick={onClose} className="rounded-md p-1 transition hover:bg-black/5" style={{ color: "var(--color-text-faint)" }}>
            <X size={16} />
          </button>
        </div>
        <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>
          You're rejecting <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>"{donation.title}"</span>.
          Let the donor know why so they understand the decision.
        </p>
        <textarea
          rows={3}
          placeholder="Reason for rejection…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
          className="w-full p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--status-rejected-dot)]/30 text-sm resize-none transition-shadow"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-lg transition" style={{ color: "var(--color-text-secondary)" }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-60 transition font-medium"
            style={{ backgroundColor: "var(--status-rejected-dot)" }}
          >
            {loading ? "Rejecting…" : "Reject donation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Accept modal — captures optional note + pickup date confirmation ───────
function AcceptModal({ donation, onClose, onConfirm, loading }) {
  const [note, setNote] = useState("");
  const [pickupDate, setPickupDate] = useState(donation.scheduledPickupDate ? donation.scheduledPickupDate.slice(0, 16) : "");

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3 animate-overlay-in">
      <div className="bg-white w-full max-w-sm p-5 rounded-xl shadow-[var(--shadow-lg)] animate-scale-in">
        <div className="flex justify-between items-center mb-3">
          <div className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>Accept donation</div>
          <button onClick={onClose} className="rounded-md p-1 transition hover:bg-black/5" style={{ color: "var(--color-text-faint)" }}>
            <X size={16} />
          </button>
        </div>
        <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>
          Accepting <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>"{donation.title}"</span>.
          {donation.type === "item" ? " Confirm a pickup time and add any note for the donor." : " Add an optional note for the donor."}
        </p>

        {donation.type === "item" && (
          <label className="block mb-3">
            <span className="block text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Scheduled pickup date & time</span>
            <input
              type="datetime-local"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--status-accepted-dot)]/30 text-sm transition-shadow"
            />
          </label>
        )}

        <textarea
          rows={2}
          placeholder="Note for donor (optional)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-2.5 border border-black/10 rounded-lg outline-none focus:ring-2 focus:ring-[var(--status-accepted-dot)]/30 text-sm resize-none transition-shadow"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-lg transition" style={{ color: "var(--color-text-secondary)" }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ ngoNote: note || undefined, scheduledPickupDate: pickupDate ? new Date(pickupDate).toISOString() : undefined })}
            disabled={loading}
            className="text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-60 transition font-medium"
            style={{ backgroundColor: "var(--status-accepted-dot)" }}
          >
            {loading ? "Accepting…" : "Confirm accept"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail row — label/value pair used inside the detail modal ──────────
function DetailRow({ icon: Icon, label, value, italic }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <Icon size={14} className="mt-0.5 shrink-0" style={{ color: "var(--color-text-faint)" }} />
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px]" style={{ color: "var(--color-text-faint)" }}>{label}</div>
        <div className={`text-sm mt-0.5 break-words ${italic ? "italic" : ""}`} style={{ color: "var(--color-text-secondary)" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ── Donation detail modal — fetches the full record (incl. NGO contact
// info once accepted) via GET /donations/:id, a backend endpoint the rest
// of this page never otherwise calls. ────────────────────────────────────
function DetailModal({ donationId, onClose }) {
  const toast = useToast();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/donations/${donationId}`);
        if (!cancelled) setDonation(res.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err.message || "Failed to load donation details");
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donationId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3 animate-overlay-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md p-5 rounded-xl shadow-[var(--shadow-lg)] animate-scale-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-1 gap-2">
          <div className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {loading ? "Donation details" : donation?.title}
          </div>
          <button onClick={onClose} className="rounded-md p-1 transition hover:bg-black/5 shrink-0" style={{ color: "var(--color-text-faint)" }}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 mt-4">
            <Skeleton.Row /><Skeleton.Row /><Skeleton.Row />
          </div>
        ) : !donation ? null : (
          <>
            <div className="mt-1 mb-3"><StatusBadge status={donation.status} /></div>

            <div className="divide-y" style={{ borderColor: "var(--color-border-soft)" }}>
              <DetailRow icon={FileText} label="Description" value={donation.description} />
              <DetailRow
                icon={donation.type === "money" ? Wallet : Package}
                label={donation.type === "money" ? "Amount" : "Quantity"}
                value={donation.type === "money" ? `₹${(donation.amount || 0).toLocaleString("en-IN")}` : `${donation.quantity || 1} item(s)`}
              />
              <DetailRow icon={User} label="Donor" value={donation.donor?.name ? `${donation.donor.name} (${donation.donor.email})` : null} />
              <DetailRow icon={Building2} label="Campaign" value={donation.campaign?.title} />
              {donation.type === "item" && <DetailRow icon={CalendarDays} label="Pickup address" value={donation.pickupAddress} />}
              {donation.scheduledPickupDate && (
                <DetailRow
                  icon={CalendarDays}
                  label="Scheduled pickup"
                  value={new Date(donation.scheduledPickupDate).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                />
              )}
              {donation.ngo && (
                <>
                  <DetailRow icon={Building2} label="Accepted by" value={donation.ngo.name} />
                  <DetailRow icon={Phone} label="NGO contact" value={donation.ngo.contactNumber} />
                </>
              )}
              {donation.ngoNote && <DetailRow icon={MessageSquareQuote} label="Note from NGO" value={`"${donation.ngoNote}"`} italic />}
              {donation.status === "rejected" && (
                <DetailRow icon={AlertCircle} label="Rejection reason" value={donation.rejectionReason || "No reason given"} italic />
              )}
              <DetailRow
                icon={Clock}
                label="Submitted"
                value={new Date(donation.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              />
              {donation.completedAt && (
                <DetailRow
                  icon={CheckCircle2}
                  label="Completed"
                  value={new Date(donation.completedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
          <AnimatedValue value={value} />
        </div>
      </div>
    </Card>
  );
}

export default function DonationsPage() {
  const { role } = useAuth();
  const toast = useToast();

  const [filter, setFilter]       = useState("All");
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);
  const [page, setPage]           = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [needsNgoProfile, setNeedsNgoProfile] = useState(false);
  const [myNgoId, setMyNgoId]     = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm]       = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setNeedsNgoProfile(false);
      const requests = [
        apiRequest("/donations"),
        apiRequest("/campaigns").catch(() => ({ data: [] })),
      ];
      // NGOs need their own profile id to tell "my accepted/completed
      // donations" apart from the shared pending queue (see stats below) —
      // donors/admins don't need this extra call.
      if (role === "ngo") requests.push(apiRequest("/ngo/me").catch(() => null));

      const [donRes, campRes, ngoRes] = await Promise.all(requests);
      setDonations(donRes.data || []);
      setCampaigns((campRes.data || []).filter((c) => c.isActive));
      if (role === "ngo") setMyNgoId(ngoRes?.data?._id || null);
    } catch (err) {
      if (role === "ngo" && /ngo profile not found/i.test(err.message || "")) {
        setNeedsNgoProfile(true);
      } else {
        toast.error(err.message || "Failed to load donations");
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDonations(); }, []);
  useEffect(() => { setPage(1); }, [filter]);

  // ── Create donation ───────────────────────────────────────────────────
  const handleCreate = async () => {
    setFormError("");
    if (!form.title.trim() || !form.description.trim()) return setFormError("Title and description are required");
    if (form.type === "money" && (!form.amount || Number(form.amount) <= 0)) return setFormError("Enter a valid amount");
    if (form.type === "item" && !form.pickupAddress.trim()) return setFormError("Pickup address is required for item donations");
    try {
      setFormLoading(true);
      await apiRequest("/donations", "POST", {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        amount:               form.type === "money" ? Number(form.amount) : 0,
        quantity:              form.type === "item"  ? Number(form.quantity || 1) : 0,
        pickupAddress:         form.type === "item"  ? form.pickupAddress.trim() : undefined,
        scheduledPickupDate:   form.type === "item" && form.scheduledPickupDate
                                  ? new Date(form.scheduledPickupDate).toISOString() : undefined,
        campaignId:            form.campaignId || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success("Donation created successfully");
      fetchDonations();
    } catch (err) { setFormError(err.message || "Failed to create donation"); }
    finally { setFormLoading(false); }
  };

  const handleStatusUpdate = async (id, status, extra = {}) => {
    if (updating) return;
    try {
      setUpdating(id);
      await apiRequest(`/donations/${id}/status`, "PATCH", { status, ...extra });
      toast.success(`Donation ${status} successfully`);
      fetchDonations();
    } catch (err) { toast.error(err.message || "Failed to update status"); }
    finally { setUpdating(null); }
  };

  const handleAccept = async ({ ngoNote, scheduledPickupDate }) => {
    if (!acceptTarget) return;
    try {
      setUpdating(acceptTarget._id);
      await apiRequest(`/donations/${acceptTarget._id}/status`, "PATCH", {
        status: "accepted", ngoNote, scheduledPickupDate,
      });
      toast.success("Donation accepted");
      setAcceptTarget(null);
      fetchDonations();
    } catch (err) { toast.error(err.message || "Failed to accept donation"); }
    finally { setUpdating(null); }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    try {
      setUpdating(rejectTarget._id);
      await apiRequest(`/donations/${rejectTarget._id}/status`, "PATCH", {
        status: "rejected", rejectionReason: reason || undefined,
      });
      toast.success("Donation rejected");
      setRejectTarget(null);
      fetchDonations();
    } catch (err) { toast.error(err.message || "Failed to reject donation"); }
    finally { setUpdating(null); }
  };

  const filtered = filter === "All" ? donations : donations.filter((d) => d.status === filter);

  // For an NGO, `donations` is the shared queue: every pending donation
  // system-wide (not yet claimed by anyone) plus whichever ones this NGO
  // has accepted/completed. Money figures must only count donations this
  // NGO actually owns — otherwise "Total raised" double-counts funds other
  // NGOs haven't even accepted yet.
  const myDonations = role === "ngo"
    ? donations.filter((d) => d.ngo?._id === myNgoId)
    : donations;

  const totalAmount  = myDonations.reduce((a, d) => a + (d.amount || 0), 0);
  const avgAmount    = myDonations.length ? Math.floor(totalAmount / myDonations.length) : 0;
  const pendingCount = donations.filter((d) => d.status === "pending").length;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STATS = role === "ngo"
    ? [
        { icon: Wallet,  label: "Total raised",     value: `₹${totalAmount.toLocaleString()}`, accent: "#22c55e", hero: true },
        { icon: Package, label: "Accepted entries", value: myDonations.length,                   accent: "#ff6600" },
        { icon: Clock,   label: "Pending approval", value: pendingCount,                          accent: "#f5a623" },
      ]
    : [
        { icon: Wallet,    label: "Total raised",  value: `₹${totalAmount.toLocaleString()}`, accent: "#22c55e", hero: true },
        { icon: Package,   label: "Total entries", value: donations.length,                     accent: "#ff6600" },
        { icon: BarChart3, label: "Avg donation",  value: `₹${avgAmount.toLocaleString()}`,    accent: "#c0453a" },
      ];

  if (needsNgoProfile) {
    return (
      <div className="flex-1 p-5 md:p-7 flex flex-col gap-5">
        <PageHeader title="Donations" subtitle="All incoming contributions" />
        <Card variant="sunken" className="max-w-lg border" style={{ borderColor: "var(--status-pending-dot)" }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--status-pending-bg)", color: "var(--status-pending-fg)" }}>
              <ShieldAlert size={17} />
            </div>
            <div>
              <div className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>Organization profile required</div>
              <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Donations are matched to your organization profile. Create it first to start
                reviewing and accepting donations.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("heartshare:navigate", { detail: "Organization" }))}
                className="mt-4 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Set up organization profile
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col gap-5 overflow-hidden">

      <PageHeader
        title="Donations"
        subtitle="All incoming contributions"
        actions={
          <>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="text-[12px] px-3 py-[6px] rounded-full border capitalize transition-all"
                style={
                  filter === s
                    ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff", transform: "scale(1.04)" }
                    : { backgroundColor: "var(--color-bg-sidebar-tile)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
                }
              >
                {s}
              </button>
            ))}
            {role === "donor" && (
              <button
                onClick={() => setShowForm((v) => !v)}
                className="inline-flex items-center gap-1 text-[12px] px-3 py-[6px] rounded-full text-white font-medium transition"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New donation</>}
              </button>
            )}
          </>
        }
      />

      {/* Create donation form — donors only */}
      {role === "donor" && showForm && (
        <Card variant="bordered" className="animate-rise-in">
          <div className="text-[14px] font-medium mb-4" style={{ color: "var(--color-text-primary)" }}>New donation</div>

          {/* Type selector — visual choice, not a plain radio pair */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { key: "money", icon: Wallet,  title: "Money", desc: "Contribute funds directly" },
              { key: "item",  icon: Package, title: "Item",  desc: "Donate goods for pickup" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setForm({ ...form, type: opt.key })}
                className="flex items-start gap-2.5 p-3.5 rounded-xl border-2 text-left transition-all"
                style={
                  form.type === opt.key
                    ? { borderColor: "var(--color-accent)", backgroundColor: "#fff4ec" }
                    : { borderColor: "var(--color-border)", backgroundColor: "#fff" }
                }
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: form.type === opt.key ? "var(--color-accent)" : "var(--color-bg-sidebar-tile)",
                    color: form.type === opt.key ? "#fff" : "var(--color-text-muted)",
                  }}
                >
                  <opt.icon size={15} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{opt.title}</div>
                  <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Title" required>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Winter clothing drive"
                className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow" />
            </Field>

            <Field label="Linked campaign" hint="optional">
              <select
                value={form.campaignId}
                onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm bg-white transition-shadow"
              >
                <option value="">No campaign — general donation</option>
                {campaigns.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </Field>

            <Field label="Description" required full>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Briefly describe what you're contributing"
                className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm resize-none transition-shadow" />
            </Field>

            {form.type === "money" ? (
              <Field label="Amount (₹)" required>
                <input placeholder="1000" type="number" min="1" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow" />
              </Field>
            ) : (
              <>
                <Field label="Quantity">
                  <input placeholder="1" type="number" min="1" value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow" />
                </Field>
                <Field label="Preferred pickup date" hint="optional">
                  <input type="datetime-local" value={form.scheduledPickupDate}
                    onChange={(e) => setForm({ ...form, scheduledPickupDate: e.target.value })}
                    className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow" />
                </Field>
                <Field label="Pickup address" required full>
                  <input value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                    placeholder="Street, city, state, PIN code"
                    className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm transition-shadow" />
                </Field>
              </>
            )}
          </div>

          {formError && (
            <p className="text-xs mt-3 rounded-lg px-3 py-2 border animate-rise-in" style={{ color: "var(--status-rejected-fg)", backgroundColor: "var(--status-rejected-bg)", borderColor: "var(--status-rejected-dot)" }}>
              {formError}
            </p>
          )}

          <button onClick={handleCreate} disabled={formLoading}
            className="mt-4 text-white text-sm px-5 py-2.5 rounded-lg disabled:opacity-60 transition font-medium"
            style={{ backgroundColor: "var(--color-primary)" }}>
            {formLoading ? "Submitting…" : "Submit donation"}
          </button>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Table */}
      <Card className="flex-1 overflow-auto flex flex-col">
        {loading ? (
          <div className="space-y-1">{[1,2,3,4].map((k) => <Skeleton.Row key={k} />)}</div>
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={<Package size={26} strokeWidth={1.5} />}
            title={filter === "All" ? "No donations yet" : `No ${filter} donations found`}
            subtitle={
              role === "donor" && filter === "All"
                ? 'Click "New donation" above to make your first contribution.'
                : "Check back later or try a different filter."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left border-b" style={{ color: "var(--color-text-faint)", borderColor: "var(--color-border-soft)" }}>
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Status</th>
                    {role === "ngo" && <th className="pb-2 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((d, i) => (
                    <tr
                      key={d._id}
                      onClick={() => setDetailTarget(d._id)}
                      className="border-b last:border-0 transition-colors stagger-item animate-rise-in cursor-pointer"
                      style={{ borderColor: "var(--color-border-soft)", "--stagger-index": i }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="py-2.5 pr-3 font-medium max-w-[160px] truncate" style={{ color: "var(--color-text-secondary)" }}>{d.title}</td>
                      <td className="py-2.5 pr-3 capitalize" style={{ color: "var(--color-text-muted)" }}>{d.type}</td>
                      <td className="py-2.5 pr-3 tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                        {d.type === "money" ? `₹${d.amount?.toLocaleString()}` : `${d.quantity} item(s)`}
                      </td>
                      <td className="py-2.5 pr-3" style={{ color: "var(--color-text-muted)" }}>{new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={d.status} />
                          {d.status === "rejected" && d.rejectionReason && (
                            <span className="text-[10px] italic max-w-[160px] truncate" style={{ color: "var(--color-text-faint)" }} title={d.rejectionReason}>
                              "{d.rejectionReason}"
                            </span>
                          )}
                          {d.status === "accepted" && d.scheduledPickupDate && (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--color-text-faint)" }}>
                              <CalendarDays size={10} />
                              {new Date(d.scheduledPickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </td>
                      {role === "ngo" && (
                        <td className="py-2.5" onClick={(e) => e.stopPropagation()}>
                          {d.status === "pending" && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setAcceptTarget(d)}
                                disabled={updating === d._id}
                                className="inline-flex items-center gap-1 disabled:opacity-60 text-white text-xs px-2.5 py-1.5 rounded-md transition font-medium"
                                style={{ backgroundColor: "var(--status-accepted-dot)" }}
                              >
                                <CheckCircle2 size={12} /> Accept
                              </button>
                              <button
                                onClick={() => setRejectTarget(d)}
                                disabled={updating === d._id}
                                className="inline-flex items-center gap-1 disabled:opacity-60 text-white text-xs px-2.5 py-1.5 rounded-md transition font-medium"
                                style={{ backgroundColor: "var(--status-rejected-dot)" }}
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          )}
                          {d.status === "accepted" && (
                            <button
                              onClick={() => handleStatusUpdate(d._id, "completed")}
                              disabled={updating === d._id}
                              className="inline-flex items-center gap-1 disabled:opacity-60 text-white text-xs px-2.5 py-1.5 rounded-md transition font-medium"
                              style={{ backgroundColor: "var(--status-completed-dot)" }}
                            >
                              {updating === d._id ? "…" : <><CheckCircle2 size={12} /> Mark complete</>}
                            </button>
                          )}
                          {["completed", "rejected"].includes(d.status) && (
                            <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>

      {rejectTarget && (
        <RejectModal donation={rejectTarget} loading={updating === rejectTarget._id} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
      )}
      {acceptTarget && (
        <AcceptModal donation={acceptTarget} loading={updating === acceptTarget._id} onClose={() => setAcceptTarget(null)} onConfirm={handleAccept} />
      )}
      {detailTarget && (
        <DetailModal donationId={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
    </div>
  );
}

function Field({ label, required, hint, full, children }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
        {label}{required && <span style={{ color: "var(--color-accent)" }}> *</span>}
        {hint && <span className="ml-1" style={{ color: "var(--color-text-faint)" }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}