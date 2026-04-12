import type { ScheduleEvent } from "../../types/Calendar";

const DAY_TOKEN_MAP = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  TH: "Thu",
  F: "Fri",
} as const;

type DayToken = keyof typeof DAY_TOKEN_MAP;

const parseTimeParts = (dayTime: string): [string, string] | null => {
  const normalized = dayTime.toUpperCase();
  const times = normalized.match(/\d{1,2}:\d{2}\s*[AP]M/g) ?? [];
  if (times.length < 2) {
    return null;
  }

  const startTime = times[0];
  const endTime = times[1];
  if (startTime === undefined || endTime === undefined) {
    return null;
  }

  return [startTime, endTime];
};

export const parseDayTimeEvent = (
  dayTime: string | undefined,
  subjectCode: string | undefined,
): ScheduleEvent | null => {
  if (!dayTime) {
    return null;
  }

  const tokens = dayTime
    .toUpperCase()
    .split(/\s+/)
    .filter((token): token is DayToken => token in DAY_TOKEN_MAP)
    .map((token) => DAY_TOKEN_MAP[token]);

  const times = parseTimeParts(dayTime);
  if (tokens.length === 0 || !times) {
    return null;
  }

  const [startTime, endTime] = times;

  return {
    id: 1,
    subj: subjectCode || "",
    start: startTime,
    end: endTime,
    days: tokens.map((day) => ({ day, isOverlapping: false })),
    color: "#2ECC71",
  };
};
