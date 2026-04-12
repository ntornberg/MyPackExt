import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { getCacheCategory } from "../../../course-management/cache/CourseRetrieval";
import {
  CalendarView,
  loadScheduleEvents,
} from "../../../course-management/components/DataGridCells/CalendarView";

import type { PlannerSectionPreview } from "./workbenchTypes";

type PlannerPreviewRailProps = {
  selectedPreview: PlannerSectionPreview | null;
  isOpen: boolean;
};

type PlannerContextSnapshot = {
  scheduleCourses: number;
  cartCourses: number;
  plannedCourses: number;
  weeklyMeetings: number;
};

const emptyContextSnapshot: PlannerContextSnapshot = {
  scheduleCourses: 0,
  cartCourses: 0,
  plannedCourses: 0,
  weeklyMeetings: 0,
};

const tabLabelById = {
  course_search: "Course Search",
  gep_search: "GEP Search",
  plan_search: "Major Search",
} as const;

const normalizeRichText = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return normalized || null;
};

const getContextCount = (
  entries: Record<string, unknown> | null | undefined,
): number => Object.keys(entries ?? {}).length;

export function PlannerPreviewRail({
  selectedPreview,
  isOpen,
}: PlannerPreviewRailProps) {
  const [contextSnapshot, setContextSnapshot] = useState(emptyContextSnapshot);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const loadContextSnapshot = async () => {
      try {
        const [scheduleTable, cartTable, planTable, scheduleEvents] =
          await Promise.all([
            getCacheCategory("scheduleTableData"),
            getCacheCategory("shopCartTableData"),
            getCacheCategory("planTermTableData"),
            loadScheduleEvents(),
          ]);

        if (!isMounted) {
          return;
        }

        setContextSnapshot({
          scheduleCourses: getContextCount(scheduleTable),
          cartCourses: getContextCount(cartTable),
          plannedCourses: getContextCount(planTable),
          weeklyMeetings: scheduleEvents.length,
        });
      } catch (error) {
        console.error("Failed to load planner preview context:", error);
      }
    };

    void loadContextSnapshot();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedPreview?.id]);

  const selectedSection = selectedPreview?.section;
  const selectedInstructors = useMemo(() => {
    const instructors = selectedSection?.instructor_name ?? [];
    return instructors.length > 0 ? instructors.join(", ") : "Staff";
  }, [selectedSection?.instructor_name]);

  const selectedNotes = useMemo(
    () => normalizeRichText(selectedSection?.notes),
    [selectedSection?.notes],
  );
  const selectedRequisites = useMemo(
    () => normalizeRichText(selectedSection?.requisites),
    [selectedSection?.requisites],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 4,
        bgcolor: "rgba(9, 15, 27, 0.96)",
        borderColor: "rgba(94, 123, 187, 0.18)",
        boxShadow:
          "inset 0 1px 0 rgba(136, 164, 224, 0.08), 0 18px 44px rgba(0, 0, 0, 0.28)",
        color: "#edf3ff",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "rgba(169, 191, 233, 0.72)", letterSpacing: "0.08em" }}
          >
            Command Center
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {selectedPreview ? "Selected Section" : "Current MyPack Context"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(189, 206, 238, 0.68)",
              mt: 0.5,
              display: "block",
            }}
          >
            {selectedPreview
              ? "Pinned details stay visible while you compare rows."
              : "Choose a section row to keep a preview pinned while you browse."}
          </Typography>
        </Box>

        {selectedPreview ? (
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              borderRadius: 3,
              bgcolor: "rgba(17, 26, 43, 0.95)",
              borderColor: "rgba(94, 123, 187, 0.18)",
            }}
          >
            <Stack spacing={1.25}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  size="small"
                  color="primary"
                  label={tabLabelById[selectedPreview.tab]}
                  sx={{ fontWeight: 700 }}
                />
                {selectedSection?.component ? (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={selectedSection.component}
                  />
                ) : null}
                {selectedSection?.availability ? (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={selectedSection.availability}
                  />
                ) : null}
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {selectedPreview.courseCode}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(189, 206, 238, 0.7)" }}
                >
                  {selectedPreview.courseTitle}
                </Typography>
              </Box>

              <Stack spacing={0.75}>
                <Typography variant="body2">
                  Section {selectedSection?.section || "Unknown"} • Class{" "}
                  {selectedSection?.classNumber || "Unknown"}
                </Typography>
                <Typography variant="body2">{selectedInstructors}</Typography>
                <Typography variant="body2">
                  {selectedSection?.dayTime || "Meeting time unavailable"}
                </Typography>
                <Typography variant="body2">
                  {selectedSection?.location || "Location unavailable"}
                </Typography>
                {selectedSection?.enrollment ? (
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(189, 206, 238, 0.66)" }}
                  >
                    Enrollment: {selectedSection.enrollment}
                  </Typography>
                ) : null}
              </Stack>

              {selectedNotes ? (
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Notes
                  </Typography>
                  <Typography variant="body2">{selectedNotes}</Typography>
                </Box>
              ) : null}

              {selectedRequisites ? (
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Requisites
                  </Typography>
                  <Typography variant="body2">{selectedRequisites}</Typography>
                </Box>
              ) : null}
            </Stack>
          </Paper>
        ) : null}

        <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Schedule Preview
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 0.5,
              borderRadius: 3,
              bgcolor: "rgba(13, 21, 35, 0.94)",
              borderColor: "rgba(94, 123, 187, 0.18)",
              overflow: "hidden",
            }}
          >
            <CalendarView
              dayTime={selectedSection?.dayTime}
              courseData={selectedSection?.courseData}
            />
          </Paper>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            MyPack Snapshot
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.1,
                borderRadius: 2.5,
                bgcolor: "rgba(17, 26, 43, 0.94)",
                borderColor: "rgba(94, 123, 187, 0.18)",
              }}
            >
              <Stack spacing={0.5}>
                <SchoolOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="h6">{contextSnapshot.scheduleCourses}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(189, 206, 238, 0.68)" }}
                >
                  Enrolled courses
                </Typography>
              </Stack>
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 1.1,
                borderRadius: 2.5,
                bgcolor: "rgba(17, 26, 43, 0.94)",
                borderColor: "rgba(94, 123, 187, 0.18)",
              }}
            >
              <Stack spacing={0.5}>
                <MenuBookOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="h6">{contextSnapshot.cartCourses}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(189, 206, 238, 0.68)" }}
                >
                  Cart courses
                </Typography>
              </Stack>
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 1.1,
                borderRadius: 2.5,
                bgcolor: "rgba(17, 26, 43, 0.94)",
                borderColor: "rgba(94, 123, 187, 0.18)",
              }}
            >
              <Stack spacing={0.5}>
                <AccessTimeOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="h6">{contextSnapshot.weeklyMeetings}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(189, 206, 238, 0.68)" }}
                >
                  Weekly meetings
                </Typography>
              </Stack>
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 1.1,
                borderRadius: 2.5,
                bgcolor: "rgba(17, 26, 43, 0.94)",
                borderColor: "rgba(94, 123, 187, 0.18)",
              }}
            >
              <Stack spacing={0.5}>
                <EventBusyOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="h6">{contextSnapshot.plannedCourses}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(189, 206, 238, 0.68)" }}
                >
                  Planned courses
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
