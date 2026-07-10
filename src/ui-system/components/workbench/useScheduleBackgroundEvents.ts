import { useEffect, useState } from "react";

import {
  loadCartScheduleEvents,
  loadScheduleEvents,
} from "../../../course-management/components/calendar/CalendarView";
import type { ScheduleEvent } from "../../../course-management/types/calendar";

/**
 * Cart + enrolled blocks from the extension cache (same source as {@link CalendarView} background).
 */
export function useScheduleBackgroundEvents(): ScheduleEvent[] {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [cart, enrolled] = await Promise.all([
          loadCartScheduleEvents(),
          loadScheduleEvents(),
        ]);
        if (!cancelled) {
          setEvents([...cart, ...enrolled]);
        }
      } catch {
        if (!cancelled) {
          setEvents([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}
