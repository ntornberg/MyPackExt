import {AppLogger} from '../utils/logger';
import type {Course} from '../types';
import {waitForCart, waitForRows} from '../utils/dom';
import {getCourseAndProfessorDetails} from './api';
import {ensureExtensionCell} from '../utils/dom';
import {debounce} from '../utils/common';

// Arrays to store course data
export const courses: Course[] = []; // Stores courses from the main schedule table
export const planner_courses: Course[] = []; // Stores courses from the planner/cart

/**
 * Scrapes course data from the main schedule table.
 * @param {Element} scheduleTableElement - The HTML element of the schedule table.
 */
export function scrapeScheduleTable(scheduleTableElement: Element): void {
    AppLogger.info("Scraping schedule table...");
    //const courseDetailSpans = scheduleTableElement.querySelectorAll('span.showCourseDetailsLink');
    const allScheduledRows = scheduleTableElement.querySelectorAll('tbody > tr');
    let scrapedCount = 0;
    console.log(allScheduledRows);
    if (allScheduledRows?.length) {
        const courseSectionRows = Array.from(allScheduledRows).filter(el => el.classList.contains("child"));

        courseSectionRows.forEach((rowElement) => {
            const htmlRowElement = rowElement as HTMLElement;
            const innerTable = htmlRowElement.querySelector('[id^="scheduleInner_"]');
            if (!innerTable) return;

            const classDataRow = innerTable.querySelector('tbody > tr');
            if (!classDataRow) return;

            const classDataCells = classDataRow.querySelectorAll('td');
            let courseTitle = "", courseIdNum = "", courseAbbreviation = "", courseInstructor = "";

            classDataCells.forEach((cell) => {
                if ((cell as HTMLElement).className === 'sect') {
                    const sectionDetailsContainer = cell.querySelector('[id^="section_details"]');
                    if (!sectionDetailsContainer) return;
                    const detailDivs = sectionDetailsContainer.querySelectorAll('div');
                    if (detailDivs.length > 9) {
                        courseTitle = detailDivs[0]?.textContent?.trim() ?? "";
                        courseIdNum = detailDivs[2]?.querySelector('.classDetailValue')?.textContent?.trim() ?? "";
                        courseInstructor = detailDivs[9]?.querySelector('.classDetailValue')?.textContent?.trim() ?? "Staff";
                    }
                }
            });

            if (!courseTitle || !courseIdNum) return;

            courseAbbreviation = courseTitle.trim().split(/\s-\s/)[0];
            const scrapedCourse: Course = {
                title: courseTitle, id: courseIdNum, abr: courseAbbreviation, instructor: courseInstructor,
            };
            courses.push(scrapedCourse);
            AppLogger.info("Detected scheduled course:", scrapedCourse.abr, scrapedCourse.id, scrapedCourse.instructor);
            scrapedCount++;
        });
    }
    AppLogger.info(`Schedule table scraping complete. Found ${scrapedCount} courses.`);

    // Optional: Log details from courseDetailSpans if needed, kept minimal for now
    // if (courseDetailSpans) {
    //     AppLogger.info(`Found ${courseDetailSpans.length} 'showCourseDetailsLink' spans with metadata.`);
    // }
}

/**
 * Scrapes course data from the planner/cart table.
 * @param {Element} plannerTableElement - The HTML element of the planner/cart table.
 */
export async function scrapePlanner(plannerTableElement: Element): Promise<void> {
    AppLogger.info("Scraping planner/cart table...");
    planner_courses.length = 0; // Clear previous planner courses
    let scrapedCount = 0;

    try {
        const classRows = await waitForRows(plannerTableElement as HTMLTableElement, 2); // Expect at least header + child or two child rows
        const filteredClassDetailRows = Array.from(classRows).filter(el => el.classList.contains("child"));

        for (const classDetailRow of filteredClassDetailRows) {
            let courseAbbreviation = "N/A";
            let courseInstructor = "N/A";

            const searchResultsInnerTable = classDetailRow.querySelector('[id^="searchResultsInner"]');
            if (!searchResultsInnerTable) continue;

            const innerTableBodyRow = searchResultsInnerTable.querySelector('tbody > tr');
            if (!innerTableBodyRow) continue;

            courseInstructor = innerTableBodyRow.querySelector('[data-label="INSTRUCTOR"]')?.textContent?.trim() ?? "Staff";

            const courseHeaderRow = classDetailRow.previousElementSibling;
            if (courseHeaderRow) {
                const headerCells = courseHeaderRow.querySelectorAll('td');
                if (headerCells.length > 1) {
                    courseAbbreviation = headerCells[1]?.textContent?.trim() ?? "N/A";
                }
            }

            const scrapedPlannerCourse: Course = {
                abr: courseAbbreviation, instructor: courseInstructor, title: "", id: "", // Title/ID might need more specific scraping if available here
            };

            planner_courses.push(scrapedPlannerCourse);
            AppLogger.info("Detected planner course:", scrapedPlannerCourse.abr, scrapedPlannerCourse.instructor);
            scrapedCount++;
            const courseElements = await getCourseAndProfessorDetails(scrapedPlannerCourse);
            const courseGradeDataElement = courseElements.gradeElement;
            const rateMyProfDataElement = courseElements.professorElement;
            const extRow = ensureExtensionCell(classDetailRow);   // parent row is the <tr class="child">

            if (courseGradeDataElement.textContent !== "No grade data available.") {
                extRow.appendChild(courseGradeDataElement);
            }
            console.log(rateMyProfDataElement);

            if (rateMyProfDataElement.textContent !== "Professor not found.") {
                extRow.appendChild(rateMyProfDataElement);
            }
        }
        AppLogger.info(`Planner/cart scraping complete. Found ${scrapedCount} courses.`);

    } catch (error) {
        AppLogger.error("Error scraping planner/cart table or waiting for rows:", error);
    }

    await applyIframeStyles(plannerTableElement as HTMLTableElement);
}

/**.cust-ui-dialog-content {
 overflow-y: visible !important;
 }
 * Applies necessary styles to the iframe content for better display of extension data.
 */
export async function applyIframeStyles(plannerTableElement: HTMLTableElement): Promise<void> {
    console.log("Planner table element:", plannerTableElement);
    const iframe = document.querySelector('[id$="divPSPAGECONTAINER"] iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentDocument) { // Expand to allow content to fit
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
      width: 90vw !important;   /* grows from 540 px to ~90 % of viewport   */
      max-width: 1400px !important;
      overflow: auto;
    }
    
     td.mypack-extension-cell{
    /* live inside the column, not beyond it */
    position: relative;
    overflow: hidden;             /* <- keeps cards inside */

    /* let CSS Grid do the wrapping */
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(260px,1fr));
    gap: .75rem;
    padding: 0;

    /* make sure the cell takes part in width calcs */
    width: 100%;
    box-sizing: border-box;
  }
     #classSearchTable{
      table-layout: auto !important;   /* abandon the fixed grid */
  }
/* --- every React card ----------------------------------- */
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
        console.log("possible dialog", dialog_parent);
        if (dialog_parent) {
            Object.assign((dialog_parent as HTMLElement).style, {
                width: '90vw',        // <— almost full screen
                maxWidth: '1400px',      // put a ceiling if you like
                left: '50%',         // keep it centred
                transform: 'translateX(-50%)',
                overflowX: 'visible',
                position: 'relative',
            });
        }

        if (dialog_inner) {
            console.log("dialog_inner", dialog_inner);
            Object.assign((dialog_inner as HTMLElement).style, {
                width: '90vw',        // <— almost full screen
                maxWidth: '1400px',      // put a ceiling if you like
                left: '50%',         // keep it centred
                transform: 'translateX(-50%)',
                overflowX: 'visible'
            });

            await applyFlexDialogLayout(dialog_parent as HTMLElement, dialog_inner as HTMLElement);
        }
        /*const dialog_ui = document.querySelector('.ui-dialog');
        if(dialog_ui){
            const buttonPane = dialog_ui.querySelector('.ui-dialog-buttonpane');
            if(buttonPane){
                dialog_ui.appendChild(buttonPane);
            }

        }*/

    }
}





// Main function
async function applyFlexDialogLayout(parent_dialog: HTMLElement, inner_dialog: HTMLElement): Promise<void> {

    const dlg = document.querySelector('.ui-dialog.cust-ui-dialog');
    if (dlg) {
        new MutationObserver(muts => console.log(muts))
            .observe(dlg, {attributes: true, attributeFilter: ['style']});
    }
    const titleBar = parent_dialog.querySelector('.ui-dialog-titlebar') as HTMLElement | null;
    const buttonPane = parent_dialog.querySelector('.ui-dialog-buttonpane') as HTMLElement | null;
    console.log("dialog", parent_dialog);
    console.log("titleBar", titleBar);
    console.log("buttonPane", buttonPane);
    // Step 1: Make the dialog a vertical flex container
    parent_dialog.style.setProperty('display', 'flex', 'important');
    parent_dialog.style.setProperty('flex-direction', 'column', 'important');
    parent_dialog.style.setProperty('height', parent_dialog.style.height || getComputedStyle(parent_dialog).height, 'important')
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
    // Step 4: Stick the button pane to the bottom

    if(buttonPane){
        buttonPane.style.setProperty('position', 'static', 'important');
        buttonPane.style.setProperty('flex-shrink', '0', 'important');
        buttonPane.style.setProperty('margin-top', 'auto', 'important');
    }

    console.log('Dialog layout updated!');
}

/**
 * Creates a debounced function for scraping the planner.
 * @param {Function} scrapePlanner - The function to debounce.
 * @returns {Function} - The debounced function.
 */
export function debounceScraper(scrapePlanner: (plannerTableElement: Element) => Promise<void>) {
    // Debounce time of 100ms
    return debounce(async () => {
        AppLogger.info("Planner changes detected, re-scraping planner...");
        try {
            const plannerElement = await waitForCart(); // Re-ensure planner table is accessible
            console.log(plannerElement);
            await scrapePlanner(plannerElement);
        } catch (error) {
            AppLogger.error("Error during debounced planner scrape:", error);
        }
    }, 100);
}

export const debouncedScrapePlanner = debounceScraper(scrapePlanner);
