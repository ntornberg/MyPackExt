import { Box, Paper, Typography } from "@mui/material";
import { useMemo, useRef, useState, useEffect } from "react";

import type { ScheduleEvent } from "../../types/Calendar";

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

  /* size of the body (6 AM–10 PM) */
  const [bodyRef, body] = useSize<HTMLDivElement>();

  return (
    <Box
      sx={{
        height: 360,
        width: "100%",
        minHeight: 360,
        maxWidth: "1400px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: {
          xs: "44px repeat(5, 1fr)",
          sm: "56px repeat(5, 1fr)",
        },
        gridTemplateRows: {
          xs: "36px 1fr",
          sm: "44px 1fr",
        },
        overflow: "hidden",
        p: 1,
        borderRadius: 3,
        background:
          "linear-gradient(180deg, rgba(7, 13, 24, 0.96), rgba(11, 18, 31, 0.98))",
        border: "1px solid rgba(89, 117, 177, 0.16)",
        boxShadow: "inset 0 1px 0 rgba(125, 160, 232, 0.08)",
      }}
    >
      <Box
        sx={{
          gridColumn: 1,
          gridRow: 1,
          borderRight: "1px solid rgba(111, 136, 188, 0.12)",
          borderBottom: "1px solid rgba(111, 136, 188, 0.12)",
          bgcolor: "rgba(255, 255, 255, 0.02)",
        }}
      />

      {weekdays.map((d, i) => (
        <Typography
          key={d}
          align="center"
          sx={{
            gridColumn: i + 2,
            px: { xs: 0.5, sm: 1, md: 2 },
            gridRow: 1,
            fontWeight: 600,
            color: "rgba(229, 238, 255, 0.92)",
            fontSize: { xs: "11px", sm: "12px", md: "12px" },
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255, 255, 255, 0.02)",
            borderBottom: "1px solid rgba(111, 136, 188, 0.12)",
            borderRight:
              i < 4 ? "1px solid rgba(111, 136, 188, 0.12)" : "none",
          }}
        >
          <Box sx={{ display: { xs: "block", sm: "none" } }}>{d.charAt(0)}</Box>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>{d}</Box>
        </Typography>
      ))}

      <Box
        sx={{
          gridColumn: 1,
          gridRow: 2,
          position: "relative",
          borderRight: "1px solid rgba(111, 136, 188, 0.12)",
          bgcolor: "rgba(255, 255, 255, 0.01)",
        }}
      >
        {hours.map((h) => {
          const top =
            body.h > 0
              ? (body.h / ((windowEnd - windowStart) * 60)) *
                (h * 60 - windowStart * 60)
              : 0;
          return (
            <Typography
              key={h}
              sx={{
                position: "absolute",
                top: top - 8,
                left: { xs: 1, sm: 2, md: 4 },
                fontSize: { xs: "8px", sm: "9px", md: "10px" },
                color: "rgba(160, 182, 223, 0.72)",
                userSelect: "none",
              }}
            >
              {window.innerWidth < 600
                ? `${((h + 11) % 12) + 1}${h < 12 ? "a" : "p"}`
                : `${((h + 11) % 12) + 1}${h < 12 ? "AM" : "PM"}`}
            </Typography>
          );
        })}
      </Box>

      <Box
        ref={bodyRef}
        sx={{
          gridColumn: "2 / span 5",
          gridRow: 2,
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          bgcolor: "rgba(8, 14, 24, 0.78)",
        }}
      >
        {hours.map((h) => {
          if (h === windowStart) return null;
          const top =
            body.h > 0
              ? (body.h / ((windowEnd - windowStart) * 60)) *
                (h * 60 - windowStart * 60)
              : 0;
          return (
            <Box
              key={h}
              sx={{
                position: "absolute",
                top,
                left: 0,
                right: 0,
                borderTop: "1px solid rgba(111, 136, 188, 0.1)",
                zIndex: 1,
              }}
            />
          );
        })}

        {weekdays.map((day, colIdx) => (
          <Box
            key={day}
            sx={{
              color: "rgba(236, 243, 255, 0.95)",
              position: "relative",
              borderRight:
                colIdx < 4 ? "1px solid rgba(111, 136, 188, 0.1)" : "none",
            }}
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
                  return (
                    <Paper
                      key={`${ev.id}-${day}`}
                      elevation={2}
                      sx={{
                        position: "absolute",
                        top: topPx,
                        left: { xs: 2, sm: 4 },
                        right: { xs: 2, sm: 4 },
                        height: heightPx,
                        bgcolor: ev.days.some(
                          (d) => d.isOverlapping && d.day === day,
                        )
                          ? "#f9735b"
                          : "#4c86ff",
                        opacity: ev.days.some(
                          (d) => d.isOverlapping && d.day === day,
                        )
                          ? 0.88
                          : 0.96,
                        color: "#fff",
                        px: { xs: 0.5, sm: 0.75 },
                        py: { xs: 0.25, sm: 0.5 },
                        fontSize: { xs: "7px", sm: "8px", md: "8px" },
                        fontWeight: 700,
                        borderRadius: 999,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        minHeight: { xs: "16px", sm: "18px", md: "20px" },
                        zIndex: 2,
                        lineHeight: 1.2,
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      {ev.subj.length > 15 && window.innerWidth < 600
                        ? `${ev.subj.split(" ")[0]} ${ev.subj.split(" ")[1]}...`
                        : ev.subj}
                    </Paper>
                  );
                })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
