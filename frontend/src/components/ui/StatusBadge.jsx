// Status vocabulary used across the app, normalized into one set of visual
// buckets. Multiple raw backend values can share a bucket (e.g. "approved"
// reads the same as "accepted") so the badge stays consistent everywhere
// it's used — Donations table, Dashboard table, NGO verification, campaign
// state — rather than each surface inventing its own colors.
const BUCKETS = {
  pending:   { bg: "var(--status-pending-bg)",   fg: "var(--status-pending-fg)",   dot: "var(--status-pending-dot)" },
  accepted:  { bg: "var(--status-accepted-bg)",  fg: "var(--status-accepted-fg)",  dot: "var(--status-accepted-dot)" },
  approved:  { bg: "var(--status-accepted-bg)",  fg: "var(--status-accepted-fg)",  dot: "var(--status-accepted-dot)" },
  active:    { bg: "var(--status-accepted-bg)",  fg: "var(--status-accepted-fg)",  dot: "var(--status-accepted-dot)" },
  completed: { bg: "var(--status-completed-bg)", fg: "var(--status-completed-fg)", dot: "var(--status-completed-dot)" },
  rejected:  { bg: "var(--status-rejected-bg)",  fg: "var(--status-rejected-fg)",  dot: "var(--status-rejected-dot)" },
  inactive:  { bg: "var(--status-rejected-bg)",  fg: "var(--status-rejected-fg)",  dot: "var(--status-rejected-dot)" },
  verified:  { bg: "var(--status-verified-bg)",  fg: "var(--status-verified-fg)",  dot: "var(--status-verified-dot)" },
  closing:   { bg: "var(--status-pending-bg)",   fg: "var(--status-pending-fg)",   dot: "var(--status-pending-dot)" },
  new:       { bg: "var(--status-completed-bg)", fg: "var(--status-completed-fg)", dot: "var(--status-completed-dot)" },
};

const NEUTRAL = { bg: "var(--status-neutral-bg)", fg: "var(--status-neutral-fg)", dot: "var(--status-neutral-dot)" };

export default function StatusBadge({ status, className = "" }) {
  const key = String(status || "").toLowerCase();
  const palette = BUCKETS[key] || NEUTRAL;
  const label = status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : "Unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap border border-black/[0.04] ${className}`}
      style={{ backgroundColor: palette.bg, color: palette.fg }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{ backgroundColor: palette.dot }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}