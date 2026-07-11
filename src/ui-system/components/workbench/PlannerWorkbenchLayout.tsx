import type { ReactNode } from "react";

type PlannerWorkbenchLayoutProps = {
  controls: ReactNode;
  results: ReactNode;
  preview: ReactNode;
};

export function PlannerWorkbenchLayout({
  controls,
  results,
  preview,
}: PlannerWorkbenchLayoutProps) {
  return (
    <div className="@container min-w-0 w-full">
      <div className="grid w-full gap-3 p-3 @min-[640px]:grid-cols-[17rem_minmax(0,1fr)] @min-[640px]:items-start @min-[640px]:gap-4 @min-[640px]:p-4 @min-[1240px]:grid-cols-[18rem_minmax(22rem,1fr)_minmax(35rem,40rem)]">
        <div className="min-w-0 @min-[1240px]:sticky @min-[1240px]:top-0 @min-[1240px]:self-start">
          <div className="min-w-0 @min-[1240px]:max-h-[calc(92vh-2rem)] @min-[1240px]:overflow-x-hidden @min-[1240px]:overflow-y-auto @min-[1240px]:pr-3 @min-[1240px]:[scrollbar-gutter:stable]">
            {controls}
          </div>
        </div>
        <div className="min-w-0">{results}</div>
        <div className="min-w-0 @min-[640px]:col-span-2 @min-[1240px]:col-span-1 @min-[1240px]:sticky @min-[1240px]:top-0 @min-[1240px]:self-start">
          {preview}
        </div>
      </div>
    </div>
  );
}
