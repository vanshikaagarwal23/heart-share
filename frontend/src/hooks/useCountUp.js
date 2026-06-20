import { useEffect, useRef, useState } from "react";

// Animates a number from 0 to `target` over `duration` ms using an
// ease-out curve, so dashboard stats feel like they're arriving rather
// than being printed instantly. Re-runs whenever `target` changes (e.g.
// after data refetch) and is safe to call with non-numeric targets
// (returns the value unanimated).
export default function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const frameRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    const numeric = typeof target === "number" ? target : Number(target);
    if (!Number.isFinite(numeric)) {
      setValue(target);
      return;
    }

    startRef.current = null;
    cancelAnimationFrame(frameRef.current);

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(Math.round(numeric * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}