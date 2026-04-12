import { Box } from "@mui/material";
import { useEffect, useState } from "react";

import { getCacheCategory } from "../../cache/CourseRetrieval";

import CreateCalendar, { toMinutes } from "./CalendarResizeListener";
import type { ScheduleEvent } from "../../types/Calendar";
import { parseDayTimeEvent } from "./parseScheduleDayTime";

type ScheduleTableEntry = {
  DT_RowId: string | null;
  career: string | null;
  classs: string | null;
  crse_grade: string | null;
  crse_id: string | null;
  crse_offer_nbr: string | null;
  crse_title: string | null;
  description: string | null;
  enrl_status: string | null;
  enroll_class_nbr: string | null;
  eventid: string | null;
  grade_basis: string | null;
  grade_basis_enrl: string | null;
  instructor_id: string | null;
  section_details:
    | {
        building_address: string | null;
        class_nbr: string | null;
        class_notes: string[] | null;
        course_topic: string | null;
        dates: string | null;
        facility: string | null;
        instr_mode: string | null;
        instructors: string[] | null;
        location: string | null;
        meet_days: string | null;
        section: string | null;
        time: string | null;
        type: string | null;
      }[]
    | null;
  session: string | null;
  units: string | null;
  waitlist_position: string | null;
  waitlist_total: string | null;
};

type CalendarViewProps = {
  dayTime?: string;
  courseData?: { code?: string };
};

let cachedScheduleEvents: ScheduleEvent[] | null = null;
let cachedScheduleEventsPromise: Promise<ScheduleEvent[]> | null = null;

export const invalidateScheduleCache = (): void => {
  cachedScheduleEvents = null;
  cachedScheduleEventsPromise = null;
};

const hasSharedDay = (
  daysA: ScheduleEvent["days"],
  daysB: ScheduleEvent["days"],
) => {
  const daySet = new Set(daysA.map((day) => day.day));
  return daysB.some((day) => daySet.has(day.day));
};

const markOverlaps = (events: ScheduleEvent[]): ScheduleEvent[] => {
  const result = events.map((e) => ({
    ...e,
    days: e.days.map((d) => ({ ...d })),
  }));
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const eventA = result[i];
      const eventB = result[j];
      if (
        toMinutes(eventA.start) < toMinutes(eventB.end) &&
        toMinutes(eventA.end) > toMinutes(eventB.start) &&
        hasSharedDay(eventA.days, eventB.days)
      ) {
        const daysA = Object.fromEntries(
          eventA.days.map((day) => [day.day, true]),
        );
        const daysB = Object.fromEntries(
          eventB.days.map((day) => [day.day, true]),
        );
        result[i] = {
          ...eventA,
          days: eventA.days.map((day) =>
            daysB[day.day] ? { ...day, isOverlapping: true } : day,
          ),
        };
        result[j] = {
          ...eventB,
          days: eventB.days.map((day) =>
            daysA[day.day] ? { ...day, isOverlapping: true } : day,
          ),
        };
      }
    }
  }
  return result;
};

const loadScheduleEvents = async (): Promise<ScheduleEvent[]> => {
  if (cachedScheduleEvents) {
    return cachedScheduleEvents;
  }
  if (cachedScheduleEventsPromise) {
    return cachedScheduleEventsPromise;
  }

  cachedScheduleEventsPromise = (async () => {
    const courses = await getCacheCategory("scheduleTableData");
    const events: ScheduleEvent[] = [];
    let eventId = 1;

    if (courses) {
      for (const course of Object.values(courses)) {
        const scheduleEntry: ScheduleTableEntry =
          typeof course.combinedData === "string"
            ? (JSON.parse(course.combinedData) as ScheduleTableEntry)
            : (course.combinedData as unknown as ScheduleTableEntry);

        if (!scheduleEntry?.section_details) {
          continue;
        }

        for (const section of scheduleEntry.section_details) {
          if (!section.meet_days || !section.time) {
            continue;
          }

          const recurrRule = section.meet_days
            .split("/")
            .map((day) => day.trim())
            .filter((day): day is "Mon" | "Tue" | "Wed" | "Thu" | "Fri" =>
              ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day),
            );

          if (!recurrRule.length) {
            continue;
          }

          const [startTime, endTime] = section.time
            .split("-")
            .map((t) => t.trim());
          const sectionType = section.type || "Section";
          const subject =
            `${scheduleEntry.classs?.trim() || ""} ${sectionType}`.trim();
          events.push({
            id: eventId++,
            subj: subject,
            start: startTime,
            end: endTime,
            days: recurrRule.map((day) => ({ day, isOverlapping: false })),
            color: "#E74C3C",
          });
        }
      }
    }

    cachedScheduleEvents = markOverlaps(events);
    return cachedScheduleEvents;
  })();

  return cachedScheduleEventsPromise;
};

/**
 * Displays a miniature weekly calendar for a section using cached schedule data.
 * If `dayTime` is provided, renders that event; otherwise derives from cached entries.
 *
 * @param {CalendarViewProps} params Section props and optional overrides
 * @returns {JSX.Element} Calendar wrapper
 */
export const CalendarView = (params: CalendarViewProps) => {
  const { dayTime, courseData } = params;

  const [eventData, setEventData] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const cachedEvents = await loadScheduleEvents();
        const dayTimeEvent = parseDayTimeEvent(dayTime, courseData?.code);
        if (dayTimeEvent) {
          const overlappingDays = new Set<string>();
          for (const event of cachedEvents) {
            if (
              toMinutes(dayTimeEvent.start) < toMinutes(event.end) &&
              toMinutes(dayTimeEvent.end) > toMinutes(event.start)
            ) {
              for (const day of dayTimeEvent.days) {
                if (event.days.some((eventDay) => eventDay.day === day.day)) {
                  overlappingDays.add(day.day);
                }
              }
            }
          }
          if (overlappingDays.size > 0) {
            dayTimeEvent.days = dayTimeEvent.days.map((day) =>
              overlappingDays.has(day.day)
                ? { ...day, isOverlapping: true }
                : day,
            );
          }
          if (mounted) {
            setEventData([dayTimeEvent, ...cachedEvents]);
          }
          return;
        }

        if (mounted) {
          setEventData(cachedEvents);
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [dayTime, courseData?.code]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <CreateCalendar eventData={eventData} />
    </Box>
  );
};
