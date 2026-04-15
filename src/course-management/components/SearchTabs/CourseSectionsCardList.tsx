import { useCallback, useEffect, useMemo, useState } from "react";

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

  const handleRowPreview = useCallback(
    (group: GroupedRow, labClassOverride?: string | null) => {
      const lec = group.lecture;
      if (!lec) {
        return;
      }
      const pick =
        labClassOverride !== undefined
          ? labClassOverride
          : labClassByRowId[group.uniqueRowId];
      const section = groupedSectionForPreview(group, pick);
      if (!section) {
        return;
      }
      onPreviewSectionChange(createSectionPreview(tab, section));
    },
    [labClassByRowId, onPreviewSectionChange, tab],
  );

  return (
    <SectionCompareList
      isEmpty={filteredRows.length === 0}
      emptyMessage="No sections match the current filters for this course."
    >
      {filteredRows.map((row) => {
        const lec = row.lecture;
        if (!lec) {
          return null;
        }
        const labs = (row.labs ?? []).filter(Boolean) as ModifiedSection[];
        const multiLab = labs.length > 1;
        const pick =
          labClassByRowId[row.uniqueRowId] ?? defaultLabClassForGroup(row);
        const selectedId = previewIdForGroupedRow(row, pick);

        return (
          <SectionCompareCard
            key={row.uniqueRowId}
            section={lec}
            isSelected={selectedId === selectedPreviewId}
            onSelect={() => handleRowPreview(row)}
            selectedLabClassNumber={
              multiLab && pick !== undefined ? pick : undefined
            }
            onLabClassChange={(classNbr) => {
              setLabClassByRowId((prev) => ({
                ...prev,
                [row.uniqueRowId]: classNbr,
              }));
              handleRowPreview(row, classNbr);
            }}
            addToCartSlot={<ToCartGroupedSectionCell {...row} />}
          />
        );
      })}
    </SectionCompareList>
  );
}
