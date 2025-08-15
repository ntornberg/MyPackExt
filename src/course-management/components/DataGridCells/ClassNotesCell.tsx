import InfoIcon from "@mui/icons-material/Info";
import { IconButton, Tooltip } from "@mui/material";

import type { ModifiedSection } from "../../types/Section";

/**
 * Displays a tooltip icon with class notes when present.
 *
 * @param {ModifiedSection} params Section containing `notes`
 * @returns {JSX.Element} Tooltip with info icon
 */
export const ClassNotesCell = (params: ModifiedSection) => {
  const { notes } = params;
  return (
    <Tooltip title={notes}>
      <IconButton>
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
};
