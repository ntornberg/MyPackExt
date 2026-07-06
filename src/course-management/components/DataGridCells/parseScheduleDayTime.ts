import { type ScheduleEvent, CALENDAR_COLOR_PINNED_SECTION } from "../../types/Calendar";

const DAY_TOKEN_MAP = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  TH: "Thu",
  F: "Fri",
} as const;

type DayToken = keyof typeof DAY_TOKEN_MAP;

/** Registrar-style compact prefixes before the first time (MW, TuTh, MWF, …). */
function expandDayPrefixLetters(prefixRaw: string): ScheduleEvent["days"] {
  const p = prefixRaw.toUpperCase().replace(/\s+/g, "");
  if (!p) {
    return [];
  }
  const ordered: string[] = [];
  const push = (day: string) => {
    if (!ordered.includes(day)) {
      ordered.push(day);
    }
  };
  let i = 0;
  while (i < p.length) {
    const two = p.slice(i, i + 2);
    if (two === "TH") {
      push("Thu");
      i += 2;
      continue;
    }
    if (two === "TU") {
      push("Tue");
      i += 2;
      continue;
    }
    const ch = p[i]!;
    if (ch === "M") {
      push("Mon");
    } else if (ch === "T") {
      push("Tue");
    } else if (ch === "W") {
      push("Wed");
    } else if (ch === "F") {
      push("Fri");
    }
    i += 1;
  }
  return ordered.map((day) => ({ day, isOverlapping: false }));
}

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

function daysFromDayTime(dayTime: string): ScheduleEvent["days"] | null {
  const trimmed = dayTime.trim();
  const timeIdx = trimmed.search(/\d{1,2}:\d{2}/i);
  if (timeIdx > 0) {
    const rawPrefix = trimmed.slice(0, timeIdx).trim();
    const compactLetters = rawPrefix.replace(/\s+/g, "");
    if (compactLetters.length > 0) {
      const fromCompact = expandDayPrefixLetters(compactLetters);
      if (fromCompact.length > 0) {
        return fromCompact;
      }
    }
  }

  const tokens = trimmed
    .toUpperCase()
    .split(/\s+/)
    .filter((token): token is DayToken => token in DAY_TOKEN_MAP)
    .map((token) => DAY_TOKEN_MAP[token]);

  return tokens.length > 0
    ? tokens.map((day) => ({ day, isOverlapping: false }))
    : null;
}

export const parseDayTimeEvent = (
  dayTime: string | undefined,
  subjectCode: string | undefined,
  eventId = 1,
): ScheduleEvent | null => {
  if (!dayTime) {
    return null;
  }

  const days = daysFromDayTime(dayTime);
  const times = parseTimeParts(dayTime);
  if (!days || days.length === 0 || !times) {
    return null;
  }

  const [startTime, endTime] = times;

  return {
    id: eventId,
    subj: subjectCode || "",
    start: startTime,
    end: endTime,
    days,
    color: CALENDAR_COLOR_PINNED_SECTION,
  };
};
