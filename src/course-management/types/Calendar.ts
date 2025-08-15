export interface ScheduleEvent {
  id: number;
  subj: string;
  start: string;
  end: string;
  days: { day: string; isOverlapping: boolean }[];
  color: string;
}

