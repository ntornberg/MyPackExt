import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Circular progress indicator with optional status label underneath.
 *
 * @param {{ value: number; label?: string }} props Progress value and optional label
 * @returns {JSX.Element} Circular progress with label
 */
export function CircularProgressWithLabel({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress variant="determinate" value={value} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "center", maxWidth: "200px" }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}
