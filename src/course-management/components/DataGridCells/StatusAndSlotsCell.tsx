import chroma from "chroma-js";

import { Badge } from "@/components/ui/badge";

import type { ModifiedSection } from "../../types/Section";

const ENROLLMENT_HEAT_FALLBACK = "hsl(220, 12%, 42%)";
const ENROLLMENT_HEAT_SCALE = chroma
  .scale(["#b91c1c", "#f59e0b", "#16a34a"])
  .domain([0, 0.4, 1])
  .mode("lab");

function getEnrollmentColor(enrollment: string | undefined): string {
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

const STATUS_CLASSES: Record<string, string> = {
  Open: "bg-green-700 text-white hover:bg-green-700",
  Closed: "bg-red-700 text-white hover:bg-red-700",
  Waitlist: "bg-amber-600 text-white hover:bg-amber-600",
  Reserved: "bg-sky-700 text-white hover:bg-sky-700",
};

/**
 * Shows availability status, enrollment tally, and section id as chips.
 *
 * @param {ModifiedSection} params Section data
 * @returns {JSX.Element} Status chip row
 */
export const StatusAndSlotsCell = (params: ModifiedSection) => {
  const { availability, enrollment, section } = params;

  const statusClass =
    STATUS_CLASSES[availability ?? ""] ??
    "bg-muted text-muted-foreground hover:bg-muted";

  const chipColor = getEnrollmentColor(enrollment);

  return (
    <div className="flex items-center gap-2">
      <Badge className={`text-[0.7rem] sm:text-[0.75rem] md:text-[0.8rem] ${statusClass}`}>
        {availability}
      </Badge>
      <Badge
        className="font-semibold text-[0.7rem] text-white sm:text-[0.75rem] md:text-[0.8rem]"
        style={{ backgroundColor: chipColor }}
      >
        {enrollment}
      </Badge>
      <Badge
        variant="secondary"
        className="font-semibold text-[0.7rem] sm:text-[0.75rem] md:text-[0.8rem]"
      >
        {section}
      </Badge>
    </div>
  );
};
