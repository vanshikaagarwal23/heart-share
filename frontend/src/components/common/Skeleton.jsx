// Token-driven skeleton primitives. Uses the .shimmer utility (defined in
// index.css) instead of a flat animate-pulse, so loading states read as
// "content is arriving" rather than a static gray placeholder blinking.

function Bar({ className = "" }) {
  return <div className={`shimmer rounded ${className}`} />;
}

function Circle({ size = 32 }) {
  return (
    <div className="shimmer rounded-full shrink-0" style={{ width: size, height: size }} />
  );
}

function StatCard({ compact = false }) {
  return (
    <div
      className={`rounded-[10px] border border-black/5 ${compact ? "p-3" : "p-4"}`}
      style={{ backgroundColor: "var(--color-surface-sunken)" }}
    >
      <div className="h-3 shimmer rounded w-2/3 mb-3" />
      <div className={`shimmer rounded w-1/2 mb-2 ${compact ? "h-5" : "h-6"}`} />
      {!compact && <div className="h-2.5 shimmer rounded w-1/3" />}
    </div>
  );
}

function Row() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Circle size={36} />
      <div className="flex-1">
        <div className="h-3 shimmer rounded w-1/3 mb-2" />
        <div className="h-2.5 shimmer rounded w-1/4" />
      </div>
      <div className="h-5 shimmer rounded-full w-16" />
    </div>
  );
}

function Chart({ h = 180 }) {
  return <div className="shimmer rounded" style={{ height: h }} />;
}

const Skeleton = { Bar, Circle, StatCard, Row, Chart };
export default Skeleton;