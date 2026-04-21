import { memo, useCallback, useEffect, useMemo, useState } from "react";

import {
  PaginationControls,
  usePagination,
} from "../../../ui-system/components/shared/PaginationControls";
import { SectionCompareCard } from "../../../ui-system/components/workbench/SectionCompareCard";
import { SectionCompareList } from "../../../ui-system/components/workbench/SectionCompareList";
import {
  defaultLabClassForGroup,
  groupedSectionForPreview,
  previewIdForGroupedRow,
  sectionMatchesInstructorFilter,
} from "../../../ui-system/components/workbench/sectionCompareUtils";
import {
  createSectionPreview,
  type PlannerSectionPreview,
  type PlannerWorkbenchTab,
} from "../../../ui-system/components/workbench/workbenchTypes";
import type { ScheduleEvent } from "../../types/Calendar";
import { sortSections } from "../../types/DataGridCourse";
import type { GroupedSections, ModifiedSection } from "../../types/Section";
import { modifiedSectionToScheduleEvents } from "../../utils/modifiedSectionToScheduleEvents";
import { sectionFitsSchedule } from "../../utils/scheduleFitFilter";
import { ToCartGroupedSectionCell } from "../DataGridCells/ToCartButtonCell";

type GroupedRow = GroupedSections & { uniqueRowId: string };

type CourseSectionCardRowProps = {
  row: GroupedRow;
  isSelected: boolean;
  compact: boolean;
  selectedLabClassNumber?: string;
  onSelect: (rowId: string) => void;
  onLabClassChange: (rowId: string, classNbr: string) => void;
};

const CourseSectionCardRow = memo(
  function CourseSectionCardRow({
    row,
    isSelected,
    compact,
    selectedLabClassNumber,
    onSelect,
    onLabClassChange,
  }: CourseSectionCardRowProps) {
    const lecture = row.lecture;
    const labs = useMemo(
      () => (row.labs ?? []).filter(Boolean) as ModifiedSection[],
      [row.labs],
    );
    const multiLab = labs.length > 1;
    const handleSelect = useCallback(() => {
      onSelect(row.uniqueRowId);
    }, [onSelect, row.uniqueRowId]);
    const handleLabClassChange = useCallback(
      (classNbr: string) => {
        onLabClassChange(row.uniqueRowId, classNbr);
      },
      [onLabClassChange, row.uniqueRowId],
    );
    const addToCartSlot = useMemo(
      () => (
        <ToCartGroupedSectionCell
          {...row}
          selectedLabClassNumber={selectedLabClassNumber}
        />
      ),
      [row, selectedLabClassNumber],
    );

    if (!lecture) {
      return null;
    }

    return (
      <SectionCompareCard
        section={lecture}
        isSelected={isSelected}
        onSelect={handleSelect}
        compact={compact}
        selectedLabClassNumber={multiLab ? selectedLabClassNumber : undefined}
        onLabClassChange={multiLab ? handleLabClassChange : undefined}
        addToCartSlot={addToCartSlot}
      />
    );
  },
  (prev, next) =>
    prev.row === next.row &&
    prev.isSelected === next.isSelected &&
    prev.compact === next.compact &&
    prev.selectedLabClassNumber === next.selectedLabClassNumber &&
    prev.onSelect === next.onSelect &&
    prev.onLabClassChange === next.onLabClassChange,
);

export type CourseSectionsCardListProps = {
  tab: PlannerWorkbenchTab;
  sections: GroupedSections[];
  selectedPreviewId: string | null;
  onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
  /** Avoid row id collisions when multiple lists mount (e.g. different catalog numbers). */
  rowKeyPrefix?: string;
  sortFunc?: (a: GroupedSections, b: GroupedSections) => number;
  instructorFilter: string | null;
  scheduleFitOnly: boolean;
  scheduleBackground: ScheduleEvent[];
  compact?: boolean;
};

export function CourseSectionsCardList({
  tab,
  sections,
  selectedPreviewId,
  onPreviewSectionChange,
  rowKeyPrefix = "",
  sortFunc = sortSections,
  instructorFilter,
  scheduleFitOnly,
  scheduleBackground,
  compact = false,
}: CourseSectionsCardListProps) {
  const [labClassByRowId, setLabClassByRowId] = useState<
    Record<string, string>
  >({});

  const processedRows = useMemo((): GroupedRow[] => {
    return [...sections].sort(sortFunc).flatMap((section, index) => {
      if (section.lecture) {
        const id = section.lecture.classNumber || `grouped-${index}`;
        return [{ ...section, uniqueRowId: `${rowKeyPrefix}${id}` }];
      }
      if (section.labs && section.labs.length > 0) {
        return section.labs.map((lab, labIndex) => {
          const id = lab.classNumber || `lab-only-${index}-${labIndex}`;
          return {
            lecture: lab,
            labs: null,
            uniqueRowId: `${rowKeyPrefix}${id}`,
          };
        });
      }
      return [];
    });
  }, [sections, rowKeyPrefix, sortFunc]);

  useEffect(() => {
    setLabClassByRowId({});
  }, [sections, rowKeyPrefix]);

  const filteredRows = useMemo(() => {
    return processedRows.filter((row) => {
      const lec = row.lecture;
      if (!lec) {
        return false;
      }
      if (!sectionMatchesInstructorFilter(lec, instructorFilter)) {
        return false;
      }
      if (scheduleFitOnly) {
        const pick = labClassByRowId[row.uniqueRowId];
        const previewSec = groupedSectionForPreview(row, pick);
        if (!previewSec) {
          return false;
        }
        const evs = modifiedSectionToScheduleEvents(previewSec);
        if (!sectionFitsSchedule(evs, scheduleBackground)) {
          return false;
        }
      }
      return true;
    });
  }, [
    processedRows,
    instructorFilter,
    scheduleFitOnly,
    labClassByRowId,
    scheduleBackground,
  ]);
  const paginationResetKey = [
    rowKeyPrefix,
    instructorFilter ?? "",
    scheduleFitOnly ? "1" : "0",
    compact ? "1" : "0",
  ].join("|");
  const {
    page,
    pageCount,
    setPage,
    slice: paginatedRows,
  } = usePagination(filteredRows, compact ? 8 : 4, paginationResetKey);

  const processedRowsById = useMemo(
    () => new Map(processedRows.map((row) => [row.uniqueRowId, row])),
    [processedRows],
  );

  const handleRowPreviewById = useCallback(
    (rowId: string, labClassOverride?: string | null) => {
      const group = processedRowsById.get(rowId);
      if (!group) {
        return;
      }
      const lec = group.lecture;
      if (!lec) {
        return;
      }
      const pick =
        labClassOverride !== undefined
          ? labClassOverride
          : labClassByRowId[rowId];
      const section = groupedSectionForPreview(group, pick);
      if (!section) {
        return;
      }
      onPreviewSectionChange(createSectionPreview(tab, section));
    },
    [labClassByRowId, onPreviewSectionChange, processedRowsById, tab],
  );

  const handleCardSelect = useCallback(
    (rowId: string) => {
      handleRowPreviewById(rowId);
    },
    [handleRowPreviewById],
  );

  const handleCardLabClassChange = useCallback(
    (rowId: string, classNbr: string) => {
      setLabClassByRowId((prev) =>
        prev[rowId] === classNbr ? prev : { ...prev, [rowId]: classNbr },
      );
      handleRowPreviewById(rowId, classNbr);
    },
    [handleRowPreviewById],
  );

  return (
    <div className="flex flex-col gap-3">
      <SectionCompareList
        isEmpty={filteredRows.length === 0}
        emptyMessage="No sections match the current filters for this course."
      >
        {paginatedRows.map((row) => {
          const pick =
            labClassByRowId[row.uniqueRowId] ?? defaultLabClassForGroup(row);
          const selectedId = previewIdForGroupedRow(row, pick);

          return (
            <CourseSectionCardRow
              key={row.uniqueRowId}
              row={row}
              isSelected={selectedId === selectedPreviewId}
              onSelect={handleCardSelect}
              compact={compact}
              selectedLabClassNumber={pick}
              onLabClassChange={handleCardLabClassChange}
            />
          );
        })}
      </SectionCompareList>
      <PaginationControls
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
      />
    </div>
  );
}
