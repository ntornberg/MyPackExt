/**
 * Circular progress indicator with optional status label underneath.
 * Pure SVG — no MUI dependency.
 */
export function CircularProgressWithLabel({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={44} height={44} className="-rotate-90">
          {/* Track */}
          <circle
            cx={22}
            cy={22}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            className="text-border"
          />
          {/* Progress */}
          <circle
            cx={22}
            cy={22}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-[stroke-dashoffset] duration-300 ease-linear"
          />
        </svg>
        <span className="absolute text-[0.6rem] font-semibold tabular-nums text-muted-foreground">
          {`${Math.round(value)}%`}
        </span>
      </div>
      {label && (
        <p className="max-w-[200px] text-center text-xs text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}
