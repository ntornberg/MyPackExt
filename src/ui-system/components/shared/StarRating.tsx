import { StarIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const starShellStyle: CSSProperties = {
  position: "relative",
  display: "inline-block",
  flexShrink: 0,
  width: 14,
  height: 14,
  lineHeight: 0,
};

const starIconStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

export function StarRating({
  value,
  starClassName = "size-3.5",
  className,
}: {
  value: number;
  starClassName?: string;
  className?: string;
}) {
  const fullStars = Math.floor(value);
  const frac = value - fullStars;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      style={{ display: "flex", alignItems: "center", gap: 2 }}
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const isFull = i < fullStars;
        const isPartial = i === fullStars && frac > 0;
        const fillLevel = isFull ? 1 : isPartial ? Math.min(1, frac) : 0;
        return (
          <div key={i} className={starClassName} style={starShellStyle}>
            <StarIcon
              className={cn(
                "pointer-events-none absolute inset-0 text-muted-foreground/35",
                starClassName,
              )}
              color="#c2c7d0"
              strokeWidth={1.5}
              style={starIconStyle}
            />
            {fillLevel > 0 ? (
              <div
                className="absolute inset-0 overflow-hidden text-amber-400"
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  width: `${fillLevel * 100}%`,
                  color: "#f59e0b",
                }}
              >
                <StarIcon
                  className={cn(
                    "pointer-events-none absolute left-0 top-0 fill-amber-400 text-amber-400",
                    starClassName,
                  )}
                  color="currentColor"
                  fill="currentColor"
                  strokeWidth={0}
                  style={starIconStyle}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
