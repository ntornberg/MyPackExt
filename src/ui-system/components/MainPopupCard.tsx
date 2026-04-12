import { TabContext, TabList, TabPanel } from "@mui/lab";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { Box, Button, Dialog, Tab, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { useColorScheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { logEvent } from "../../analytics/ga4";
import CourseSearch from "../../course-management/components/SearchTabs/CourseSearch";
import GEPSearch from "../../course-management/components/SearchTabs/GEPSearch";
import PlanSearch from "../../course-management/components/SearchTabs/PlanSearch";
import {
  CourseSearchDataInitialState,
  GEPDataInitialState,
  PlanSearchDataInitialState,
  type CourseSearchData,
  type GEPData,
  type PlanSearchData,
  type TabUpdater,
} from "../../course-management/components/TabDataStore/TabData";
import { customDataTableStyles } from "../styles/dataTableStyles";
import AppTheme from "../themes/AppTheme";

const MemoizedCourseSearchTab = React.memo(
  ({
    setCourseSearchTabData,
    courseSearchData,
  }: {
    setCourseSearchTabData: TabUpdater<CourseSearchData>;
    courseSearchData: CourseSearchData;
  }) => (
    <CourseSearch
      setCourseSearchTabData={setCourseSearchTabData}
      courseSearchData={courseSearchData}
    />
  ),
);

const MemoizedGEPSearchTab = React.memo(
  ({
    setGepSearchTabData,
    gepSearchData,
  }: {
    setGepSearchTabData: TabUpdater<GEPData>;
    gepSearchData: GEPData;
  }) => (
    <GEPSearch
      setGepSearchTabData={setGepSearchTabData}
      gepSearchData={gepSearchData}
    />
  ),
);

const MemoizedPlanSearchTab = React.memo(
  ({
    setPlanSearchTabData,
    planSearchData,
  }: {
    setPlanSearchTabData: TabUpdater<PlanSearchData>;
    planSearchData: PlanSearchData;
  }) => (
    <PlanSearch
      setPlanSearchTabData={setPlanSearchTabData}
      planSearchData={planSearchData}
    />
  ),
);

const triggerButtonSx = {
  fontWeight: 600,
  letterSpacing: 0.2,
  px: 2.25,
  minWidth: 128,
  fontSize: {
    xs: "0.7rem",
    sm: "0.8rem",
    md: "0.875rem",
  },
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

const dialogPaperSx = {
  height: "min(92vh, 980px)",
  maxHeight: "min(92vh, 980px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundImage: "none",
  backgroundColor: "background.paper",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2.5,
  boxShadow: 8,
} as const;

function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme();
  const isDark = mode !== "light";
  const nextMode = isDark ? "light" : "dark";

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-pp-mode",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  return (
    <Tooltip title={`Switch to ${nextMode} mode`}>
      <IconButton
        size="small"
        onClick={() => setMode(nextMode)}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        {isDark ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Root UI component hosting the three search tabs inside a dialog mounted in the overlay container.
 */
export default function SlideOutDrawer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("0");
  const [courseSearchData, setCourseSearchData] = useState(
    CourseSearchDataInitialState,
  );
  const [planSearchData, setPlanSearchData] = useState(
    PlanSearchDataInitialState,
  );
  const [gepSearchData, setGepSearchData] = useState(GEPDataInitialState);

  const setCourseSearchTabData: TabUpdater<CourseSearchData> = useCallback(
    (keyOrPatch, value) => {
      setCourseSearchData((prev) =>
        typeof keyOrPatch === "object"
          ? { ...prev, ...keyOrPatch }
          : { ...prev, [keyOrPatch]: value },
      );
    },
    [],
  );

  const setPlanSearchTabData: TabUpdater<PlanSearchData> = useCallback(
    (keyOrPatch, value) => {
      if (typeof keyOrPatch === "object") {
        setPlanSearchData((prev) => ({ ...prev, ...keyOrPatch }));
        return;
      }
      if (keyOrPatch === "open") {
        if (typeof value === "string") {
          setPlanSearchData((prevState) => ({
            ...prevState,
            open: {
              ...prevState.open,
              [value]: !prevState.open[value],
            },
          }));
          return;
        }
        setPlanSearchData((prevState) => ({
          ...prevState,
          open: (value as Record<string, boolean>) ?? prevState.open,
        }));
        return;
      }
      setPlanSearchData((prev) => ({ ...prev, [keyOrPatch]: value }));
    },
    [],
  );

  const setGepSearchTabData: TabUpdater<GEPData> = useCallback(
    (keyOrPatch, value) => {
      setGepSearchData((prev) =>
        typeof keyOrPatch === "object"
          ? { ...prev, ...keyOrPatch }
          : { ...prev, [keyOrPatch]: value },
      );
    },
    [],
  );

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      setSelectedTab(newValue);
    },
    [],
  );

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
    void logEvent("drawer_opened", {
      source: "toolbar",
    });
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const tabContent = useMemo(
    () => ({
      courseSearch: (
        <MemoizedCourseSearchTab
          setCourseSearchTabData={setCourseSearchTabData}
          courseSearchData={courseSearchData}
        />
      ),
      gepSearch: (
        <MemoizedGEPSearchTab
          setGepSearchTabData={setGepSearchTabData}
          gepSearchData={gepSearchData}
        />
      ),
      planSearch: (
        <MemoizedPlanSearchTab
          setPlanSearchTabData={setPlanSearchTabData}
          planSearchData={planSearchData}
        />
      ),
    }),
    [
      setCourseSearchTabData,
      courseSearchData,
      setGepSearchTabData,
      gepSearchData,
      setPlanSearchTabData,
      planSearchData,
    ],
  );

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ p: 2, pointerEvents: "auto" }}>
        <style>{customDataTableStyles}</style>
        <Button
          variant="contained"
          color="secondary"
          size="medium"
          sx={triggerButtonSx}
          onClick={handleDrawerOpen}
        >
          Course Search
        </Button>

        <Dialog
          keepMounted={true}
          fullWidth
          maxWidth="lg"
          open={drawerOpen}
          onClose={handleDrawerClose}
          id="course-search-dialog"
          slotProps={{
            paper: {
              sx: dialogPaperSx,
            },
          }}
        >
          <TabContext value={selectedTab}>
            <Box
              sx={{
                width: "100%",
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="h6">Pack Planner</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    component="a"
                    href="mailto:nicktornberg12@gmail.com?subject=Pack%20Planner%20Feedback"
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Report bug / Feedback
                  </Button>
                  <ThemeModeToggle />
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{ display: "block", mb: 1, color: "text.secondary" }}
              >
                Contact: nicktornberg12@gmail.com
              </Typography>
              <TabList
                onChange={handleTabChange}
                aria-label="Planner search tabs"
              >
                <Tab value="0" label="Course Search" />
                <Tab value="1" label="GEP Search" />
                <Tab value="2" label="Major Search" />
              </TabList>
            </Box>

            <Box
              id="dialog-scroll-container"
              sx={{
                flexGrow: 1,
                minHeight: 0,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
              }}
            >
              <TabPanel value="0" keepMounted={true} sx={{ p: 0, flex: 1 }}>
                {tabContent.courseSearch}
              </TabPanel>
              <TabPanel value="1" keepMounted={true} sx={{ p: 0, flex: 1 }}>
                {tabContent.gepSearch}
              </TabPanel>
              <TabPanel value="2" keepMounted={true} sx={{ p: 0, flex: 1 }}>
                {tabContent.planSearch}
              </TabPanel>
            </Box>
          </TabContext>
        </Dialog>
      </Box>
    </AppTheme>
  );
}
