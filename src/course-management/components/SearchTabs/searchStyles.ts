export const searchButtonSx = {
  px: 2.5,
  minWidth: 112,
  height: 44,
  alignSelf: "start",
  mt: 0.5,
  fontWeight: 600,
  letterSpacing: 0.3,
  backgroundColor: "#4d83ff",
  backgroundImage: "linear-gradient(180deg, #5d95ff 0%, #3f79ff 100%)",
  boxShadow: "0 10px 22px rgba(61, 124, 255, 0.28)",
  "&:hover": {
    backgroundColor: "#3b74f6",
    backgroundImage: "linear-gradient(180deg, #6aa0ff 0%, #3b74f6 100%)",
    boxShadow: "0 12px 26px rgba(61, 124, 255, 0.34)",
  },
  "&:active": {
    backgroundColor: "#315fca",
    backgroundImage: "none",
  },
  "@media (prefers-color-scheme: dark)": {
    backgroundColor: "#4d83ff",
    backgroundImage: "linear-gradient(180deg, #5d95ff 0%, #3f79ff 100%)",
    "&:hover": {
      backgroundColor: "#3b74f6",
      backgroundImage: "linear-gradient(180deg, #6aa0ff 0%, #3b74f6 100%)",
    },
    "&:active": {
      backgroundColor: "#315fca",
      backgroundImage: "none",
    },
  },
} as const;
