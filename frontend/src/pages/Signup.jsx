import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowLeft, HeartHandshake, Building2 } from "lucide-react";
import { slideRight } from "../animation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiRequest } from "../services/api";

const ROLES = [
  { key: "donor", icon: HeartHandshake, title: "Donor", desc: "Give money or items" },
  { key: "ngo",   icon: Building2,      title: "NGO",   desc: "Receive contributions" },
];

export default function Signup() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const toast     = useToast();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("donor");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";
    if (!password || password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setLoading(true);
      const res = await apiRequest("/auth/register", "POST", { name, email, password, role });
      login(res.data.user, res.data.token);
      navigate("/dashboard", { replace: true });
      // Account creation only makes a User — an NGO still needs to fill out
      // their organization profile (name, address, contact number) before
      // anything donation-related will work. Send them straight there
      // instead of dropping them on the empty Dashboard tab with no hint.
      if (role === "ngo") {
        toast.info("Almost there — set up your organization profile to start receiving donations.");
        window.dispatchEvent(new CustomEvent("heartshare:navigate", { detail: "Organization" }));
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <motion.div {...slideRight} className="flex min-h-screen" style={{ backgroundColor: "var(--color-bg-page)" }}>

      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="w-full max-w-[320px]">
          <Link to="/" className="inline-flex items-center gap-1 text-sm mb-5 transition" style={{ color: "var(--color-text-faint)" }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          <h1 className="text-[32px] font-semibold leading-tight" style={{ color: "var(--color-accent)" }}>Create account</h1>
          <p className="mb-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <b>Join the kindness movement!</b>
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
                <input
                  type="text" placeholder="Jordan Lee" value={name}
                  onChange={(e) => setName(e.target.value)} disabled={loading} autoComplete="name"
                  className="w-full pl-10 pr-3 p-3 outline-none border border-black/10 rounded-lg focus:ring-2 focus:ring-[var(--color-accent)]/30 disabled:opacity-60 text-sm transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
                <input
                  type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email"
                  className="w-full pl-10 pr-3 p-3 outline-none border border-black/10 rounded-lg focus:ring-2 focus:ring-[var(--color-accent)]/30 disabled:opacity-60 text-sm transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Password <span style={{ color: "var(--color-text-faint)" }}>(min. 6 characters)</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
                <input
                  type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="new-password"
                  className="w-full pl-10 pr-3 p-3 outline-none border border-black/10 rounded-lg focus:ring-2 focus:ring-[var(--color-accent)]/30 disabled:opacity-60 text-sm transition-shadow"
                />
              </div>
            </div>

            {/* Role selector — visual choice, consistent with the donation-type pattern */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>I am signing up as</label>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    disabled={loading}
                    onClick={() => setRole(r.key)}
                    className="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all disabled:opacity-60"
                    style={
                      role === r.key
                        ? { borderColor: "var(--color-accent)", backgroundColor: "#fff4ec" }
                        : { borderColor: "var(--color-border)", backgroundColor: "#fff" }
                    }
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: role === r.key ? "var(--color-accent)" : "var(--color-bg-sidebar-tile)",
                        color: role === r.key ? "#fff" : "var(--color-text-muted)",
                      }}
                    >
                      <r.icon size={14} />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>{r.title}</div>
                      <div className="text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p
                className="text-xs text-center rounded-lg px-3 py-2 border animate-rise-in"
                style={{ color: "var(--status-rejected-fg)", backgroundColor: "var(--status-rejected-bg)", borderColor: "var(--status-rejected-dot)" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="text-white p-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--color-accent)" }}>Log in</Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex flex-1 justify-center items-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, #fff4ec 0%, #faf6f1 60%)" }}>
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <img src="/login.avif" className="w-[62%] max-w-sm relative z-10 drop-shadow-sm" alt="Heart Share" />
      </div>
    </motion.div>
  );
}