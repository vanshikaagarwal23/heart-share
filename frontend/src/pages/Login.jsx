import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { slideLeft } from "../animation";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

const PITCH_POINTS = [
  { icon: HeartHandshake, text: "Connect directly with verified NGOs" },
  { icon: ShieldCheck,    text: "Every organization is reviewed before approval" },
  { icon: Users,          text: "Track your impact from donation to delivery" },
];

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const validate = () => {
    if (!email.trim())    return "Email is required";
    if (!password.trim()) return "Password is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";
    return null;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setLoading(true);
      const res = await apiRequest("/auth/login", "POST", { email, password });
      login(res.data.user, res.data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <motion.div {...slideLeft} className="flex min-h-screen" style={{ backgroundColor: "var(--color-bg-page)" }}>

      {/* Brand panel */}
      <div
        className="hidden md:flex flex-1 flex-col justify-center items-center px-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #fff4ec 0%, #faf6f1 60%)" }}
      >
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <img src="/login.avif" className="w-[62%] max-w-sm relative z-10 drop-shadow-sm" alt="Heart Share" />
        <div className="mt-8 space-y-3 max-w-xs relative z-10">
          {PITCH_POINTS.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 stagger-item animate-rise-in" style={{ "--stagger-index": i }}>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(192,69,58,0.10)", color: "var(--color-primary)" }}
              >
                <p.icon size={14} />
              </div>
              <span className="text-[12.5px]" style={{ color: "var(--color-text-secondary)" }}>{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="w-full max-w-[300px]">
          <Link to="/" className="inline-flex items-center gap-1 text-sm mb-5 transition" style={{ color: "var(--color-text-faint)" }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          <h1 className="text-[32px] font-semibold leading-tight" style={{ color: "var(--color-accent)" }}>Welcome back</h1>
          <p className="mb-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <b>Share food. Spread kindness.</b>
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
                <input
                  type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" disabled={loading}
                  className="w-full pl-10 pr-3 p-3 outline-none border border-black/10 rounded-lg focus:ring-2 focus:ring-[var(--color-accent)]/30 disabled:opacity-60 text-sm transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
                <input
                  type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" disabled={loading}
                  className="w-full pl-10 pr-3 p-3 outline-none border border-black/10 rounded-lg focus:ring-2 focus:ring-[var(--color-accent)]/30 disabled:opacity-60 text-sm transition-shadow"
                />
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
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
            New here?{" "}
            <Link to="/signup" className="font-medium hover:underline" style={{ color: "var(--color-accent)" }}>Create account</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}