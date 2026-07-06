import { toMinutes } from "../components/DataGridCells/CalendarResizeListener";
import type { ScheduleEvent } from "../types/Calendar";

/** O(n·m) on tiny day lists — no Set allocation (≤5 weekdays each). */
function hasSharedDayArrays(
  daysA: ScheduleEvent["days"],
  daysB: ScheduleEvent["days"],
): boolean {
  for (const da of daysA) {
    for (const db of daysB) {
      if (da.day === db.day) {
        return true;
      }
    }
  }
  return false;
}

function getDaySet(days: ScheduleEvent["days"]): Set<string> {
  return new Set(days.map((d) => d.day));
}

function daySetsOverlap(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) {
    return false;
  }
  if (a.size <= b.size) {
    for (const d of a) {
      if (b.has(d)) {
        return true;
      }
    }
  } else {
    for (const d of b) {
      if (a.has(d)) {
        return true;
      }
    }
  }
  return false;
}

export function eventsTimeOverlap(a: ScheduleEvent, b: ScheduleEvent): boolean {
  if (!hasSharedDayArrays(a.days, b.days)) {
    return false;
  }
  const aStart = toMinutes(a.start);
  const aEnd = toMinutes(a.end);
  const bStart = toMinutes(b.start);
  const bEnd = toMinutes(b.end);
  return aStart < bEnd && aEnd > bStart;
}

type BusySlot = {
  start: number;
  end: number;
  days: Set<string>;
};

/** True when none of the section’s meetings overlap cart + enrolled background. */
export function sectionFitsSchedule(
  section: ScheduleEvent[],
  background: ScheduleEvent[],
): boolean {
  if (section.length === 0) {
    return true;
  }

  const bgCache: BusySlot[] = background.map((e) => ({
    start: toMinutes(e.start),
    end: toMinutes(e.end),
    days: getDaySet(e.days),
  }));

  for (const block of section) {
    const blockStart = toMinutes(block.start);
    const blockEnd = toMinutes(block.end);
    const blockDays = getDaySet(block.days);

    for (const busy of bgCache) {
      if (!daySetsOverlap(blockDays, busy.days)) {
        continue;
      }
      if (blockStart < busy.end && blockEnd > busy.start) {
        return false;
      }
    }
  }
  return true;
}
