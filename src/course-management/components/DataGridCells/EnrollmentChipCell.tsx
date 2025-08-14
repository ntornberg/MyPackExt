import { Chip } from "@mui/material";

import type { ModifiedSection } from "../../../core/utils/CourseSearch/MergeDataUtil.ts";

/**
 * Displays the enrollment tally as a Chip (e.g., "35/50").
 *
 * @param {ModifiedSection} params Section data containing `enrollment`
 * @returns {JSX.Element} Chip element
 */
export const EnrollmentChipCell = (params: ModifiedSection) => {
  const { enrollment } = params;
  return (
    <Chip
      label={enrollment}
      sx={{
        backgroundColor: "rgb(86, 100, 129)",
        color: "#fff",
        fontWeight: 600,
      }}
    />
  );
};
