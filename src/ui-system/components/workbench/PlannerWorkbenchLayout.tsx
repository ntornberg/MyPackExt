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
      <div className="grid w-full gap-4 p-3 @min-[960px]:grid-cols-[18rem_minmax(0,1fr)_minmax(35rem,40rem)] @min-[960px]:items-start @min-[960px]:p-4">
        <div className="min-w-0 @min-[960px]:sticky @min-[960px]:top-0 @min-[960px]:self-start">
          <div className="min-w-0 @min-[960px]:max-h-[calc(92vh-2rem)] @min-[960px]:overflow-x-hidden @min-[960px]:overflow-y-auto @min-[960px]:pr-3 @min-[960px]:[scrollbar-gutter:stable]">
            {controls}
          </div>
        </div>
        <div className="min-w-0">{results}</div>
        <div className="min-w-0 @min-[960px]:sticky @min-[960px]:top-0 @min-[960px]:self-start">
          {preview}
        </div>
      </div>
    </div>
  );
}
