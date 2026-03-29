import InfoIcon from "@mui/icons-material/Info";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { useMemo, useState } from "react";


import type { ModifiedSection } from "../../types/Section";

import { CalendarView } from "./CalendarView";

/**
 * Renders compact course information with a rich tooltip showing details and the calendar view.
 *
 * @param {ModifiedSection} params Section data used to render info and the calendar peek
 * @returns {JSX.Element} Info cell element
 */
export const CourseInfoCell = (params: ModifiedSection) => {
  const { section, component, dayTime, location } = params;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const tooltipContent = useMemo(
    () => (
      <Box sx={{ p: 1, maxWidth: 800 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Section: {section}
        </Typography>
        <Typography variant="body2">Type: {component}</Typography>
        <Typography variant="body2">Time: {dayTime}</Typography>
        <Typography variant="body2">Location: {location}</Typography>
        {tooltipOpen ? <CalendarView {...params} /> : null}
      </Box>
    ),
    [component, dayTime, location, params, section, tooltipOpen],
  );

  return (
    <Box
      sx={{
        maxWidth: 220,
        minWidth: 0,
        display: "flex",
        gap: 0.75,
        alignItems: "center",
        flexWrap: "nowrap",
      }}
    >
      <Tooltip
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        placement="right-end"
        title={tooltipContent}
        arrow
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: "900px",
              maxHeight: "800px",
              height: "auto",
              width: "auto",
              bgcolor: "background.paper",
              color: "text.primary",
              boxShadow: 4,
              fontSize: "0.875rem",
              p: 0,
            },
          },
        }}
      >
        <IconButton size="small">
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {component && (
        <Chip
          label={component}
          size="small"
          variant="outlined"
          sx={{ fontSize: "0.68rem", height: 20, borderColor: "divider" }}
        />
      )}
      {location?.includes("Online") && (
        <Chip label="Online" size="small" color="primary" sx={{ height: 20, fontSize: "0.68rem" }} />
      )}
    </Box>
  );
};
