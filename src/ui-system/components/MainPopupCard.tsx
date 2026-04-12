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
import { PlannerPreviewRail } from "./workbench/PlannerPreviewRail";
import type { PlannerSectionPreview } from "./workbench/workbenchTypes";

const MemoizedCourseSearchTab = React.memo(
  ({
    setCourseSearchTabData,
    courseSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setCourseSearchTabData: TabUpdater<CourseSearchData>;
    courseSearchData: CourseSearchData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <CourseSearch
      setCourseSearchTabData={setCourseSearchTabData}
      courseSearchData={courseSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
    />
  ),
);

const MemoizedGEPSearchTab = React.memo(
  ({
    setGepSearchTabData,
    gepSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setGepSearchTabData: TabUpdater<GEPData>;
    gepSearchData: GEPData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <GEPSearch
      setGepSearchTabData={setGepSearchTabData}
      gepSearchData={gepSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
    />
  ),
);

const MemoizedPlanSearchTab = React.memo(
  ({
    setPlanSearchTabData,
    planSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setPlanSearchTabData: TabUpdater<PlanSearchData>;
    planSearchData: PlanSearchData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <PlanSearch
      setPlanSearchTabData={setPlanSearchTabData}
      planSearchData={planSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
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
  backgroundColor: "#4d83ff",
  backgroundImage: "linear-gradient(180deg, #5d95ff 0%, #3f79ff 100%)",
  boxShadow: "0 14px 28px rgba(61, 124, 255, 0.3)",
  "&:hover": {
    backgroundColor: "#3b74f6",
    backgroundImage: "linear-gradient(180deg, #6aa0ff 0%, #3b74f6 100%)",
    boxShadow: "0 16px 32px rgba(61, 124, 255, 0.34)",
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

const dialogPaperSx = {
  width: "min(96vw, 1580px)",
  height: "min(92vh, 1040px)",
  maxHeight: "min(92vh, 1040px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundImage:
    "linear-gradient(180deg, rgba(10, 16, 28, 0.98), rgba(13, 20, 34, 0.99))",
  backgroundColor: "#0b1220",
  color: "text.primary",
  border: "1px solid",
  borderColor: "rgba(93, 122, 186, 0.2)",
  borderRadius: 4,
  boxShadow: "0 28px 70px rgba(0, 0, 0, 0.46)",
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
  const [selectedPreview, setSelectedPreview] =
    useState<PlannerSectionPreview | null>(null);
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
          onPreviewSectionChange={setSelectedPreview}
          previewContent={
            <PlannerPreviewRail
              selectedPreview={selectedPreview}
              isOpen={drawerOpen}
            />
          }
          selectedPreviewId={selectedPreview?.id ?? null}
        />
      ),
      gepSearch: (
        <MemoizedGEPSearchTab
          setGepSearchTabData={setGepSearchTabData}
          gepSearchData={gepSearchData}
          onPreviewSectionChange={setSelectedPreview}
          previewContent={
            <PlannerPreviewRail
              selectedPreview={selectedPreview}
              isOpen={drawerOpen}
            />
          }
          selectedPreviewId={selectedPreview?.id ?? null}
        />
      ),
      planSearch: (
        <MemoizedPlanSearchTab
          setPlanSearchTabData={setPlanSearchTabData}
          planSearchData={planSearchData}
          onPreviewSectionChange={setSelectedPreview}
          previewContent={
            <PlannerPreviewRail
              selectedPreview={selectedPreview}
              isOpen={drawerOpen}
            />
          }
          selectedPreviewId={selectedPreview?.id ?? null}
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
      selectedPreview,
      drawerOpen,
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
          maxWidth={false}
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
                px: 3,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "rgba(93, 122, 186, 0.16)",
                backgroundColor: "rgba(22, 27, 34, 0.55)",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 28,
                  mb: 1.25,
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
                  >
                    Pack Planner
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(189, 206, 238, 0.7)" }}
                  >
                    Search faster, compare sections, and keep schedule context in
                    view.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    component="a"
                    href="mailto:nicktornberg12@gmail.com?subject=Pack%20Planner%20Feedback"
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      minHeight: 32,
                      px: 1.5,
                    }}
                  >
                    Report bug / Feedback
                  </Button>
                  <ThemeModeToggle />
                </Box>
              </Box>
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
                backgroundColor: "transparent",
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
