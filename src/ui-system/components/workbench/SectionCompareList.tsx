import type { ReactNode } from "react";

export type SectionCompareListProps = {
  isEmpty: boolean;
  emptyMessage: string;
  /** e.g. cart notice alert above the list */
  header?: ReactNode;
  children: ReactNode;
};

export function SectionCompareList({
  isEmpty,
  emptyMessage,
  header,
  children,
}: SectionCompareListProps) {
  return (
    <div className="space-y-3">
      {header}
      {isEmpty ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div role="listbox" aria-label="Course sections" className="space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
