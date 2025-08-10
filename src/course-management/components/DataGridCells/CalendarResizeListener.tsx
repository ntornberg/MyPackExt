import { useRef, useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { ScheduleEvent } from './CalendarView';

/**
 * Converts a 12-hour time string (e.g., "3:30 PM") to minutes since midnight.
 *
 * @param {string} time Time string formatted like "3:30 PM" or "11:05 AM"
 * @returns {number} Minutes since midnight
 */
export function toMinutes(time: string) {
  const [hms, mod] = time.split(' ');
  let [h, m] = hms.split(':').map(Number);
  if (mod === 'PM' && h !== 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
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
function getMetrics(start: string, end: string, bodyPx: number) {
  const windowStartMin = 6 * 60; // 6 AM
  const windowLenMin = 16 * 60; // 6 AM->10 PM = 960 min
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
      set({ w: e.contentRect.width, h: e.contentRect.height })
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
export default function CreateCalendar({ eventData }: { eventData: ScheduleEvent[] }) {
  const windowStart = 6,
    windowEnd = 22;
  const hours = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  );
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const events = eventData;

  /* size of the body (6 AM–10 PM) */
  const [bodyRef, body] = useSize<HTMLDivElement>();

  return (
    <Box sx={{
        height: '25vh',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: {
          xs: '40px repeat(5, 1fr)',
          sm: 'clamp(50px, 8vw, 80px) repeat(5, 1fr)',
        },
        gridTemplateRows: {
          xs: '35px 1fr',
          sm: 'clamp(40px, 8vh, 60px) 1fr',
        },
        overflow: 'hidden',
        p: { xs: 0.5, sm: 1, md: 2 },
      }}
    >
      <Box
        sx={{
          gridColumn: 1,
          gridRow: 1,
          borderRight: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          bgcolor: '#fafafa',
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
            color: 'black',
            fontSize: { xs: '12px', sm: '14px', md: '16px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fafafa',
            borderBottom: '1px solid #ddd',
            borderRight: i < 4 ? '1px solid #ddd' : 'none',
          }}
        >
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{d.charAt(0)}</Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{d}</Box>
        </Typography>
      ))}

      <Box
        sx={{
          gridColumn: 1,
          gridRow: 2,
          position: 'relative',
          borderRight: '1px solid #ddd',
          bgcolor: '#fafafa',
        }}
      >
        {hours.map((h) => {
          const top =
            body.h > 0 ? (body.h / 960) * (h * 60 - windowStart * 60) : 0;
          return (
            <Typography
              key={h}
              sx={{
                position: 'absolute',
                top: top - 8,
                left: { xs: 1, sm: 2, md: 4 },
                fontSize: { xs: '8px', sm: '10px', md: '12px' },
                color: '#666',
                userSelect: 'none',
              }}
            >
              {window.innerWidth < 600
                ? `${((h + 11) % 12) + 1}${h < 12 ? 'a' : 'p'}`
                : `${((h + 11) % 12) + 1}${h < 12 ? 'AM' : 'PM'}`}
            </Typography>
          );
        })}
      </Box>

      <Box
        ref={bodyRef}
        sx={{
          gridColumn: '2 / span 5',
          gridRow: 2,
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          bgcolor: 'white',
        }}
      >
        {hours.map((h) => {
          if (h === windowStart) return null;
          const top =
            body.h > 0 ? (body.h / 960) * (h * 60 - windowStart * 60) : 0;
          return (
            <Box
              key={h}
              sx={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                borderTop: '1px solid #e0e0e0',
                zIndex: 1,
              }}
            />
          );
        })}

        {weekdays.map((day, colIdx) => (
          <Box
            key={day}
            sx={{
              color: 'black',
              position: 'relative',
              borderRight: colIdx < 4 ? '1px solid #e0e0e0' : 'none',
            }}
          >
            {body.h > 0 &&
              events
                .filter((e) => e.days.some((d) => d.day === day))
                .map((ev) => {
                  const { topPx, heightPx } = getMetrics(
                    ev.start,
                    ev.end,
                    body.h
                  );
                  return (
                    <Paper
                      key={`${ev.id}-${day}`}
                      elevation={2}
                      sx={{
                        position: 'absolute',
                        top: topPx,
                        left: { xs: 1, sm: 2, md: 3 },
                        right: { xs: 1, sm: 2, md: 3 },
                        height: heightPx,
                        bgcolor: ev.color,
                        opacity: ev.days.some((d) => d.isOverlapping && d.day === day) ? 0.5 : 1,
                        color: '#fff',
                        px: { xs: 0.5, sm: 0.75, md: 1 },
                        py: { xs: 0.25, sm: 0.5 },
                        fontSize: { xs: '8px', sm: '9px', md: '9px' },
                        fontWeight: 500,
                        borderRadius: { xs: 0.5, sm: 1 },
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'flex-start',
                        minHeight: { xs: '12px', sm: '16px', md: '20px' },
                        zIndex: 2,
                        lineHeight: 1.2,
                      }}
                    >
                      {ev.subj.length > 15 && window.innerWidth < 600
                        ? `${ev.subj.split(' ')[0]} ${ev.subj.split(' ')[1]}...`
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
