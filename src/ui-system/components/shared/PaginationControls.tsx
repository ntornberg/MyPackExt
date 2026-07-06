import { useEffect, useMemo, useState, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const DEFAULT_PAGE_SIZE = 10;

type PageWindowEntry = number | "ellipsis";

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function buildPageWindow(page: number, pageCount: number): PageWindowEntry[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const visiblePages = new Set([0, pageCount - 1, page - 1, page, page + 1]);
  const normalizedPages = Array.from(visiblePages)
    .filter((entry) => entry >= 0 && entry < pageCount)
    .sort((left, right) => left - right);

  const windowEntries: PageWindowEntry[] = [];

  for (const currentPage of normalizedPages) {
    const previousEntry = windowEntries[windowEntries.length - 1];
    if (
      typeof previousEntry === "number" &&
      currentPage - previousEntry > 1
    ) {
      windowEntries.push("ellipsis");
    }
    windowEntries.push(currentPage);
  }

  return windowEntries;
}

function createPageLinkHandler(
  targetPage: number,
  onPageChange: (page: number) => void,
  disabled?: boolean,
) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (disabled) {
      return;
    }
    onPageChange(targetPage);
  };
}

export function PaginationControls({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const isPreviousDisabled = page <= 0;
  const isNextDisabled = page >= pageCount - 1;
  const pageWindow = useMemo(
    () => buildPageWindow(page, pageCount),
    [page, pageCount],
  );

  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination className={cn("justify-end", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isPreviousDisabled}
            className={cn(isPreviousDisabled && "pointer-events-none opacity-50")}
            onClick={createPageLinkHandler(page - 1, onPageChange, isPreviousDisabled)}
          />
        </PaginationItem>
        {pageWindow.map((entry, index) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href="#"
                isActive={entry === page}
                onClick={createPageLinkHandler(entry, onPageChange)}
              >
                {entry + 1}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isNextDisabled}
            className={cn(isNextDisabled && "pointer-events-none opacity-50")}
            onClick={createPageLinkHandler(page + 1, onPageChange, isNextDisabled)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function usePagination<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey?: string,
) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [items.length, resetKey]);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const sliceStart = safePage * pageSize;
  const sliceEnd = sliceStart + pageSize;
  const slice = items.slice(sliceStart, sliceEnd);

  return {
    page: safePage,
    pageCount,
    pageSize,
    setPage,
    slice,
    sliceEnd: Math.min(sliceEnd, items.length),
    sliceStart,
  };
}
