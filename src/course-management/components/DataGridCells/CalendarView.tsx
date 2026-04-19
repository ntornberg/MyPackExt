import { useEffect, useState } from "react";

import { getCacheCategory } from "../../cache/CourseRetrieval";

import CreateCalendar, { toMinutes } from "./CalendarResizeListener";
import {
  type ScheduleEvent,
  CALENDAR_COLOR_CART_CLASS,
  CALENDAR_COLOR_ENROLLED_CLASS,
} from "../../types/Calendar";
import type { SectionLinkedMeeting } from "../../types/Section";
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
  /** Lab / recitation / studio rows paired with this section (same enrollment). */
  linkedMeetings?: SectionLinkedMeeting[];
  /** When provided, skip extension cache and build the grid from these events (e.g. staging). */
  staticBackgroundEvents?: ScheduleEvent[];
  /**
   * Planner preview rail is narrow; keep a readable minimum width and let the
   * parent use `overflow-x-auto` so weekday columns are not crushed.
   */
  plannerPreview?: boolean;
};

function meetingCalendarLabel(
  courseCode: string | undefined,
  component?: string,
): string {
  const code = courseCode?.trim() ?? "";
  const comp = component?.trim();
  if (code && comp) {
    return `${code} · ${comp}`;
  }
  return code || comp || "Section";
}

/** Prepends lecture + linked meetings (labs, etc.); overlap flags come from `markOverlaps`. */
const mergePinnedDayTimeWithEvents = (
  dayTime: string | undefined,
  courseCode: string | undefined,
  cachedEvents: ScheduleEvent[],
  linkedMeetings?: SectionLinkedMeeting[],
): ScheduleEvent[] => {
  const maxBackgroundId =
    cachedEvents.length === 0
      ? 0
      : Math.max(...cachedEvents.map((e) => e.id));
  let nextId = maxBackgroundId + 1;
  const pins: ScheduleEvent[] = [];
  const primary = parseDayTimeEvent(
    dayTime,
    meetingCalendarLabel(courseCode),
    nextId++,
  );
  if (primary) {
    pins.push(primary);
  }
  for (const m of linkedMeetings ?? []) {
    const ev = parseDayTimeEvent(
      m.dayTime,
      meetingCalendarLabel(courseCode, m.component),
      nextId++,
    );
    if (ev) {
      pins.push(ev);
    }
  }
  if (pins.length === 0) {
    return cachedEvents;
  }
  return [...pins, ...cachedEvents];
};

let cachedScheduleEvents: ScheduleEvent[] | null = null;
let cachedScheduleEventsPromise: Promise<ScheduleEvent[]> | null = null;
let cachedCartEvents: ScheduleEvent[] | null = null;
let cachedCartEventsPromise: Promise<ScheduleEvent[]> | null = null;

export const invalidateScheduleCache = (): void => {
  cachedScheduleEvents = null;
  cachedScheduleEventsPromise = null;
  cachedCartEvents = null;
  cachedCartEventsPromise = null;
};

const hasSharedDay = (
  daysA: ScheduleEvent["days"],
  daysB: ScheduleEvent["days"],
) => {
  const daySet = new Set(daysA.map((day) => day.day));
  return daysB.some((day) => daySet.has(day.day));
};

export const markOverlaps = (events: ScheduleEvent[]): ScheduleEvent[] => {
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

function buildEventsFromTableEntries(
  courses: unknown,
  color: string,
  idStart: number,
): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  let eventId = idStart;

  if (!courses || typeof courses !== "object") {
    return events;
  }

  for (const course of Object.values(courses as Record<string, { combinedData?: unknown }>)) {
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

      const timeParts = section.time.split("-").map((t) => t.trim());
      if (timeParts.length < 2) {
        continue;
      }
      const [startTime, endTime] = timeParts;
      if (!startTime || !endTime) {
        continue;
      }
      const sectionType = section.type || "Section";
      const subject = `${scheduleEntry.classs?.trim() || ""} ${sectionType}`.trim();
      events.push({
        id: eventId++,
        subj: subject,
        start: startTime,
        end: endTime,
        days: recurrRule.map((day) => ({ day, isOverlapping: false })),
        color,
      });
    }
  }

  return events;
}

export const loadScheduleEvents = async (): Promise<ScheduleEvent[]> => {
  if (cachedScheduleEvents) {
    return cachedScheduleEvents;
  }
  if (cachedScheduleEventsPromise) {
    return cachedScheduleEventsPromise;
  }

  cachedScheduleEventsPromise = (async () => {
    try {
      const courses = await getCacheCategory("scheduleTableData");
      cachedScheduleEvents = buildEventsFromTableEntries(
        courses,
        CALENDAR_COLOR_ENROLLED_CLASS,
        1,
      );
      return cachedScheduleEvents;
    } catch {
      cachedScheduleEventsPromise = null;
      return [];
    }
  })();

  return cachedScheduleEventsPromise;
};

export const loadCartScheduleEvents = async (): Promise<ScheduleEvent[]> => {
  if (cachedCartEvents) {
    return cachedCartEvents;
  }
  if (cachedCartEventsPromise) {
    return cachedCartEventsPromise;
  }

  cachedCartEventsPromise = (async () => {
    try {
      const courses = await getCacheCategory("shopCartTableData");
      cachedCartEvents = buildEventsFromTableEntries(
        courses,
        CALENDAR_COLOR_CART_CLASS,
        10_000,
      );
      return cachedCartEvents;
    } catch {
      cachedCartEventsPromise = null;
      return [];
    }
  })();

  return cachedCartEventsPromise;
};

/**
 * Displays a miniature weekly calendar for a section using cached schedule data.
 * If `dayTime` is provided, renders that event; otherwise derives from cached entries.
 *
 * @param {CalendarViewProps} params Section props and optional overrides
 * @returns {JSX.Element} Calendar wrapper
 */
export const CalendarView = (params: CalendarViewProps) => {
  const {
    dayTime,
    courseData,
    linkedMeetings,
    staticBackgroundEvents,
    plannerPreview = false,
  } = params;

  const [eventData, setEventData] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const linkedMeetingsKey =
    linkedMeetings
      ?.map((m) => `${m.dayTime}|${m.location}|${m.component}|${m.classNumber ?? ""}`)
      .join(";") ?? "";

  useEffect(() => {
    if (staticBackgroundEvents !== undefined) {
      const merged = mergePinnedDayTimeWithEvents(
        dayTime,
        courseData?.code,
        staticBackgroundEvents,
        linkedMeetings,
      );
      setEventData(markOverlaps(merged));
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Safety net: never let the calendar hang on "Loading schedule..." forever.
    // If the cache reads below take >4s, fall back to rendering the pinned
    // section only with no background events.
    const safetyTimeout = window.setTimeout(() => {
      if (!mounted) return;
      const merged = mergePinnedDayTimeWithEvents(
        dayTime,
        courseData?.code,
        [],
        linkedMeetings,
      );
      setEventData(markOverlaps(merged));
      setIsLoading(false);
    }, 4000);

    const fetchData = async () => {
      try {
        const [cartEvents, scheduleEvents] = await Promise.all([
          loadCartScheduleEvents(),
          loadScheduleEvents(),
        ]);
        const background = [...cartEvents, ...scheduleEvents];
        const merged = mergePinnedDayTimeWithEvents(
          dayTime,
          courseData?.code,
          background,
          linkedMeetings,
        );
        if (mounted) {
          setEventData(markOverlaps(merged));
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
        window.clearTimeout(safetyTimeout);
      }
    };

    void fetchData();
    return () => {
      mounted = false;
      window.clearTimeout(safetyTimeout);
    };
  }, [dayTime, courseData?.code, staticBackgroundEvents, linkedMeetingsKey]);

  if (isLoading) {
    return (
      <div
        className={`flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground ${plannerPreview ? "min-w-[560px]" : ""}`}
      >
        Loading schedule...
      </div>
    );
  }

  return (
    <div
      className={
        plannerPreview
          ? "h-full w-full min-w-[560px] max-w-[1400px] shrink-0"
          : "h-full w-full"
      }
    >
      <CreateCalendar eventData={eventData} />
    </div>
  );
};
