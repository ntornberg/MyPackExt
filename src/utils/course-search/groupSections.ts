import { AppLogger } from "../logger";

import type {
  GroupedSections,
  ModifiedSection,
} from "../../course-management/types/Section";
import type { CourseSection } from "./parseRegistrarUtil";

/** Registrar / PeopleSoft vary casing and wording ("Lec", "LEC", "Lecture"). */
function isLectureComponent(component: string): boolean {
  const c = component.trim().toLowerCase();
  return c === "lec" || c === "lecture";
}

/** Strip BOM / ZWSP / NBSP that sometimes appear in scraped registrar cells. */
function scrubSectionToken(raw: string): string {
  return raw.replace(/[\u200B-\u200D\uFEFF\u00a0]/g, "").trim();
}

/**
 * NC State registrar section-number encoding (per scheduling docs):
 *   000–199 standard lectures      (00x / 0xx / 1xx)
 *   200–299 labs                   (attach to lecture sharing last two digits)
 *   300–399 hybrid lectures        (standalone)
 *   400–499 problem sessions       (attach to lecture sharing last two digits)
 *   500–599 study abroad           (standalone)
 *   600–699 Distance Education     (standalone lecture)
 *   700–799 additional DE components (attach to 6xx DE lecture, same last two digits)
 *   800–899 AGIDEA                 (standalone)
 *
 * Examples: lecture `001` owns labs `201A`, `201B`, `201K`; lecture `003` owns
 * `203A`, `203B`, `203C`. We normalize every attached component to the lecture
 * key (`001` → `"1"`, `201A` → `"1"`, `401A` → `"1"`) so labs/problem sessions
 * bucket into the same GroupedSection as the lecture they belong to.
 *
 * Prefer the section column over `id` so class numbers never perturb the bucket
 * (e.g. id `10-101` must not key as `101`).
 */
function enrollmentSectionGroupKey(
  sectionLabel: string,
  rowId: string,
  component: string,
): string | null {
  const label = scrubSectionToken(sectionLabel);
  const fromLabel = label.match(/^(\d+)/u);
  let digitRun = fromLabel?.[1] ?? null;
  if (!digitRun) {
    const idHead = scrubSectionToken(rowId.split("-")[0] ?? "");
    digitRun = idHead.match(/^(\d+)/u)?.[1] ?? null;
  }
  if (!digitRun) {
    const fallback = scrubSectionToken(rowId).match(/\d+/u);
    return fallback?.[0] ?? null;
  }
  const n = parseInt(digitRun, 10);
  if (!Number.isFinite(n) || n < 0) {
    return digitRun;
  }
  if (!isLectureComponent(component)) {
    // Labs (2xx) and problem sessions (4xx) share the last two digits with
    // their parent lecture in the 000–199 range.
    if (n >= 200 && n < 300) return String(n - 200);
    if (n >= 400 && n < 500) return String(n - 400);
    // Additional DE components (7xx) attach to the 6xx DE lecture with the
    // same last two digits (e.g. 701 → 601).
    if (n >= 700 && n < 800) return String(n - 100);
  }
  return String(n);
}

/**
 * Groups registrar sections by numeric section id into a lecture with associated labs.
 * Optionally maps through a provided section override map (e.g., enriched sections).
 *
 * @param {CourseSection[]} sections Flat list of sections for a course
 * @param {Record<string, ModifiedSection>} [courseSections] Optional override map by section id
 * @returns {Record<string, GroupedSections>} Grouped lecture and labs keyed by numeric id
 */
export function groupSections(
  sections: CourseSection[],
  courseSections?: Record<string, ModifiedSection>,
) {
  const groupedSections: Record<string, GroupedSections> = {};
  for (const section of sections) {
    const groupKey = enrollmentSectionGroupKey(
      section.section,
      section.id,
      section.component,
    );
    if (groupKey) {
      if (!groupedSections[groupKey]) {
        groupedSections[groupKey] = { lecture: null, labs: [] };
      }
      if (isLectureComponent(section.component)) {
        if (groupedSections[groupKey].lecture != null) {
          AppLogger.warn("Lecture already exists for", groupKey);
        }
        const resolved = courseSections
          ? courseSections[section.id]
          : section;
        if (resolved) {
          groupedSections[groupKey].lecture = resolved;
        }
      } else {
        const resolved = courseSections
          ? courseSections[section.id]
          : section;
        if (resolved) {
          groupedSections[groupKey].labs?.push(resolved);
        }
      }
    }
  }
  return groupedSections;
}
