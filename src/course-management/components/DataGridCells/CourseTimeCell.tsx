import { Typography } from "@mui/material";

import type { ModifiedSection } from "../../types/Section";

/**
 * Renders compact course time text for dedicated table column.
 */
export const CourseTimeCell = (params: ModifiedSection) => {
  const timeText =
    params.dayTime && params.dayTime.trim().length > 0 ? params.dayTime : "TBD";

  return (
    <Typography
      variant="caption"
      sx={{
        display: "inline-block",
        maxWidth: 180,
        color: "text.secondary",
        fontSize: "0.72rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        verticalAlign: "middle",
      }}
      title={timeText}
    >
      {timeText}
    </Typography>
  );
};
