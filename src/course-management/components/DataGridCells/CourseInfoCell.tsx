import { InfoIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { ModifiedSection } from "../../types/Section";

import { CalendarView } from "./CalendarView";

/**
 * Renders compact course information with a rich tooltip showing details and the calendar view.
 *
 * @param {ModifiedSection} params Section data used to render info and the calendar peek
 * @returns {JSX.Element} Info cell element
 */
export const CourseInfoCell = (params: ModifiedSection) => {
  const { section, component, dayTime, location, courseData, linkedMeetings } =
    params;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const tooltipContent = useMemo(
    () => (
      <div className="flex flex-col gap-1 p-1" style={{ maxWidth: 800 }}>
        <p className="text-sm font-bold">Section: {section}</p>
        <p className="text-sm">Type: {component}</p>
        <p className="text-sm">Time: {dayTime}</p>
        <p className="text-sm">Location: {location}</p>
        {tooltipOpen ? (
          <CalendarView
            dayTime={dayTime}
            courseData={courseData}
            linkedMeetings={linkedMeetings}
          />
        ) : null}
      </div>
    ),
    [component, courseData, dayTime, linkedMeetings, location, section, tooltipOpen],
  );

  return (
    <div className="flex max-w-[220px] min-w-0 flex-nowrap items-center gap-[0.75]">
      <TooltipProvider>
        <Tooltip
          open={tooltipOpen}
          onOpenChange={(open) => {
            setTooltipOpen(open);
          }}
        >
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
              <InfoIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="end"
            className="max-h-[800px] max-w-[900px] bg-card p-0 text-sm text-card-foreground shadow-lg"
          >
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {component && (
        <Badge
          variant="outline"
          className="h-5 border-border text-[0.68rem]"
        >
          {component}
        </Badge>
      )}
      {location?.includes("Online") && (
        <Badge className="h-5 text-[0.68rem]">Online</Badge>
      )}
    </div>
  );
};
