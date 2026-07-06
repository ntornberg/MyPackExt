import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlannerPanelProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
};

export function PlannerPanel({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  headerClassName,
}: PlannerPanelProps) {
  return (
    <Card className={cn("min-w-0 overflow-visible bg-card/80 shadow-sm", className)}>
      <CardHeader className={cn(actions ? "gap-3" : "gap-1", headerClassName)}>
        {actions ? (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <PlannerPanelTitle
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
            {actions}
          </div>
        ) : (
          <PlannerPanelTitle
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        )}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

function PlannerPanelTitle({
  eyebrow,
  title,
  description,
}: Pick<PlannerPanelProps, "eyebrow" | "title" | "description">) {
  return (
    <div className="min-w-0">
      {eyebrow ? (
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {eyebrow}
        </div>
      ) : null}
      <CardTitle className="text-base">{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </div>
  );
}
