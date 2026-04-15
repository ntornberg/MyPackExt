import { Badge } from "@/components/ui/badge";

import type { ModifiedSection } from "../../types/Section";

function getEnrollmentColor(enrollment: string | undefined): string {
  if (!enrollment) return "rgba(120, 130, 145, 0.25)";
  const match = enrollment.match(/(\d+)\/(\d+)/);
  if (!match) return "rgba(120, 130, 145, 0.25)";
  const current = parseInt(match[1], 10);
  const max = parseInt(match[2], 10);
  if (isNaN(current) || isNaN(max) || max === 0)
    return "rgba(120, 130, 145, 0.25)";
  const ratio = current / max;
  // green when mostly empty → yellow at half → orange/red when nearly full
  if (ratio < 0.5) {
    return `hsl(120, 60%, 35%)`; // green
  } else if (ratio < 0.8) {
    const hue = Math.round(120 - ((ratio - 0.5) / 0.3) * 65); // 120→55
    return `hsl(${hue}, 75%, 38%)`;
  } else if (ratio < 0.98) {
    const hue = Math.round(55 - ((ratio - 0.8) / 0.18) * 45); // 55→10
    return `hsl(${hue}, 80%, 38%)`;
  } else {
    return `hsl(0, 75%, 32%)`; // dark red — full
  }
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
