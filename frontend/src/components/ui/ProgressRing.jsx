import { useEffect, useRef, useState } from "react";

// Circular SVG progress indicator — gives campaign funding progress a real
// focal point in a card grid, where a thin bar gets lost. Draws in with a
// stroke-dashoffset animation on mount/update rather than snapping to value.
export default function ProgressRing({ pct = 0, size = 56, stroke = 5, color = "#c0453a", track = "#ece8e3" }) {
  const safePct = Math.max(0, Math.min(pct, 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [offset, setOffset] = useState(circumference);
  const mounted = useRef(false);

  useEffect(() => {
    // rAF ensures the browser registers the initial (full) offset before
    // animating to the target, so the draw-in transition actually plays.
    const id = requestAnimationFrame(() => {
      setOffset(circumference - (safePct / 100) * circumference);
    });
    return () => cancelAnimationFrame(id);
  }, [safePct, circumference]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums" style={{ color }}>
        {safePct}%
      </div>
    </div>
  );
}