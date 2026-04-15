import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { ScheduleEvent } from "../../types/Calendar";
import {
  CALENDAR_CONFLICT_BLOCK_SHELL,
  calendarBlockShellStyle,
} from "../../types/Calendar";

/**
 * Converts a 12-hour time string (e.g., "3:30 PM") to minutes since midnight.
 *
 * @param {string} time Time string formatted like "3:30 PM" or "11:05 AM"
 * @returns {number} Minutes since midnight
 */
export function toMinutes(time: string) {
  const [hms, mod] = time.split(" ");
  let [h, m] = hms.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Calculates pixel positions for an event block within the calendar body.
 *
 * @param {string} start Start time (e.g., "9:00 AM")
 * @param {string} end End time (e.g., "10:15 AM")
 * @param {number} bodyPx Pixel height of the calendar body (6 AM – 10 PM)
 * @returns {{ topPx: number, heightPx: number }} Pixel metrics for positioning
 */
function getMetrics(
  start: string,
  end: string,
  bodyPx: number,
  windowStart: number,
  windowEnd: number,
) {
  const windowStartMin = windowStart * 60;
  const windowLenMin = (windowEnd - windowStart) * 60;
  const pxPerMin = bodyPx / windowLenMin;
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  return {
    topPx: (startMin - windowStartMin) * pxPerMin,
    heightPx: (endMin - startMin) * pxPerMin,
  };
}

/* measure an element's size */
/**
 * Hook that returns a ref and its element size, updating on ResizeObserver events.
 *
 * @returns {[React.RefObject<T>, { w: number; h: number }]} Ref to attach and current size
 */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [s, set] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) =>
      set({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, s] as const;
}

/**
 * Renders an inline week-view grid and paints events across weekdays with overlap awareness.
 *
 * @param {{ eventData: ScheduleEvent[] }} props Events to render
 * @returns {JSX.Element} Calendar element
 */
export default function CreateCalendar({
  eventData,
}: {
  eventData: ScheduleEvent[];
}) {
  const { windowStart, windowEnd } = useMemo(() => {
    if (eventData.length === 0) {
      return { windowStart: 8, windowEnd: 18 };
    }

    const eventStarts = eventData.map((event) => toMinutes(event.start));
    const eventEnds = eventData.map((event) => toMinutes(event.end));
    const earliestHour = Math.floor(Math.min(...eventStarts) / 60);
    const latestHour = Math.ceil(Math.max(...eventEnds) / 60);

    return {
      windowStart: Math.max(8, earliestHour - 1),
      windowEnd: Math.min(22, Math.max(latestHour + 1, earliestHour + 6)),
    };
  }, [eventData]);
  const hours = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i,
  );
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const events = eventData;
  const [bodyRef, body] = useSize<HTMLDivElement>();

  return (
    <div
      className="mx-auto grid h-[400px] min-h-[400px] w-full max-w-[1400px] grid-cols-[48px_repeat(5,minmax(52px,1fr))] grid-rows-[40px_1fr] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background via-muted/15 to-muted/35 shadow-sm dark:bg-[linear-gradient(165deg,rgba(6,12,22,0.98)_0%,rgba(10,18,32,0.99)_45%,rgba(8,14,26,1)_100%)] dark:shadow-none sm:grid-cols-[60px_repeat(5,minmax(56px,1fr))] sm:grid-rows-[48px_1fr]"
    >
      <div
        className="border-b border-r border-border bg-muted/50 dark:border-white/10 dark:bg-white/[0.06]"
        style={{ gridColumn: 1, gridRow: 1 }}
      />

      {weekdays.map((day, index) => (
        <div
          key={day}
          className={cn(
            "flex items-center justify-center border-b border-border bg-muted/40 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground sm:px-2 sm:text-xs",
            "dark:border-white/10 dark:bg-gradient-to-b dark:from-white/[0.08] dark:to-white/[0.02]",
            index < 4 && "border-r border-border dark:border-white/[0.08]",
          )}
          style={{
            gridColumn: index + 2,
            gridRow: 1,
          }}
        >
          <span className="sm:hidden">{day.charAt(0)}</span>
          <span className="hidden sm:inline">{day}</span>
        </div>
      ))}

      <div
        className="relative border-r border-border bg-muted/30 dark:border-white/10 dark:bg-black/20"
        style={{ gridColumn: 1, gridRow: 2 }}
      >
        {hours.map((h) => {
          const top =
            body.h > 0
              ? (body.h / ((windowEnd - windowStart) * 60)) *
                (h * 60 - windowStart * 60)
              : 0;
          return (
            <span
              key={h}
              className="pointer-events-none absolute left-1 select-none text-[9px] tabular-nums text-muted-foreground sm:left-2 sm:text-[10px] md:left-3 md:text-[11px]"
              style={{ top: top - 8 }}
            >
              {window.innerWidth < 600
                ? `${((h + 11) % 12) + 1}${h < 12 ? "a" : "p"}`
                : `${((h + 11) % 12) + 1}${h < 12 ? "AM" : "PM"}`}
            </span>
          );
        })}
      </div>

      <div
        ref={bodyRef}
        className="relative grid grid-cols-5 bg-gradient-to-b from-muted/20 to-muted/45 dark:bg-[linear-gradient(180deg,rgba(12,20,36,0.5)_0%,rgba(8,14,26,0.85)_100%)]"
        style={{ gridColumn: "2 / span 5", gridRow: 2 }}
      >
        {hours.map((h) => {
          if (h === windowStart) return null;
          const top =
            body.h > 0
              ? (body.h / ((windowEnd - windowStart) * 60)) *
                (h * 60 - windowStart * 60)
              : 0;
          return (
            <div
              key={h}
              className="absolute inset-x-0 border-t border-border/60 dark:border-white/[0.06]"
              style={{ top }}
            />
          );
        })}

        {weekdays.map((day, colIdx) => (
          <div
            key={day}
            className={cn(
              "relative text-foreground/95",
              colIdx < 4 && "border-r border-border/60 dark:border-white/[0.06]",
            )}
          >
            {body.h > 0 &&
              events
                .filter((e) => e.days.some((d) => d.day === day))
                .map((ev) => {
                  const { topPx, heightPx } = getMetrics(
                    ev.start,
                    ev.end,
                    body.h,
                    windowStart,
                    windowEnd,
                  );
                  const isOverlap = ev.days.some(
                    (d) => d.isOverlapping && d.day === day,
                  );
                  return (
                    <div
                      key={`${ev.id}-${day}`}
                      className="absolute flex min-h-[18px] items-center overflow-hidden rounded-lg px-1.5 py-0.5 text-[8px] leading-snug font-semibold tracking-tight text-white sm:min-h-5 sm:px-2 sm:py-1 sm:text-[9px] md:text-[10px]"
                      style={{
                        top: topPx,
                        left: window.innerWidth < 640 ? 3 : 5,
                        right: window.innerWidth < 640 ? 3 : 5,
                        height: Math.max(heightPx, 18),
                        zIndex: isOverlap ? 3 : 2,
                        ...(isOverlap
                          ? CALENDAR_CONFLICT_BLOCK_SHELL
                          : calendarBlockShellStyle(ev.color)),
                      }}
                    >
                      {ev.subj.length > 15 && window.innerWidth < 600
                        ? `${ev.subj.split(" ")[0]} ${ev.subj.split(" ")[1]}...`
                        : ev.subj}
                    </div>
                  );
                })}
          </div>
        ))}
      </div>
    </div>
  );
}
