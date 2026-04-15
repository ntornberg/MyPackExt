import { Badge } from "@/components/ui/badge";

import type { ModifiedSection } from "../../types/Section";

/**
 * Displays the enrollment tally as a Badge (e.g., "35/50").
 *
 * @param {ModifiedSection} params Section data containing `enrollment`
 * @returns {JSX.Element} Badge element
 */
export const EnrollmentChipCell = (params: ModifiedSection) => {
  const { enrollment } = params;
  return (
    <Badge
      className="bg-[rgb(86,100,129)] font-semibold text-white hover:bg-[rgb(86,100,129)]"
    >
      {enrollment}
    </Badge>
  );
};
