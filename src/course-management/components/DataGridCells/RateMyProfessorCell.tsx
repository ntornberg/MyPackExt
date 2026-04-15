import { StarIcon } from "lucide-react";

import type { ModifiedSection } from "../../types/Section";

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, value - i));
        return (
          <span key={i} className="relative inline-block size-[1.05rem]">
            {/* Empty star */}
            <StarIcon className="absolute inset-0 size-full text-[#B0B0B0]" />
            {/* Filled star clipped to fill ratio */}
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon className="size-full text-[#FFD700]" fill="#FFD700" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Displays a read-only star rating for the section's primary instructor.
 *
 * @param {ModifiedSection} params Section containing `professor_rating`
 * @returns {JSX.Element} Rating cell
 */
export const RateMyProfessorCell = (params: ModifiedSection) => {
  const { professor_rating } = params;

  if (!professor_rating || !professor_rating.avgRating) {
    return (
      <span className="text-sm text-muted-foreground">No rating available</span>
    );
  }

  const rating = professor_rating.avgRating;

  return (
    <div className="flex min-h-[28px] flex-wrap items-center gap-[0.75]">
      <StarRating value={rating} />
      <span className="text-sm font-semibold leading-[1.2] tabular-nums">
        {rating.toFixed(1)}
      </span>
      <span className="text-xs leading-[1.2] text-muted-foreground">/ 5</span>
    </div>
  );
};
