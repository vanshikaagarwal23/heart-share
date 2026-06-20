import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Pencil, X } from "lucide-react";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import Skeleton from "../components/common/Skeleton";
import StatusBadge from "../components/ui/StatusBadge";
import { apiRequest } from "../services/api";
import { useToast } from "../context/ToastContext";

const EMPTY_FORM = { name: "", description: "", address: "", contactNumber: "" };

// Mirrors backend ngoController validation exactly — name, description,
// address, contactNumber are all required non-empty strings.
function validate(form) {
  if (!form.name.trim())          return "Organization name is required";
  if (!form.description.trim())   return "Description is required";
  if (!form.address.trim())       return "Address is required";
  if (!form.contactNumber.trim()) return "Contact number is required";
  return null;
}

export default function OrganizationPage() {
  const toast = useToast();

  const [ngo, setNgo]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving]       = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/ngo/me");
      setNgo(res.data);
      setForm({
        name: res.data.name || "",
        description: res.data.description || "",
        address: res.data.address || "",
        contactNumber: res.data.contactNumber || "",
      });
    } catch (err) {
      // 404 = profile not created yet — expected first-run state for new NGOs.
      if (err.message?.toLowerCase().includes("not found")) {
        setNgo(null);
        setEditing(true); // jump straight into the create form
      } else {
        toast.error(err.message || "Failed to load organization profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setFormError("");
    const err = validate(form);
    if (err) return setFormError(err);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      contactNumber: form.contactNumber.trim(),
    };

    try {
      setSaving(true);
      if (ngo) {
        const res = await apiRequest("/ngo/me", "PATCH", payload);
        setNgo(res.data);
        toast.success("Organization profile updated successfully");
      } else {
        const res = await apiRequest("/ngo/create", "POST", payload);
        setNgo(res.data);
        toast.success("Organization profile created successfully");
      }
      setEditing(false);
    } catch (err) {
      setFormError(err.message || "Failed to save organization profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!ngo) return; // can't cancel out of the create flow — profile is required
    setForm({
      name: ngo.name || "",
      description: ngo.description || "",
      address: ngo.address || "",
      contactNumber: ngo.contactNumber || "",
    });
    setFormError("");
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex-1 p-5 md:p-7 flex flex-col gap-5">
        <PageHeader title="Organization Profile" subtitle="Manage your NGO's information" />
        <Card><Skeleton.Row /><Skeleton.Row /><Skeleton.Row /></Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 md:p-7 flex flex-col gap-5 overflow-y-auto">
      <PageHeader
        title="Organization Profile"
        subtitle="This information is shown to donors and verified by platform administrators"
        actions={
          ngo && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 text-[12px] px-4 py-[7px] rounded-full text-white font-medium transition"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
            >
              <Pencil size={13} /> Edit profile
            </button>
          )
        }
      />

      {/* First-time setup notice */}
      {!ngo && (
        <Card variant="sunken" className="border border-[var(--status-pending-dot)]/30 animate-rise-in">
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--status-pending-bg)", color: "var(--status-pending-fg)" }}
            >
              <ShieldAlert size={17} />
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Complete your organization profile
              </div>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Before you can view or manage donations, please provide your organization's details below.
                Your account will then be reviewed for verification by an administrator.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Verification status */}
      {ngo && (
        <Card className="flex items-center justify-between gap-4 flex-wrap animate-rise-in">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: ngo.isVerified ? "var(--status-verified-bg)" : "var(--status-pending-bg)",
                color: ngo.isVerified ? "var(--status-verified-fg)" : "var(--status-pending-fg)",
              }}
            >
              {ngo.isVerified ? <ShieldCheck size={17} /> : <ShieldAlert size={17} />}
            </div>
            <div>
              <div className="text-[11px] mb-1" style={{ color: "var(--color-text-muted)" }}>Verification status</div>
              <StatusBadge status={ngo.isVerified ? "verified" : "pending"} />
            </div>
          </div>
          {!ngo.isVerified && (
            <p className="text-xs max-w-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Your organization is pending verification. You can view incoming donations,
              but accepting them requires admin verification.
            </p>
          )}
        </Card>
      )}

      {/* Profile form / view */}
      <Card variant="bordered" className="animate-rise-in">
        <div className="text-[14px] font-medium mb-4" style={{ color: "var(--color-text-primary)" }}>
          {ngo ? "Organization details" : "Create organization profile"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Organization name" required full>
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Helping Hands Foundation"
                className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 text-sm transition-shadow"
              />
            ) : (
              <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{ngo?.name}</div>
            )}
          </Field>

          <Field label="Description" required full>
            {editing ? (
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your organization's mission and the communities you serve"
                className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 text-sm resize-none transition-shadow"
              />
            ) : (
              <div className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{ngo?.description}</div>
            )}
          </Field>

          <Field label="Address" required>
            {editing ? (
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, city, state, PIN code"
                className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 text-sm transition-shadow"
              />
            ) : (
              <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{ngo?.address}</div>
            )}
          </Field>

          <Field label="Contact number" required>
            {editing ? (
              <input
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-black/10 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 text-sm transition-shadow"
              />
            ) : (
              <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{ngo?.contactNumber}</div>
            )}
          </Field>
        </div>

        {formError && (
          <p
            className="text-xs mt-3 rounded-lg px-3 py-2 border animate-rise-in"
            style={{ color: "var(--status-rejected-fg)", backgroundColor: "var(--status-rejected-bg)", borderColor: "var(--status-rejected-dot)" }}
          >
            {formError}
          </p>
        )}

        {editing && (
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
            {ngo && (
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition disabled:opacity-60"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X size={14} /> Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-white text-sm px-5 py-2 rounded-lg disabled:opacity-60 transition"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = "var(--color-primary-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
            >
              {saving ? "Saving…" : ngo ? "Save changes" : "Create profile"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, required, full, children }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
        {label}{required && <span style={{ color: "var(--color-primary)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}