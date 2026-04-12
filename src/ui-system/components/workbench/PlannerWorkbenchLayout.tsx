import { Box } from "@mui/material";
import type { ReactNode } from "react";

type PlannerWorkbenchLayoutProps = {
  controls: ReactNode;
  results: ReactNode;
  preview: ReactNode;
};

export function PlannerWorkbenchLayout({
  controls,
  results,
  preview,
}: PlannerWorkbenchLayoutProps) {
  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 1, md: 2 },
        display: "grid",
        gap: 2,
        alignItems: "start",
        gridTemplateColumns: {
          xs: "1fr",
          xl: "16rem minmax(0, 1fr) 24rem",
        },
        gridTemplateAreas: {
          xs: '"controls" "results" "preview"',
          xl: '"controls results preview"',
        },
      }}
    >
      <Box sx={{ minWidth: 0, gridArea: "controls" }}>{controls}</Box>
      <Box sx={{ minWidth: 0, gridArea: "results" }}>{results}</Box>
      <Box
        sx={{
          minWidth: 0,
          gridArea: "preview",
          position: { xl: "sticky" },
          top: { xl: 0 },
        }}
      >
        {preview}
      </Box>
    </Box>
  );
}
