import type { ModifiedSection } from "../../types/Section";

/**
 * Renders compact course time text for dedicated table column.
 */
export const CourseTimeCell = (params: ModifiedSection) => {
  const timeText =
    params.dayTime && params.dayTime.trim().length > 0 ? params.dayTime : "TBD";

  return (
    <span
      className="inline-block max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap align-middle text-[0.72rem] text-muted-foreground"
      title={timeText}
    >
      {timeText}
    </span>
  );
};
