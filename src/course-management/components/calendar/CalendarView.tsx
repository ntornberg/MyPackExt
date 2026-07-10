import { useEffect, useState } from "react";

import { getCacheCategory } from "../../cache/courseRetrieval";
import { parseDayTimeEvent } from "../../schedule/parseScheduleDayTime";
import {
  type ScheduleEvent,
  CALENDAR_COLOR_CART_CLASS,
  CALENDAR_COLOR_ENROLLED_CLASS,
} from "../../types/calendar";
import type { SectionLinkedMeeting } from "../../types/section";

import CalendarGrid, { toMinutes } from "./CalendarGrid";

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

type CachedEntry = {
  combinedData?: unknown;
};

type CalendarEventEntry = Record<string, unknown>;

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
    cachedEvents.length === 0 ? 0 : Math.max(...cachedEvents.map((e) => e.id));
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
    days: e.days.map((d) => ({
      ...d,
      conflictsWith: d.conflictsWith ? [...d.conflictsWith] : [],
    })),
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
          days: eventA.days.map((day) => {
            if (!daysB[day.day]) {
              return day;
            }
            return {
              ...day,
              isOverlapping: true,
              conflictsWith: Array.from(
                new Set([...(day.conflictsWith ?? []), eventB.subj]),
              ),
            };
          }),
        };
        result[j] = {
          ...eventB,
          days: eventB.days.map((day) => {
            if (!daysA[day.day]) {
              return day;
            }
            return {
              ...day,
              isOverlapping: true,
              conflictsWith: Array.from(
                new Set([...(day.conflictsWith ?? []), eventA.subj]),
              ),
            };
          }),
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

  for (const course of Object.values(courses as Record<string, CachedEntry>)) {
    const scheduleEntry = unpackCachedData(course) as ScheduleTableEntry | null;

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
      const subject =
        `${scheduleEntry.classs?.trim() || ""} ${sectionType}`.trim();
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

function unpackCachedData(entry: unknown): unknown {
  const data =
    entry && typeof entry === "object" && "combinedData" in entry
      ? (entry as CachedEntry).combinedData
      : entry;

  if (typeof data !== "string") {
    return data;
  }

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function stringValue(entry: CalendarEventEntry, keys: string[]): string | null {
  for (const key of keys) {
    const value = entry[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

function normalizeTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const isoTime = trimmed.match(/T(\d{1,2}):(\d{2})/);
  if (isoTime) {
    return formatTime(Number(isoTime[1]), Number(isoTime[2]));
  }

  const dateWithTime = trimmed.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (dateWithTime && !/[AP]M/i.test(trimmed)) {
    return formatTime(Number(dateWithTime[1]), Number(dateWithTime[2]));
  }

  const amPm = trimmed.match(/\b(\d{1,2})(?::(\d{2}))?\s*([AP]M)\b/i);
  if (amPm) {
    const hour = Number(amPm[1]);
    const minute = Number(amPm[2] ?? "0");
    const meridiem = amPm[3]!.toUpperCase();
    return `${hour}:${minute.toString().padStart(2, "0")} ${meridiem}`;
  }

  return null;
}

function formatTime(hour24: number, minute: number): string | null {
  if (
    !Number.isFinite(hour24) ||
    !Number.isFinite(minute) ||
    hour24 < 0 ||
    hour24 > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${meridiem}`;
}

function weekdayFromDate(value: string | null): ScheduleEvent["days"] {
  if (!value) {
    return [];
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return [];
  }

  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    parsed.getDay()
  ];
  return day && day !== "Sun" && day !== "Sat"
    ? [
        {
          day: day as "Mon" | "Tue" | "Wed" | "Thu" | "Fri",
          isOverlapping: false,
        },
      ]
    : [];
}

function weekdaysFromEvent(entry: CalendarEventEntry): ScheduleEvent["days"] {
  const directDays = entry.days;
  if (Array.isArray(directDays)) {
    return directDays
      .map((day) =>
        typeof day === "string"
          ? day.slice(0, 3)
          : typeof day === "object" && day && "day" in day
            ? String((day as { day: unknown }).day).slice(0, 3)
            : "",
      )
      .filter((day): day is "Mon" | "Tue" | "Wed" | "Thu" | "Fri" =>
        ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day),
      )
      .map((day) => ({ day, isOverlapping: false }));
  }

  const dow = entry.dow;
  if (Array.isArray(dow)) {
    const byIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dow
      .map((value) =>
        typeof value === "number" ? byIndex[value] : byIndex[Number(value)],
      )
      .filter((day): day is "Mon" | "Tue" | "Wed" | "Thu" | "Fri" =>
        ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day ?? ""),
      )
      .map((day) => ({ day, isOverlapping: false }));
  }

  const meetDays = stringValue(entry, [
    "meet_days",
    "meeting_days",
    "days_of_week",
  ]);
  if (meetDays) {
    return meetDays
      .split(/[/,\s]+/)
      .map((day) => day.trim().slice(0, 3))
      .filter((day): day is "Mon" | "Tue" | "Wed" | "Thu" | "Fri" =>
        ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day),
      )
      .map((day) => ({ day, isOverlapping: false }));
  }

  return weekdayFromDate(
    stringValue(entry, ["start", "start_date", "startDate"]),
  );
}

function buildEventsFromCalendarEntries(
  calendarEntries: unknown,
  color: string,
  idStart: number,
): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  let eventId = idStart;

  if (!calendarEntries || typeof calendarEntries !== "object") {
    return events;
  }

  for (const value of Object.values(
    calendarEntries as Record<string, CachedEntry>,
  )) {
    const raw = unpackCachedData(value);
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const entry = raw as CalendarEventEntry;
    const startRaw = stringValue(entry, [
      "start",
      "start_date",
      "startDate",
      "start_time",
      "startTime",
      "begin",
      "begin_time",
    ]);
    const endRaw = stringValue(entry, [
      "end",
      "end_date",
      "endDate",
      "end_time",
      "endTime",
      "finish",
      "finish_time",
    ]);
    const start = normalizeTime(startRaw);
    const end = normalizeTime(endRaw);
    const days = weekdaysFromEvent(entry);
    if (!start || !end || days.length === 0) {
      continue;
    }

    const subj =
      stringValue(entry, [
        "title",
        "subject",
        "subj",
        "className",
        "class",
        "course",
        "course_title",
        "description",
      ]) ?? "Class";
    events.push({
      id: eventId++,
      subj,
      start,
      end,
      days,
      color,
    });
  }

  return events;
}

function normalizedCourseToken(subject: string): string | null {
  const match = subject.toUpperCase().match(/\b[A-Z]{2,5}\s*\d{3}[A-Z]?\b/);
  return match ? match[0].replace(/\s+/g, " ") : null;
}

function eventCoversCandidate(
  existing: ScheduleEvent,
  candidate: ScheduleEvent,
): boolean {
  if (existing.start !== candidate.start || existing.end !== candidate.end) {
    return false;
  }

  const existingToken = normalizedCourseToken(existing.subj);
  const candidateToken = normalizedCourseToken(candidate.subj);
  if (existingToken && candidateToken && existingToken !== candidateToken) {
    return false;
  }
  if (!existingToken && !candidateToken && existing.subj !== candidate.subj) {
    return false;
  }

  const existingDays = new Set(existing.days.map((day) => day.day));
  return candidate.days.every((day) => existingDays.has(day.day));
}

function mergeScheduleSources(
  tableEvents: ScheduleEvent[],
  calendarEvents: ScheduleEvent[],
): ScheduleEvent[] {
  const merged = [...tableEvents];
  for (const calendarEvent of calendarEvents) {
    if (
      !merged.some((existingEvent) =>
        eventCoversCandidate(existingEvent, calendarEvent),
      )
    ) {
      merged.push(calendarEvent);
    }
  }
  return merged;
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
      const calendarEntries = await getCacheCategory("scheduleCalEventsData");
      const calendarEvents = buildEventsFromCalendarEntries(
        calendarEntries,
        CALENDAR_COLOR_ENROLLED_CLASS,
        1,
      );

      const tableEntries = await getCacheCategory("scheduleTableData");
      const tableEvents = buildEventsFromTableEntries(
        tableEntries,
        CALENDAR_COLOR_ENROLLED_CLASS,
        1 + calendarEvents.length,
      );
      cachedScheduleEvents = mergeScheduleSources(tableEvents, calendarEvents);
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
      const calendarEntries = await getCacheCategory("shopCartCalEventsData");
      const calendarEvents = buildEventsFromCalendarEntries(
        calendarEntries,
        CALENDAR_COLOR_CART_CLASS,
        10_000,
      );

      const tableEntries = await getCacheCategory("shopCartTableData");
      const tableEvents = buildEventsFromTableEntries(
        tableEntries,
        CALENDAR_COLOR_CART_CLASS,
        10_000 + calendarEvents.length,
      );
      cachedCartEvents = mergeScheduleSources(tableEvents, calendarEvents);
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
      } catch {
        if (mounted) {
          setEventData([]);
        }
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
  }, [dayTime, courseData?.code, staticBackgroundEvents, linkedMeetings]);

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
      <CalendarGrid eventData={eventData} />
    </div>
  );
};
