import { useMemo, useSyncExternalStore } from "react";
import chroma from "chroma-js";
import { InfoIcon, StarIcon } from "lucide-react";

import type { GradeData, MatchedRateMyProf } from "../../../types/api";
import { cn } from "@/lib/utils";
import { buildRateMyProfessorUrl } from "@/utils/rateMyProfessor";

const ENROLLMENT_HEAT_FALLBACK = "hsl(220, 12%, 42%)";
const ENROLLMENT_HEAT_SCALE = chroma
  .scale(["#b91c1c", "#f59e0b", "#16a34a"])
  .domain([0, 0.4, 1])
  .mode("lab");

/** Matches `StatusAndSlotsCell` seat chip heat so staging and preview rail stay consistent. */
export function seatTallyHeatBackground(enrollment: string | undefined): string {
  if (!enrollment) {
    return ENROLLMENT_HEAT_FALLBACK;
  }

  const match = enrollment.match(/(\d+)\/(\d+)/);
  if (!match) {
    return ENROLLMENT_HEAT_FALLBACK;
  }

  const enrolled = Number.parseInt(match[1]!, 10);
  const capacity = Number.parseInt(match[2]!, 10);
  if (Number.isNaN(enrolled) || Number.isNaN(capacity) || capacity <= 0) {
    return ENROLLMENT_HEAT_FALLBACK;
  }

  const openSeatRatio = Math.max(
    0,
    Math.min(1, (capacity - enrolled) / capacity),
  );

  return ENROLLMENT_HEAT_SCALE(openSeatRatio).hex();
}

const GRADE_DISTRIBUTION_COLORS = [
  "#15803d",
  "#65a30d",
  "#ca8a04",
  "#ea580c",
  "#b91c1c",
] as const;
const RMP_LINK_TOOLTIP = "Click for link to Rate My Professor";

/** Letter-grade shares (0–100) derived from API averages; total may be 0. */
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

/** SVG pie used on section cards and in the grade breakdown panel. */
export function GradeDistributionPieChart({
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
          stroke="var(--popover)"
          strokeWidth={strokeW}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function StarRow({
  value,
  starClassName,
}: {
  value: number;
  starClassName: string;
}) {
  const fullStars = Math.floor(value);
  const frac = value - fullStars;
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => {
        const isFull = i < fullStars;
        const isPartial = i === fullStars && frac > 0;
        const fillLevel = isFull ? 1 : isPartial ? Math.min(1, frac) : 0;
        return (
          <div key={i} className={cn("relative shrink-0", starClassName)}>
            <StarIcon
              className={cn(
                "pointer-events-none absolute inset-0 text-muted-foreground/35",
                starClassName,
              )}
              strokeWidth={1.5}
            />
            {fillLevel > 0 ? (
              <div
                className="absolute inset-0 overflow-hidden text-amber-400"
                style={{ width: `${fillLevel * 100}%` }}
              >
                <StarIcon
                  className={cn(
                    "pointer-events-none absolute left-0 top-0 fill-amber-400 text-amber-400",
                    starClassName,
                  )}
                  strokeWidth={0}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ProfessorNameLink({
  name,
  profileUrl,
  className,
}: {
  name: string;
  profileUrl: string;
  className?: string;
}) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1 underline-offset-2 hover:underline", className)}
      title={RMP_LINK_TOOLTIP}
      aria-label={RMP_LINK_TOOLTIP}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(profileUrl, "_blank", "noopener,noreferrer");
      }}
    >
      <span className="truncate">{name}</span>
      <span
        aria-hidden
        title={RMP_LINK_TOOLTIP}
        className="inline-flex size-3 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground/85"
      >
        <InfoIcon className="size-2" />
      </span>
    </a>
  );
}

/** Lucide star row + numeric score for section list rows (staging, compact layouts). */
export function RmpStarsWithScore({
  avgRating,
  rating,
  starClassName = "size-3.5",
  className,
}: {
  avgRating: number | null | undefined;
  rating?: MatchedRateMyProf | null;
  starClassName?: string;
  className?: string;
}) {
  if (avgRating == null || Number.isNaN(avgRating)) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>No RMP</span>
    );
  }

  const profileUrl = rating ? buildRateMyProfessorUrl(rating) : null;

  const content = (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1.5 align-middle",
        className,
      )}
      title={`Rate My Professor: ${avgRating.toFixed(1)} / 5`}
    >
      <StarRow value={avgRating} starClassName={starClassName} />
      <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
        {avgRating.toFixed(1)}
      </span>
      <span className="whitespace-nowrap text-xs text-muted-foreground">/ 5</span>
    </div>
  );

  if (!profileUrl) {
    return content;
  }

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit self-start rounded-sm underline-offset-2 hover:underline"
      title={RMP_LINK_TOOLTIP}
      aria-label={RMP_LINK_TOOLTIP}
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </a>
  );
}

export function ProfessorRatingSummary({
  rating,
  className,
  variant = "default",
}: {
  rating: MatchedRateMyProf;
  className?: string;
  variant?: "default" | "compact";
}) {
  const value = rating.avgRating;
  const hasNumeric = value != null && !Number.isNaN(value);
  const profileUrl = buildRateMyProfessorUrl(rating);
  const professorName = rating.master_name?.trim() || "Staff";

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Rate My Professor
        </div>
        {hasNumeric ? (
          <div className="flex flex-wrap items-center gap-2">
            <StarRow value={value!} starClassName="size-4" />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {value!.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">/ 5</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No Rate My Professor data for this section.</p>
        )}
        {profileUrl ? (
          <ProfessorNameLink
            name={professorName}
            profileUrl={profileUrl}
            className="max-w-full truncate text-sm font-semibold text-foreground"
          />
        ) : (
          <p className="truncate text-sm font-semibold text-foreground">{professorName}</p>
        )}
        {rating.department ? (
          <p className="truncate text-[11px] text-muted-foreground">{rating.department}</p>
        ) : null}
      </div>
    );
  }

  if (!hasNumeric) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No Rate My Professor data for this section.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Rate My Professor
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StarRow value={value!} starClassName="size-4" />
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {value!.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">/ 5.0</span>
      </div>
      {rating.master_name ? (
        profileUrl ? (
          <ProfessorNameLink
            name={rating.master_name}
            profileUrl={profileUrl}
            className="text-xs text-muted-foreground"
          />
        ) : (
          <p className="text-xs text-muted-foreground">{rating.master_name}</p>
        )
      ) : null}
      {rating.department ? (
        <p className="text-[11px] text-muted-foreground/90">{rating.department}</p>
      ) : null}
    </div>
  );
}

export const emptyGradeData: GradeData = {
  course_name: "",
  subject: "",
  instructor_name: "",
  a_average: 0,
  b_average: 0,
  c_average: 0,
  d_average: 0,
  f_average: 0,
  class_avg_min: 0,
  class_avg_max: 0,
};

export const emptyProfessorRating: MatchedRateMyProf = {
  master_name: "",
  first_name: null,
  last_name: null,
  avgRating: null,
  department: null,
  school: null,
  id: null,
};

export function GradeDistributionPercentList({
  rows,
  className,
  variant = "default",
  fractionDigits = 0,
}: {
  rows: { label: string; pct: number }[];
  className?: string;
  /** `compact` = tighter typography for section compare cards. */
  variant?: "default" | "compact";
  /** Decimal places for percentage (cards often use 1). */
  fractionDigits?: 0 | 1;
}) {
  const fmt = (pct: number) =>
    fractionDigits === 1 ? pct.toFixed(1) : pct.toFixed(0);
  return (
    <ul
      className={cn(
        "min-w-0 tabular-nums",
        variant === "compact"
          ? "space-y-0.5 text-[10px] leading-tight sm:text-[11px]"
          : "space-y-1 text-xs sm:text-sm",
        className,
      )}
    >
      {rows.map((r, i) => (
        <li
          key={r.label}
          className="flex min-w-0 items-center justify-between gap-1.5 sm:gap-2"
        >
          <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground sm:gap-1.5">
            <span
              className={cn(
                "shrink-0 rounded-sm",
                variant === "compact" ? "size-1.5 sm:size-2" : "size-2",
              )}
              style={{ backgroundColor: GRADE_DISTRIBUTION_COLORS[i] }}
              aria-hidden
            />
            <span className="font-medium text-foreground">
              {r.label}
              {variant === "default" ? ":" : ""}
            </span>
          </span>
          <span className="shrink-0 font-semibold text-foreground">
            {fmt(r.pct)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function useNarrowGradePreview(maxWidth: number): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(max-width: ${maxWidth}px)`).matches,
    () => false,
  );
}

/** Full grade breakdown for the pinned section in the preview rail (inline, no modal). */
export function GradeDistributionPanel({
  data,
  className,
}: {
  data: GradeData;
  className?: string;
}) {
  const rows = useMemo(() => gradeDistributionPercents(data), [data]);
  const total =
    data.a_average +
    data.b_average +
    data.c_average +
    data.d_average +
    data.f_average;

  const narrowPreview = useNarrowGradePreview(380);
  const previewPieSize = narrowPreview ? 96 : 120;

  const gpaSummary =
    Number.isFinite(data.class_avg_min) &&
    Number.isFinite(data.class_avg_max) ? (
      <p className="text-[11px] text-muted-foreground">
        Typical class GPA range: {data.class_avg_min.toFixed(2)} –{" "}
        {data.class_avg_max.toFixed(2)}
      </p>
    ) : null;

  const subtitle =
    [data.course_name, data.instructor_name].filter(Boolean).join(" · ") ||
    null;

  if (total <= 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No grade distribution data for this section.
      </div>
    );
  }

  return (
    <div className={cn("w-full min-w-0 space-y-2", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Grade distribution
      </div>
      {subtitle ? (
        <p className="text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
          {subtitle}
        </p>
      ) : null}
      <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex shrink-0 justify-center sm:justify-start">
          <div className="rounded-xl border border-border/60 bg-muted/15 p-2 ring-1 ring-foreground/5 sm:p-2.5">
            <GradeDistributionPieChart
              data={data}
              size={previewPieSize}
              className="drop-shadow-sm"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <GradeDistributionPercentList rows={rows} className="w-full" />
        </div>
      </div>
      {gpaSummary}
    </div>
  );
}
