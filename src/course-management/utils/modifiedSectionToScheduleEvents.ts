import { parseDayTimeEvent } from "../schedule/parseScheduleDayTime";
import type { ScheduleEvent } from "../types/calendar";
import type { ModifiedSection } from "../types/section";

/**
 * Parses lecture `dayTime` plus `linkedMeetings` into calendar events for overlap checks.
 */
export function modifiedSectionToScheduleEvents(
  section: ModifiedSection,
): ScheduleEvent[] {
  const code = section.courseData?.code?.trim() ?? "";
  let nextId = 1;
  const out: ScheduleEvent[] = [];

  const primary = parseDayTimeEvent(
    section.dayTime,
    code || undefined,
    nextId++,
  );
  if (primary) {
    out.push(primary);
  }

  for (const m of section.linkedMeetings ?? []) {
    const label = [code, m.component].filter(Boolean).join(" ").trim();
    const ev = parseDayTimeEvent(m.dayTime, label || undefined, nextId++);
    if (ev) {
      out.push(ev);
    }
  }

  return out;
}
