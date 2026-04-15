import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { ModifiedSection } from "../../types/Section";

/**
 * Prerequisite indicator tooltip for a section.
 *
 * @param {ModifiedSection} params Section containing `requisites`
 * @returns {JSX.Element} Tooltip with warning icon
 */
export const PrereqCell = (params: ModifiedSection) => {
  const { requisites } = params;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <TriangleAlertIcon className="size-4 text-amber-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{requisites}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
