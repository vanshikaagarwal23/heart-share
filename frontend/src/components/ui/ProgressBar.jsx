export default function ProgressBar({ pct = 0, color }) {
  
  // 🆕 Clamp value between 0–100
  const safePct = Math.max(0, Math.min(pct, 100));

  return (
    <div className="h-[5px] bg-[#ece8e3] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-in-out"
        style={{
          width: `${safePct}%`,
          backgroundColor: color || "#c0453a",
        }}
      />
    </div>
  );
}