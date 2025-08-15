import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measures the width of a container and derives a height using a fixed aspect ratio.
 * Re-computes on container resize using ResizeObserver.
 *
 * @param {number} [min=180] Minimum width in pixels before applying aspect ratio
 * @param {number} [aspect=0.75] Aspect ratio: height = width * aspect
 * @returns {[React.RefObject<HTMLDivElement>, { w: number; h: number }]} Tuple of ref and current size
 */
export function useAutoSize(min = 180, aspect = 0.75) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = Math.max(entry.contentRect.width, min);
      setSize({ w, h: w * aspect });
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return [ref, size] as const;
}
