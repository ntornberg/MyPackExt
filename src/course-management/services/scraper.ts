import { debounce } from "../../utils/debounce";
import { ensureExtensionCell, waitForCart, waitForRows } from "../../utils/dom";
import { AppLogger } from "../../utils/logger";
import { DEBUG } from "../../utils/settings";
import type { Course } from "../../types/api.ts";

import { getCourseAndProfessorDetails } from "./api/PackPlannerAPI/courseDetail/courseDetailService";

// Arrays to store course data
export const courses: Course[] = []; // Stores courses from the main schedule table
export const planner_courses: Course[] = []; // Stores courses from the planner/cart

let dialogStyleObserver: MutationObserver | null = null;

// --- DOM Extraction Helpers ---
/**
 * Extracts course information from a schedule table row in the planner UI.
 *
 * @param rowElement HTMLElement representing a course section child row
 * @returns Parsed course basic info or null if row structure is unexpected
 */
function extractCourseInfoFromRow(rowElement: HTMLElement): Course | null {
  const innerTable = rowElement.querySelector('[id^="scheduleInner_"]');
  if (!innerTable) return null;
  const classDataRow = innerTable.querySelector("tbody > tr");
  if (!classDataRow) return null;
  const classDataCells = classDataRow.querySelectorAll("td");
  let courseTitle = "",
    courseIdNum = "",
    courseAbbreviation = "",
    courseInstructor = "";
  classDataCells.forEach((cell) => {
    if ((cell as HTMLElement).className === "sect") {
      const sectionDetailsContainer = cell.querySelector(
        '[id^="section_details"]',
      );
      if (!sectionDetailsContainer) return;
      const detailDivs = sectionDetailsContainer.querySelectorAll("div");
      if (detailDivs.length > 9) {
        courseTitle = detailDivs[0]?.textContent?.trim() ?? "";
        courseIdNum =
          detailDivs[2]
            ?.querySelector(".classDetailValue")
            ?.textContent?.trim() ?? "";
        courseInstructor =
          detailDivs[9]
            ?.querySelector(".classDetailValue")
            ?.textContent?.trim() ?? "Staff";
      }
    }
  });
  if (!courseTitle || !courseIdNum) return null;
  courseAbbreviation = courseTitle.trim().split(/\s-\s/)[0];
  return {
    title: courseTitle,
    id: courseIdNum,
    abr: courseAbbreviation,
    instructor: courseInstructor,
  };
}

/**
 * Extracts planner course header and instructor from a planner table detail row.
 *
 * @param classDetailRow Element for a planner class details row
 * @returns Minimal course object containing abbreviation and instructor
 */
function extractPlannerCourseInfo(classDetailRow: Element): Course {
  let courseAbbreviation = "N/A";
  let courseInstructor = "N/A";
  const searchResultsInnerTable = classDetailRow.querySelector(
    '[id^="searchResultsInner"]',
  );
  if (searchResultsInnerTable) {
    const innerTableBodyRow =
      searchResultsInnerTable.querySelector("tbody > tr");
    if (innerTableBodyRow) {
      courseInstructor =
        innerTableBodyRow
          .querySelector('[data-label="INSTRUCTOR"]')
          ?.textContent?.trim() ?? "Staff";
    }
  }
  const courseHeaderRow = classDetailRow.previousElementSibling;
  if (courseHeaderRow) {
    const headerCells = courseHeaderRow.querySelectorAll("td");
    if (headerCells.length > 1) {
      courseAbbreviation = headerCells[1]?.textContent?.trim() ?? "N/A";
    }
  }
  return {
    abr: courseAbbreviation,
    instructor: courseInstructor,
    title: "",
    id: "",
  };
}

/**
 * Adds a descriptive cell to the planner header row with course and instructor
 * info. Tagged with `mypack-course-info-cell` so the master hide toggle can
 * collapse it alongside the extension data cell.
 *
 * @param courseHeaderRow The header row preceding the class details row
 * @param course Parsed course info
 */
function addCourseInfoCell(courseHeaderRow: Element | null, course: Course) {
  if (!courseHeaderRow) return;
  const doc = courseHeaderRow.ownerDocument ?? document;
  const headerCell = doc.createElement("td");
  headerCell.className = "mypack-course-info-cell";
  if (!course.instructor) {
    headerCell.textContent = "No course information available.";
  } else {
    const [last, first] = course.instructor.split(",");
    headerCell.textContent = `Course information for ${course.abr} with ${
      first ? first.trim() : ""
    } ${last ? last.trim() : ""}`.replace(/\s+/g, " ");
  }
  courseHeaderRow.appendChild(headerCell);
}

/**
 * Appends grade and professor elements into the extension cell only when present.
 *
 * @param extRow Extension cell element
 * @param gradeElement Rendered grade distribution element
 * @param profElement Rendered professor rating element
 */
function appendExtensionData(
  extRow: HTMLElement,
  gradeElement: HTMLElement,
  profElement: HTMLElement,
) {
  if (gradeElement.textContent !== "No grade data available.") {
    extRow.appendChild(gradeElement);
  }
  if (profElement.textContent !== "Professor not found.") {
    extRow.appendChild(profElement);
  }
}

/**
 * Scrapes course data from the main schedule table.
 *
 * @param {Element} scheduleTableElement The HTML element of the schedule table
 * @returns {void}
 */
export function scrapeScheduleTable(scheduleTableElement: Element): void {
  AppLogger.info("Scraping schedule table...");
  const allScheduledRows = scheduleTableElement.querySelectorAll("tbody > tr");
  let scrapedCount = 0;
  if (allScheduledRows?.length) {
    const courseSectionRows = Array.from(allScheduledRows).filter((el) =>
      el.classList.contains("child"),
    );
    courseSectionRows.forEach((rowElement) => {
      const course = extractCourseInfoFromRow(rowElement as HTMLElement);
      if (!course) return;
      courses.push(course);
      AppLogger.info(
        "Detected scheduled course:",
        course.abr,
        course.id,
        course.instructor,
      );
      scrapedCount++;
    });
  }
  AppLogger.info(
    `Schedule table scraping complete. Found ${scrapedCount} courses.`,
  );
}

/**
 * Scrapes course data from the planner/cart table.
 *
 * @param {Element} plannerTableElement The HTML element of the planner/cart table
 * @returns {Promise<void>} Resolves after scraping and UI updates
 */
export async function scrapePlanner(
  plannerTableElement: Element,
): Promise<void> {
  AppLogger.info("Scraping planner/cart table...");
  planner_courses.length = 0; // Clear previous planner courses
  let scrapedCount = 0;
  try {
    const classRows = await waitForRows(
      plannerTableElement as HTMLTableElement,
      2,
    ); // Expect at least header + child or two child rows
    const filteredClassDetailRows = Array.from(classRows).filter((el) =>
      el.classList.contains("child"),
    );
    for (const classDetailRow of filteredClassDetailRows) {
      const course = extractPlannerCourseInfo(classDetailRow);
      planner_courses.push(course);
      AppLogger.info("Detected planner course:", course.abr, course.instructor);
      scrapedCount++;
      const courseElements = await getCourseAndProfessorDetails(course);
      const extRow = ensureExtensionCell(classDetailRow);
      addCourseInfoCell(classDetailRow.previousElementSibling, course);
      appendExtensionData(
        extRow,
        courseElements.gradeElement,
        courseElements.professorElement,
      );
    }
    AppLogger.info(
      `Planner/cart scraping complete. Found ${scrapedCount} courses.`,
    );
  } catch (error) {
    AppLogger.error(
      "Error scraping planner/cart table or waiting for rows:",
      error,
    );
  }
  await applyIframeStyles(plannerTableElement as HTMLTableElement);
}

// --- Style Helpers ---

const EXT_HIDDEN_CLASS = "mypack-ext-hidden";
const EXT_HIDDEN_STORAGE_KEY = "mypack.extensionInfoHidden";
const EXT_TOGGLE_ID = "mypack-extension-master-toggle";

/**
 * Inline overrides we apply so the MyPack dialog sizes to its content (including
 * the extension column) instead of jQuery UI's fixed inline width. Using
 * `fit-content` lets the dialog naturally shrink when the extension cell is
 * hidden, and the `max-width` cap keeps it from growing past the viewport.
 *
 * Each entry is `[cssProperty, value, priority]` so we can apply `!important`
 * — jQuery UI also writes inline styles on these elements and without the
 * priority flag our values lose the cascade.
 */
type InlineStyleEntry = [string, string, "important" | ""];

const DIALOG_WIDE_PARENT_STYLES: InlineStyleEntry[] = [
  ["width", "fit-content", "important"],
  ["max-width", "min(1100px, 95vw)", "important"],
  ["min-width", "0", "important"],
  ["left", "50%", "important"],
  ["transform", "translateX(-50%)", "important"],
  ["overflow-x", "visible", ""],
  ["position", "relative", ""],
];

const DIALOG_WIDE_INNER_STYLES: InlineStyleEntry[] = [
  ["width", "fit-content", "important"],
  ["max-width", "min(1100px, 95vw)", "important"],
  ["min-width", "0", "important"],
  ["left", "50%", "important"],
  ["transform", "translateX(-50%)", "important"],
  ["overflow-x", "visible", ""],
];

const DIALOG_WIDTH_PROPERTY_KEYS = [
  "width",
  "max-width",
  "min-width",
  "left",
  "transform",
  "overflow-x",
  "position",
];

function readExtensionInfoHiddenPreference(): boolean {
  try {
    return window.localStorage.getItem(EXT_HIDDEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeExtensionInfoHiddenPreference(hidden: boolean): void {
  try {
    window.localStorage.setItem(EXT_HIDDEN_STORAGE_KEY, hidden ? "1" : "0");
  } catch {
    // Storage can be denied (private browsing, quota); failing soft is fine.
  }
}

function clearStyleKeys(el: HTMLElement, keys: string[]): void {
  for (const key of keys) {
    el.style.removeProperty(key);
  }
}

function applyInlineStyles(
  el: HTMLElement,
  entries: InlineStyleEntry[],
): void {
  for (const [prop, value, priority] of entries) {
    el.style.setProperty(prop, value, priority);
  }
}

function applyDialogWidthPreference(
  hidden: boolean,
  dialogParent: HTMLElement | null,
  dialogInner: HTMLElement | null,
): void {
  if (dialogParent) {
    if (hidden) {
      clearStyleKeys(dialogParent, DIALOG_WIDTH_PROPERTY_KEYS);
    } else {
      applyInlineStyles(dialogParent, DIALOG_WIDE_PARENT_STYLES);
    }
  }
  if (dialogInner) {
    if (hidden) {
      clearStyleKeys(dialogInner, DIALOG_WIDTH_PROPERTY_KEYS);
    } else {
      applyInlineStyles(dialogInner, DIALOG_WIDE_INNER_STYLES);
    }
  }
}

function setMasterToggleAppearance(
  button: HTMLButtonElement,
  hidden: boolean,
): void {
  button.setAttribute("aria-pressed", hidden ? "true" : "false");
  const label = hidden
    ? "Show extension info panel"
    : "Hide extension info panel";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.textContent = hidden ? "Show course info" : "Hide course info";
}

function ensureMasterToggle(
  iframeDoc: Document,
  dialogParent: HTMLElement | null,
  dialogInner: HTMLElement | null,
): void {
  if (!dialogInner) return;
  let button = iframeDoc.getElementById(
    EXT_TOGGLE_ID,
  ) as HTMLButtonElement | null;
  if (!button) {
    button = iframeDoc.createElement("button");
    button.id = EXT_TOGGLE_ID;
    button.type = "button";
    button.className = "mypack-ext-master-toggle";
    // Insert at the top of the dialog body so the toggle is visible without
    // scrolling, and so sticky positioning keeps it pinned while scrolling.
    if (dialogInner.firstChild) {
      dialogInner.insertBefore(button, dialogInner.firstChild);
    } else {
      dialogInner.appendChild(button);
    }
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const wasHidden =
        iframeDoc.documentElement.classList.contains(EXT_HIDDEN_CLASS);
      const next = !wasHidden;
      iframeDoc.documentElement.classList.toggle(EXT_HIDDEN_CLASS, next);
      writeExtensionInfoHiddenPreference(next);
      applyDialogWidthPreference(next, dialogParent, dialogInner);
      setMasterToggleAppearance(button as HTMLButtonElement, next);
    });
  }
  const initiallyHidden =
    iframeDoc.documentElement.classList.contains(EXT_HIDDEN_CLASS);
  setMasterToggleAppearance(button, initiallyHidden);
}

/**
 * Applies CSS to target iframes so extension content displays with proper layout and visibility.
 * Ensures dialog containers are flexed and button panes stick to bottom.
 */
export async function applyIframeStyles(
  plannerTableElement: HTMLTableElement,
): Promise<void> {
  AppLogger.info("Applying iframe styles...");
  const iframe = document.querySelector(
    '[id$="divPSPAGECONTAINER"] iframe',
  ) as HTMLIFrameElement | null;
  if (iframe && iframe.contentDocument) {
    const iframeDoc = iframe.contentDocument;
    let dialog_inner = plannerTableElement.closest('[id^="dialog"]');
    let dialog_parent;
    if (!dialog_inner) {
      dialog_inner = plannerTableElement.closest('[role^="dialog"]');
    }
    if (dialog_inner) {
      dialog_parent = dialog_inner.closest('[role^="dialog"]');
    }
    const style = iframeDoc.createElement("style");
    style.textContent = `
    .ui-dialog.cust-ui-dialog {
      position: fixed !important;
      top: 10vh !important;
      left: 50% !important;
      transform: translateX(-50%);
      max-height: 85vh !important;
      width: fit-content !important;
      max-width: min(1100px, 95vw) !important;
      min-width: 0 !important;
      overflow: auto;
    }
    /*
     * jQuery UI's title bar uses white-space: nowrap, so a long offering title
     * forces the whole dialog to be at least that wide — which is why dead
     * space reappears when course info is hidden. Let the title wrap so the
     * dialog can fit-content down to the actual table + extension cell width.
     */
    .ui-dialog.cust-ui-dialog .ui-dialog-titlebar {
      min-width: 0 !important;
      max-width: 100% !important;
    }
    .ui-dialog.cust-ui-dialog .ui-dialog-title {
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
    td.mypack-extension-cell{
    position: relative;
    overflow: visible;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: .375rem;
    padding: .25rem;
    width: 260px;
    max-width: 260px;
    vertical-align: top;
    box-sizing: border-box;
  }
     #classSearchTable{
      table-layout: auto !important;
  }
  tr.child,
td.mypack-extension-cell {
  height: auto !important;
  min-height: unset !important;
  overflow: visible !important;
}
.mypack-extension-cell > * {
  flex: 0 0 auto !important;
  min-height: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  box-sizing: border-box;
}
td.mypack-course-info-cell {
  white-space: normal;
}
html.${EXT_HIDDEN_CLASS} td.mypack-extension-cell,
html.${EXT_HIDDEN_CLASS} td.mypack-course-info-cell {
  display: none !important;
}
.mypack-ext-master-toggle {
  position: sticky;
  top: 4px;
  float: right;
  clear: both;
  z-index: 5;
  margin: 4px 8px 4px 8px;
  appearance: none;
  border: 1px solid rgba(79, 70, 229, 0.45);
  background: #eef2ff;
  color: #312e81;
  font: 600 11px/1.2 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
  transition: background-color .15s ease, color .15s ease, border-color .15s ease;
}
.mypack-ext-master-toggle:hover {
  background: #e0e7ff;
  border-color: rgba(79, 70, 229, 0.7);
}
.mypack-ext-master-toggle[aria-pressed="true"] {
  background: #fee2e2;
  border-color: rgba(220, 38, 38, 0.55);
  color: #7f1d1d;
}
.mypack-ext-master-toggle:focus-visible {
  outline: 2px solid rgba(79, 70, 229, 0.65);
  outline-offset: 1px;
}
  .ui-dialog-buttonpane {
  position: static !important;
  width: auto !important;
  bottom: auto !important;
  top: auto !important;
  margin-top: 1rem;
}
  `;
    iframeDoc.head.appendChild(style);

    // Sync the hidden-state class to the persisted preference before
    // applying width overrides, so the dialog either stays at its original
    // width or snaps to the wide layout as appropriate.
    const hidden = readExtensionInfoHiddenPreference();
    iframeDoc.documentElement.classList.toggle(EXT_HIDDEN_CLASS, hidden);

    applyDialogWidthPreference(
      hidden,
      (dialog_parent as HTMLElement) ?? null,
      (dialog_inner as HTMLElement) ?? null,
    );
    ensureMasterToggle(
      iframeDoc,
      (dialog_parent as HTMLElement) ?? null,
      (dialog_inner as HTMLElement) ?? null,
    );

    if (dialog_inner) {
      await applyFlexDialogLayout(
        dialog_parent as HTMLElement,
        dialog_inner as HTMLElement,
      );
    }
  }
}

/**
 * Makes the jQuery UI dialog a vertical flex container and pins the button pane to the bottom.
 *
 * @param parent_dialog Outer dialog element
 * @param inner_dialog Inner scrollable content container
 */
async function applyFlexDialogLayout(
  parent_dialog: HTMLElement,
  inner_dialog: HTMLElement,
): Promise<void> {
  const dlg = document.querySelector(".ui-dialog.cust-ui-dialog");
  if (DEBUG && dlg) {
    dialogStyleObserver?.disconnect();
    dialogStyleObserver = new MutationObserver((muts) =>
      AppLogger.info("Dialog mutations observed:", muts),
    );
    dialogStyleObserver.observe(dlg, {
      attributes: true,
      attributeFilter: ["style"],
    });
  } else if (dialogStyleObserver) {
    dialogStyleObserver.disconnect();
    dialogStyleObserver = null;
  }
  const titleBar = parent_dialog.querySelector(
    ".ui-dialog-titlebar",
  ) as HTMLElement | null;
  const buttonPane = parent_dialog.querySelector(
    ".ui-dialog-buttonpane",
  ) as HTMLElement | null;
  parent_dialog.style.setProperty("display", "flex", "important");
  parent_dialog.style.setProperty("flex-direction", "column", "important");
  parent_dialog.style.setProperty(
    "height",
    parent_dialog.style.height || getComputedStyle(parent_dialog).height,
    "important",
  );
  parent_dialog.style.setProperty(
    "maxHeight",
    parent_dialog.style.maxHeight || getComputedStyle(parent_dialog).maxHeight,
    "important",
  );
  parent_dialog.style.setProperty("overflow", "hidden", "important");
  inner_dialog.style.setProperty("overflowY", "auto", "important");
  inner_dialog.style.setProperty("overflowX", "hidden", "important");
  inner_dialog.style.setProperty("flexGrow", "1", "important");
  inner_dialog.style.setProperty("flexShrink", "1", "important");
  inner_dialog.style.setProperty("height", "auto", "important");
  inner_dialog.style.setProperty("maxHeight", "none", "important");
  if (titleBar) {
    titleBar.style.setProperty("flexShrink", "0", "important");
  }
  if (buttonPane) {
    buttonPane.style.setProperty("position", "static", "important");
    buttonPane.style.setProperty("flex-shrink", "0", "important");
    buttonPane.style.setProperty("margin-top", "auto", "important");
  }
  AppLogger.info("Dialog layout updated!");
}

/**
 * Creates a debounced function for scraping the planner.
 *
 * @param {(plannerTableElement: Element) => Promise<void>} scrapePlanner The function to debounce
 * @returns {() => void} The debounced trigger function
 */
export function debounceScraper(
  scrapePlanner: (plannerTableElement: Element) => Promise<void>,
) {
  return debounce(async () => {
    AppLogger.info("Planner changes detected, re-scraping planner...");
    try {
      const plannerElement = await waitForCart();
      await scrapePlanner(plannerElement);
    } catch (error) {
      AppLogger.error("Error during debounced planner scrape:", error);
    }
  }, 100);
}

export const debouncedScrapePlanner = debounceScraper(scrapePlanner);
