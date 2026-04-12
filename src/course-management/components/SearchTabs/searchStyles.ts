export const searchButtonSx = {
  px: 2.5,
  minWidth: 112,
  height: 44,
  alignSelf: "start",
  mt: 0.5,
  fontWeight: 600,
  letterSpacing: 0.15,
  backgroundColor: "#2a3f64",
  backgroundImage: "none",
  boxShadow: 3,
  "&:hover": {
    backgroundColor: "#243657",
    boxShadow: 5,
  },
  "&:active": {
    backgroundColor: "#1d2d49",
  },
  "@media (prefers-color-scheme: dark)": {
    backgroundColor: "#3a5687",
    "&:hover": {
      backgroundColor: "#334d79",
    },
    "&:active": {
      backgroundColor: "#2b4268",
    },
  },
} as const;
