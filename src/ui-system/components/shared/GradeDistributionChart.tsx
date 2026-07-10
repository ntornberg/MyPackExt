import { useMemo } from "react";

import { cn } from "@/lib/utils";
import type { GradeData } from "@/types/api";

export const GRADE_DISTRIBUTION_COLORS = [
  "#15803d",
  "#65a30d",
  "#ca8a04",
  "#ea580c",
  "#b91c1c",
] as const;

/** Letter-grade shares (0-100) derived from API averages; total may be 0. */
export function gradeDistributionPercents(
  data: GradeData,
): { label: string; pct: number }[] {
  const { a_average, b_average, c_average, d_average, f_average } = data;
  const total = a_average + b_average + c_average + d_average + f_average;
  if (total <= 0) {
    return [];
  }
  return [
    { label: "A", pct: (a_average / total) * 100 },
    { label: "B", pct: (b_average / total) * 100 },
    { label: "C", pct: (c_average / total) * 100 },
    { label: "D", pct: (d_average / total) * 100 },
    { label: "F", pct: (f_average / total) * 100 },
  ];
}

type GradePieSlice = {
  label: string;
  pct: number;
  color: string;
  startDeg: number;
  endDeg: number;
};

function gradePieSlices(data: GradeData): GradePieSlice[] {
  const rows = gradeDistributionPercents(data);
  let cursor = -90;
  const out: GradePieSlice[] = [];
  rows.forEach((row, i) => {
    if (row.pct <= 0) {
      return;
    }
    const span = (row.pct / 100) * 360;
    out.push({
      label: row.label,
      pct: row.pct,
      color: GRADE_DISTRIBUTION_COLORS[i]!,
      startDeg: cursor,
      endDeg: cursor + span,
    });
    cursor += span;
  });
  return out;
}

function pieWedgePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const sweep = endDeg - startDeg;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/** SVG pie used on section cards, preview panels, and injected grade cards. */
export function GradeDistributionChart({
  data,
  size,
  className,
  wedgeStrokeWidth,
}: {
  data: GradeData;
  size: number;
  className?: string;
  /** Wedge outline; slightly thicker reads better on larger pies. */
  wedgeStrokeWidth?: number;
}) {
  const slices = useMemo(() => gradePieSlices(data), [data]);
  const pad = size >= 72 ? 2.5 : 2;
  const strokeW = wedgeStrokeWidth ?? (size >= 64 ? 1.5 : 1);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - pad;

  if (slices.length === 0) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("shrink-0 text-muted-foreground/25", className)}
        role="img"
        aria-label="Grade distribution unavailable"
      >
        <circle cx={cx} cy={cy} r={r} fill="currentColor" />
      </svg>
    );
  }

  if (slices.length === 1) {
    const only = slices[0]!;
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("shrink-0", className)}
        role="img"
        aria-label="Grade distribution pie chart"
      >
        <circle cx={cx} cy={cy} r={r} fill={only.color} />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Grade distribution pie chart"
    >
      {slices.map((s) => (
        <path
          key={s.label}
          d={pieWedgePath(cx, cy, r, s.startDeg, s.endDeg)}
          fill={s.color}
          stroke="var(--popover, #fff)"
          strokeWidth={strokeW}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
