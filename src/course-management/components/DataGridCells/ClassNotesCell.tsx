import { InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { ModifiedSection } from "../../types/Section";

/**
 * Displays a tooltip icon with class notes when present.
 *
 * @param {ModifiedSection} params Section containing `notes`
 * @returns {JSX.Element} Tooltip with info icon
 */
export const ClassNotesCell = (params: ModifiedSection) => {
  const { notes } = params;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <InfoIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{notes}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
