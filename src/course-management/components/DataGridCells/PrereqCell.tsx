import WarningIcon from "@mui/icons-material/Warning";
import { IconButton, Tooltip } from "@mui/material";

import type { ModifiedSection } from "../../types/Section";

/**
 * Prerequisite indicator tooltip for a section.
 *
 * @param {ModifiedSection} params Section containing `requisites`
 * @returns {JSX.Element} Tooltip with warning icon
 */
export const PrereqCell = (params: ModifiedSection) => {
  const { requisites } = params;
  return (
    <Tooltip title={requisites}>
      <IconButton>
        <WarningIcon color="warning" />
      </IconButton>
    </Tooltip>
  );
};
