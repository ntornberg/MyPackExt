import { debounce } from '../../core/utils/common';
import {ensureExtensionCell, waitForCart, waitForRows} from '../../core/utils/dom';
import {AppLogger} from '../../core/utils/logger';
import type {Course} from '../../degree-planning/types/DataBaseResponses/SupaBaseResponseType';
import {getCourseAndProfessorDetails} from './api/PackPlannerAPI/courseDetail/courseDetailService';

// Arrays to store course data
export const courses: Course[] = []; // Stores courses from the main schedule table
export const planner_courses: Course[] = []; // Stores courses from the planner/cart

// --- DOM Extraction Helpers ---
/** Extracts course info from a schedule table row. */
function extractCourseInfoFromRow(rowElement: HTMLElement): Course | null {
    const innerTable = rowElement.querySelector('[id^="scheduleInner_"]');
    if (!innerTable) return null;
    const classDataRow = innerTable.querySelector('tbody > tr');
    if (!classDataRow) return null;
    const classDataCells = classDataRow.querySelectorAll('td');
    let courseTitle = '', courseIdNum = '', courseAbbreviation = '', courseInstructor = '';
    classDataCells.forEach((cell) => {
        if ((cell as HTMLElement).className === 'sect') {
            const sectionDetailsContainer = cell.querySelector('[id^="section_details"]');
            if (!sectionDetailsContainer) return;
            const detailDivs = sectionDetailsContainer.querySelectorAll('div');
            if (detailDivs.length > 9) {
                courseTitle = detailDivs[0]?.textContent?.trim() ?? '';
                courseIdNum = detailDivs[2]?.querySelector('.classDetailValue')?.textContent?.trim() ?? '';
                courseInstructor = detailDivs[9]?.querySelector('.classDetailValue')?.textContent?.trim() ?? 'Staff';
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

/** Extracts planner course info from a planner table row. */
function extractPlannerCourseInfo(classDetailRow: Element): Course {
    let courseAbbreviation = 'N/A';
    let courseInstructor = 'N/A';
    const searchResultsInnerTable = classDetailRow.querySelector('[id^="searchResultsInner"]');
    if (searchResultsInnerTable) {
        const innerTableBodyRow = searchResultsInnerTable.querySelector('tbody > tr');
        if (innerTableBodyRow) {
            courseInstructor = innerTableBodyRow.querySelector('[data-label="INSTRUCTOR"]')?.textContent?.trim() ?? 'Staff';
        }
    }
    const courseHeaderRow = classDetailRow.previousElementSibling;
    if (courseHeaderRow) {
        const headerCells = courseHeaderRow.querySelectorAll('td');
        if (headerCells.length > 1) {
            courseAbbreviation = headerCells[1]?.textContent?.trim() ?? 'N/A';
        }
    }
    return {
        abr: courseAbbreviation,
        instructor: courseInstructor,
        title: '',
        id: '',
    };
}

/** Adds a course info cell to the planner header row. */
function addCourseInfoCell(courseHeaderRow: Element | null, course: Course) {
    if (!courseHeaderRow) return;
    const headerCell = document.createElement('td');
    if (!course.instructor) {
        headerCell.innerText = 'No course information available.';
    } else {
        const [last, first] = course.instructor.split(',');
        headerCell.innerText = `Course information for ${course.abr} with ${first ? first.trim() : ''} ${last ? last.trim() : ''}`;
    }
    courseHeaderRow.appendChild(headerCell);
}

/** Appends extension data elements to the extension cell. */
function appendExtensionData(extRow: HTMLElement, gradeElement: HTMLElement, profElement: HTMLElement) {
    if (gradeElement.textContent !== 'No grade data available.') {
        extRow.appendChild(gradeElement);
    }
    if (profElement.textContent !== 'Professor not found.') {
        extRow.appendChild(profElement);
    }
}


/**
 * Scrapes course data from the main schedule table.
 * @param {Element} scheduleTableElement - The HTML element of the schedule table.
 */
export function scrapeScheduleTable(scheduleTableElement: Element): void {
    AppLogger.info('Scraping schedule table...');
    const allScheduledRows = scheduleTableElement.querySelectorAll('tbody > tr');
    let scrapedCount = 0;
    if (allScheduledRows?.length) {
        const courseSectionRows = Array.from(allScheduledRows).filter(el => el.classList.contains('child'));
        courseSectionRows.forEach((rowElement) => {
            const course = extractCourseInfoFromRow(rowElement as HTMLElement);
            if (!course) return;
            courses.push(course);
            AppLogger.info('Detected scheduled course:', course.abr, course.id, course.instructor);
            scrapedCount++;
        });
    }
    AppLogger.info(`Schedule table scraping complete. Found ${scrapedCount} courses.`);
}

/**
 * Scrapes course data from the planner/cart table.
 * @param {Element} plannerTableElement - The HTML element of the planner/cart table.
 */
export async function scrapePlanner(plannerTableElement: Element): Promise<void> {
    AppLogger.info('Scraping planner/cart table...');
    planner_courses.length = 0; // Clear previous planner courses
    let scrapedCount = 0;
    try {
        const classRows = await waitForRows(plannerTableElement as HTMLTableElement, 2); // Expect at least header + child or two child rows
        const filteredClassDetailRows = Array.from(classRows).filter(el => el.classList.contains('child'));
        for (const classDetailRow of filteredClassDetailRows) {
            const course = extractPlannerCourseInfo(classDetailRow);
            planner_courses.push(course);
            AppLogger.info('Detected planner course:', course.abr, course.instructor);
            scrapedCount++;
            const courseElements = await getCourseAndProfessorDetails(course);
            const extRow = ensureExtensionCell(classDetailRow);
            addCourseInfoCell(classDetailRow.previousElementSibling, course);
            appendExtensionData(extRow, courseElements.gradeElement, courseElements.professorElement);
        }
        AppLogger.info(`Planner/cart scraping complete. Found ${scrapedCount} courses.`);
    } catch (error) {
        AppLogger.error('Error scraping planner/cart table or waiting for rows:', error);
    }
    await applyIframeStyles(plannerTableElement as HTMLTableElement);
}

// --- Style Helpers ---

/** Applies necessary styles to the iframe content for better display of extension data. */
export async function applyIframeStyles(plannerTableElement: HTMLTableElement): Promise<void> {
    AppLogger.info('Applying iframe styles...');
    const iframe = document.querySelector('[id$="divPSPAGECONTAINER"] iframe') as HTMLIFrameElement | null;
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
        const style = iframeDoc.createElement('style');
        style.textContent = `
    .ui-dialog.cust-ui-dialog {
      position: fixed !important;
      top: 10vh !important;
      left: 50% !important;
      transform: translateX(-50%);
      max-height: 85vh !important;
      width: 90vw !important;
      max-width: 1400px !important;
      overflow: auto;
    }
    td.mypack-extension-cell{
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(260px,1fr));
    gap: .75rem;
    padding: 0;
    width: 100%;
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
  min-height: 0 !important;
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
        if (dialog_parent) {
            Object.assign((dialog_parent as HTMLElement).style, {
                width: '90vw',
                maxWidth: '1400px',
                left: '50%',
                transform: 'translateX(-50%)',
                overflowX: 'visible',
                position: 'relative',
            });
        }
        if (dialog_inner) {
            Object.assign((dialog_inner as HTMLElement).style, {
                width: '90vw',
                maxWidth: '1400px',
                left: '50%',
                transform: 'translateX(-50%)',
                overflowX: 'visible'
            });
            await applyFlexDialogLayout(dialog_parent as HTMLElement, dialog_inner as HTMLElement);
        }
    }
}

/** Makes the dialog a vertical flex container and sticks the button pane to the bottom. */
async function applyFlexDialogLayout(parent_dialog: HTMLElement, inner_dialog: HTMLElement): Promise<void> {
    const dlg = document.querySelector('.ui-dialog.cust-ui-dialog');
    if (dlg) {
        new MutationObserver(muts => AppLogger.info('Dialog mutations observed:', muts))
            .observe(dlg, {attributes: true, attributeFilter: ['style']});
    }
    const titleBar = parent_dialog.querySelector('.ui-dialog-titlebar') as HTMLElement | null;
    const buttonPane = parent_dialog.querySelector('.ui-dialog-buttonpane') as HTMLElement | null;
    parent_dialog.style.setProperty('display', 'flex', 'important');
    parent_dialog.style.setProperty('flex-direction', 'column', 'important');
    parent_dialog.style.setProperty('height', parent_dialog.style.height || getComputedStyle(parent_dialog).height, 'important');
    parent_dialog.style.setProperty('maxHeight', parent_dialog.style.maxHeight || getComputedStyle(parent_dialog).maxHeight, 'important');
    parent_dialog.style.setProperty('overflow', 'hidden', 'important');
    inner_dialog.style.setProperty('overflowY', 'auto', 'important');
    inner_dialog.style.setProperty('overflowX', 'hidden', 'important');
    inner_dialog.style.setProperty('flexGrow', '1', 'important');
    inner_dialog.style.setProperty('flexShrink', '1', 'important');
    inner_dialog.style.setProperty('height', 'auto', 'important');
    inner_dialog.style.setProperty('maxHeight', 'none', 'important');
    if (titleBar) {
        titleBar.style.setProperty('flexShrink', '0', 'important');
    }
    if (buttonPane) {
        buttonPane.style.setProperty('position', 'static', 'important');
        buttonPane.style.setProperty('flex-shrink', '0', 'important');
        buttonPane.style.setProperty('margin-top', 'auto', 'important');
    }
    AppLogger.info('Dialog layout updated!');
}

/**
 * Creates a debounced function for scraping the planner.
 * @param {Function} scrapePlanner - The function to debounce.
 * @returns {Function} - The debounced function.
 */
export function debounceScraper(scrapePlanner: (plannerTableElement: Element) => Promise<void>) {
    return debounce(async () => {
        AppLogger.info('Planner changes detected, re-scraping planner...');
        try {
            const plannerElement = await waitForCart();
            await scrapePlanner(plannerElement);
        } catch (error) {
            AppLogger.error('Error during debounced planner scrape:', error);
        }
    }, 100);
}

export const debouncedScrapePlanner = debounceScraper(scrapePlanner);

