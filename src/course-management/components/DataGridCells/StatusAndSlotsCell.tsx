import { Box, Chip } from "@mui/material";

import type { ModifiedSection } from "../../types/Section";

function getEnrollmentColor(enrollment: string | undefined): string {
  if (!enrollment) return "rgba(120, 130, 145, 0.25)";
  const match = enrollment.match(/(\d+)\/(\d+)/);
  if (!match) return "rgba(120, 130, 145, 0.25)";
  const current = parseInt(match[1], 10);
  const max = parseInt(match[2], 10);
  if (isNaN(current) || isNaN(max) || max === 0) return "rgba(120, 130, 145, 0.25)";
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

/**
 * Shows availability status, enrollment tally, and section id as chips.
 *
 * @param {ModifiedSection} params Section data
 * @returns {JSX.Element} Status chip row
 */
export const StatusAndSlotsCell = (params: ModifiedSection) => {
  const { availability, enrollment, section } = params;

  let statusColor = "success";
  if (availability === "Open") {
    statusColor = "success";
  } else if (availability === "Closed") {
    statusColor = "error";
  } else if (availability === "Waitlist") {
    statusColor = "warning";
  } else if (availability === "Reserved") {
    statusColor = "info";
  }

  const chipColor = getEnrollmentColor(enrollment);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Chip
        label={availability}
        color={statusColor as any}
        size="small"
        sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" } }}
      />
      <Chip
        label={enrollment}
        size="small"
        sx={{
          backgroundColor: chipColor,
          color: "#fff",
          fontWeight: 600,
          fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
        }}
      />
      <Chip
        label={section}
        size="small"
        sx={{
          backgroundColor: "action.hover",
          color: "text.primary",
          fontWeight: 600,
          fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
        }}
      />
    </Box>
  );
};
