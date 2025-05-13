import React from 'react';
import {PieChart, pieArcLabelClasses} from '@mui/x-charts/PieChart';
import {createRoot} from 'react-dom/client';
declare global {
    interface Window {
        __savedDefine?: any;
    }
}
import {GaugeComponent} from 'react-gauge-component';
const __psDefine = window.__savedDefine;      // pull from global
delete window.__savedDefine;
// --- Logger Utility ---
// Provides a structured way to log messages.
class AppLogger {
    private static prefix = "[MyPackEnhancer]";

    public static info(message?: any, ...optionalParams: any[]): void {
        console.info(`${this.prefix} [INFO] ${new Date().toISOString()}`, message, ...optionalParams);
    }

    public static warn(message?: any, ...optionalParams: any[]): void {
        console.warn(`${this.prefix} [WARN] ${new Date().toISOString()}`, message, ...optionalParams);
    }

    public static error(message?: any, ...optionalParams: any[]): void {
        console.error(`${this.prefix} [ERROR] ${new Date().toISOString()}`, message, ...optionalParams);
    }

    // Debug logs can be added here if needed, but are omitted for now to reduce verbosity.
}

import {useRef, useState, useLayoutEffect} from 'react';

export function useAutoSize(min = 180, aspect = 0.75) {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({w: 0, h: 0});

    useLayoutEffect(() => {
        if (!ref.current) return;
        const obs = new ResizeObserver(([entry]) => {
            const w = Math.max(entry.contentRect.width, min);
            setSize({w, h: w * aspect});      // keep a 4 × 3 feel
        });
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return [ref, size] as const;
}

// --- Course Data Structure ---
type Course = {
    title: string;
    id: string;
    abr: string;
    instructor: string;
}
type MatchedRateMyProf = {
    master_name: string;
    first_name?: string | null;
    last_name?: string | null;
    avgRating?: number | null;
    department?: string | null;
    school?: string | null;
    id?: string | null;
};
type GradeData = {
    courseName: string;
    subject: string;
    instructorName: string;
    aAverage: number;
    bAverage: number;
    cAverage: number;
    dAverage: number;
    fAverage: number;
    classAverageMin: number;
    classAverageMax: number;
};
export const GradeCard: React.FC<GradeData> = (props) => {
    const {
        courseName, instructorName,
        aAverage, bAverage, cAverage, dAverage, fAverage,
        classAverageMin, classAverageMax
    } = props;

    const [wrapRef, {w, h}] = useAutoSize();          // 👈 observe width
    const total = aAverage + bAverage + cAverage + dAverage + fAverage;
    if (!total) return null;                            // skip empty cards

    const colors = ['#2ecc71', '#a3e635', '#facc15', '#f97316', '#ef4444'];

    return (
        <div
            ref={wrapRef}
            style={{
                /* let the flexbox size the card */
                flex: '1 1 200px',   // may shrink down to 200 px
                width: 'auto',
                maxWidth: 420,

                margin: '.5rem',
                padding: '.25rem',
                background: '#fff',
                boxShadow: '0 0 8px rgba(0,0,0,.2)',
                borderRadius: 8,
                fontSize: 14,
            }}
        >
            <h3 style={{margin: '.25rem 0 .5rem'}}>
                Historical grade data for <strong>{courseName}</strong> with:
            </h3>
            <p style={{margin: 0}}>
                <strong>Instructor:</strong> {instructorName}
            </p>

            <PieChart
                width={w}                 // 👈 live width / height
                height={h}
                hideLegend
                series={[{
                    outerRadius: '90%',
                    arcLabelRadius: '50%',
                    paddingAngle: 0,
                    arcLabel: ({id, value}) =>
                        `${id}: ${(value / total * 100).toFixed(0)}%`,
                    arcLabelMinAngle: 15,
                    data: [
                        {id: 'A', value: aAverage, label: 'A', color: colors[0]},
                        {id: 'B', value: bAverage, label: 'B', color: colors[1]},
                        {id: 'C', value: cAverage, label: 'C', color: colors[2]},
                        {id: 'D', value: dAverage, label: 'D', color: colors[3]},
                        {id: 'F', value: fAverage, label: 'F', color: colors[4]},
                    ],
                }]}
                sx={{[`& .${pieArcLabelClasses.root}`]: {fontWeight: 'bold'}}}
            />

            <h4 style={{color: '#666', margin: '.5rem 0 0'}}>
                Class Avg Range:&nbsp;
                <strong>{classAverageMin}% – {classAverageMax}%</strong>
            </h4>
        </div>
    );
};


export const ProfRatingCard: React.FC<MatchedRateMyProf> = ({
                                                                master_name,
                                                                first_name,
                                                                last_name,
                                                                avgRating,
                                                            }) => {
    // fall back to 0.0 when API returns null / undefined
    const rating = parseFloat((avgRating ?? 0.0).toString());

    const displayName =
        `${first_name ?? ''} ${last_name ?? ''}`.trim() || master_name;

    // measure card width so we can scale the gauge
    const [wrapRef, {w}] = useAutoSize();
    const gaugeW = w * 0.9;          // leave a little padding

    return (
        <div
            ref={wrapRef}
            style={{
                /* let the flexbox size the card */
                flex: '1 1 200px',   // may shrink down to 200 px
                width: 'auto',
                maxWidth: 420,

                margin: '.5rem',
                padding: '.25rem',
                background: '#fff',
                boxShadow: '0 0 8px rgba(0,0,0,.2)',
                borderRadius: 8,
                fontSize: 14,
            }}
        >
            <h3 style={{margin: '.25rem 0 .5rem'}}>
                RateMyProfessor&nbsp;Score&nbsp;for:
            </h3>
            <p style={{margin: 0}}>
                <strong>Name:</strong> {displayName}
            </p>

            {/* Gauge scales only through this wrapper’s CSS width */}
            <div style={{width: gaugeW, maxWidth: '100%', margin: '0 auto'}}>
                <GaugeComponent
                    type="semicircle"
                    value={rating}
                    minValue={0}
                    maxValue={5}
                    arc={{
                        width: 0.2,
                        padding: 0.005,
                        cornerRadius: 1,
                        gradient: true,
                        subArcs: [
                            {limit: 1, color: '#B22222', showTick: true},
                            {limit: 2, color: '#FF8C00', showTick: true},
                            {limit: 3, color: '#FFD700', showTick: true},
                            {limit: 4, color: '#9ACD32', showTick: true},
                            {color: '#228B22'},           // final arc (4 → 5)
                        ],
                    }}
                    pointer={{
                        color: '#000000',
                        length: 0.8,
                        width: 15,
                    }}
                    labels={{
                        valueLabel: {hide: true},
                        tickLabels: {
                            type: 'outer',
                            defaultTickValueConfig: {style: {fontSize: 10}},
                            ticks: [{value: 1}, {value: 2}, {value: 3}, {value: 4}],
                        },
                    }}
                />
            </div>

            <p style={{color: '#666', marginTop: '.5rem'}}>
                <strong>Average Rating:</strong> {rating.toFixed(2)} / 5
            </p>
        </div>
    );
};
const courses: Course[] = []; // Stores courses from the main schedule table
const planner_courses: Course[] = []; // Stores courses from the planner/cart

AppLogger.info("MyPack Enhancer script started.");

/**
 * Waits for the schedule table ('#scheduleTable') within the MyPack iframe.
 * @returns {Promise<Element>} A promise that resolves with the '#scheduleTable' element.
 */
function waitForScheduleTable(): Promise<Element> {
    AppLogger.info("Waiting for schedule table (#scheduleTable)...");
    return new Promise(resolve => {
        const findTable = (): Element | null => {
            const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe')?.contentDocument;
            return iframe ? iframe.querySelector('#scheduleTable') : null;
        };

        const existingTable = findTable();
        if (existingTable) {
            AppLogger.info("Schedule table found immediately.");
            return resolve(existingTable);
        }

        const observer = new MutationObserver(() => {
            const table = findTable();
            if (table) {
                console.log(table);
                AppLogger.info("Schedule table found by MutationObserver.");
                observer.disconnect();
                resolve(table);
            }
        });
        observer.observe(document.documentElement, {childList: true, subtree: true});
    });
}

/**
 * Waits for the planner/cart table ('#classSearchTable') within the enroll wizard container in an iframe.
 * @returns {Promise<Element>} A promise that resolves with the '#classSearchTable' element.
 */
function waitForCart(): Promise<Element> {
    AppLogger.info("Waiting for planner/cart table (#classSearchTable)...");
    return new Promise(resolve => {
        const findTable = (): Element | null => {
            const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe')?.contentDocument;
            if (!iframe) return null;
            const plannerParent = iframe.querySelector('#enroll-wizard-container');
            if (!plannerParent) return null;
            return plannerParent.querySelector('#classSearchTable');
        };

        const existingTable = findTable();
        if (existingTable) {
            AppLogger.info("Planner/cart table found immediately.");
            return resolve(existingTable);
        }

        const observer = new MutationObserver(() => {
            const table = findTable();
            if (table) {
                AppLogger.info("Planner/cart table found by MutationObserver.");
                observer.disconnect();
                resolve(table);
            }
        });

        // Determine the most appropriate node to observe.
        // Start with document.documentElement as a fallback.
        let targetNodeToObserve: Node = document.documentElement;
        const initialIframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe');
        if (initialIframe?.contentDocument) {
            const plannerParent = initialIframe.contentDocument.querySelector('#enroll-wizard-container');
            if (plannerParent) {
                targetNodeToObserve = plannerParent; // Observe #enroll-wizard-container if available
            } else {
                targetNodeToObserve = initialIframe.contentDocument; // Observe iframe document if #enroll-wizard-container is not
            }
        }
        observer.observe(targetNodeToObserve, {childList: true, subtree: true});
    });
}

/**
 * Waits for a minimum number of rows to appear in a given table's tbody.
 * @param {HTMLTableElement} table - The table element to observe.
 * @param {number} [minRows=2] - The minimum number of rows to wait for.
 * @returns {Promise<NodeListOf<HTMLTableRowElement>>} A promise that resolves with the NodeList of rows.
 */
function waitForRows(table: HTMLTableElement, minRows = 2): Promise<NodeListOf<HTMLTableRowElement>> {
    return new Promise((resolve, reject) => {
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            AppLogger.warn("waitForRows: Table has no tbody element.", table);
            return reject(new Error("Table does not have a tbody element."));
        }

        let observer: MutationObserver | null = null;
        const checkRows = () => {
            const rows = tbody.querySelectorAll('tr');
            if (rows.length >= minRows) {
                if (observer) observer.disconnect();
                resolve(rows);
                return true;
            }
            return false;
        };

        if (checkRows()) return; // Check immediately

        observer = new MutationObserver(checkRows);
        observer.observe(tbody, {childList: true});
    });
}

/**
 * Creates a debounced version of a function.
 * @param {() => void} fn - The function to debounce.
 * @param {number} [ms=100] - The debounce delay in milliseconds. (Increased from original 20/25 for stability)
 * @returns {() => void} The debounced function.
 */
const debounce = (fn: () => void, ms = 100): () => void => {
    let timeoutId: number;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(fn, ms);
    };
};

function debounceScraper(scrapePlanner: (plannerTableElement: Element) => Promise<void>) {
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

const debouncedScrapePlanner = debounceScraper(scrapePlanner);


// --- Main Execution Block ---
(async () => {
    try {
        const scheduleElement = await waitForScheduleTable();
        scrapeScheduleTable(scheduleElement);
        const initialIframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe');
        if (initialIframe) {
            console.log(initialIframe);
            const initialIframeDoc = initialIframe.contentDocument;
            if (!initialIframeDoc) {
                AppLogger.warn("Initial iframe document not found. Cannot set up event listener for button clicks.");
                return;
            }
            initialIframeDoc.addEventListener("click", function (event) {
                const target = event.target;
                console.log(target);
                if (!target) return;
                let buttonSpan = (target as HTMLElement).closest('[class^="showClassSectionsLink"]');
                console.log(buttonSpan);
                if (!buttonSpan) {
                    buttonSpan = (target as HTMLElement).closest('[class^=" control center"]');
                    if (buttonSpan) {
                        debouncedScrapePlanner();
                        console.log("Button clicked:", buttonSpan.textContent);
                    }
                }
                if (!buttonSpan) return;
                if (buttonSpan.role === "button") {
                    console.log("Button clicked:", buttonSpan.textContent);
                    console.log(target);
                    debouncedScrapePlanner();
                }
            });
        } else {
            AppLogger.warn("Initial iframe not found. Cannot set up event listener for button clicks.");
        }
        //const plannerElement = await waitForCart();
        AppLogger.info("Initial planner element found, performing first scrape.");
        //await observer_planner_changes(); // Set up observer for subsequent changes

    } catch (error) {
        AppLogger.error("An error occurred during the main execution block:", error);
    }
})();

function createShadowHost(id: string): { host: HTMLDivElement, container: HTMLDivElement } {
    const host = document.createElement("div");
    host.id = id;

    const shadow = host.attachShadow({mode: "open"});
    const container = document.createElement("div");
    shadow.appendChild(container);

    return {host, container};
}

/**
 * Scrapes course data from the main schedule table.
 * @param {Element} scheduleTableElement - The HTML element of the schedule table.
 */
function scrapeScheduleTable(scheduleTableElement: Element): void {
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

function ensureExtensionCell(row: HTMLTableRowElement): HTMLTableCellElement {
    // look for a cell we already added
    let cell = row.querySelector<HTMLTableCellElement>('td.mypack-extension-cell');
    if (cell) {
        cell.innerHTML = '';            // clear previous widgets
        return cell;
    }

    // otherwise make a new <td>
    cell = row.ownerDocument!.createElement('td');
    cell.className = 'mypack-extension-cell';
    cell.colSpan = row.cells.length;   // span across the whole inner table

    Object.assign(cell.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
        gap: '.75rem',
        padding: 0,
        whiteSpace: 'normal',
    });

    row.appendChild(cell);              // ←-- same row, so it shows beside the details
    return cell;
}

/**
 * Scrapes course data from the planner/cart table.
 * @param {Element} plannerTableElement - The HTML element of the planner/cart table.
 */
async function scrapePlanner(plannerTableElement: Element): Promise<void> {
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
            const courseGradeDataElement = await getCourseDetails(scrapedPlannerCourse);
            const rateMyProfDataElement = await getProfessorDetails(scrapedPlannerCourse.instructor);
            const extRow = ensureExtensionCell(classDetailRow);   // parent row is the <tr class="child">
            /*const gridCell = extRow.firstElementChild as HTMLTableCellElement;*/
            //gridCell.colSpan = classDetailRow.cells.length;
            /* tableCell.style.position = 'relative';
             tableCell.style.height = '';     // let content define height
             tableCell.style.whiteSpace = 'nowrap';
             tableCell.style.padding = '0';*/

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
    const iframe = document.querySelector('[id$="divPSPAGECONTAINER"] iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentDocument) { // Expand to allow content to fit

        const iframeDoc = iframe.contentDocument;

        const dialogElement = iframeDoc.querySelector('[role="dialog"]');
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
        console.log("possible dialog", dialogElement); //TODO: Might be a little too big and def fucks up the header
        if (dialogElement) {

            /* (dialogElement as HTMLElement).style.width = 'fit-content';
             (dialogElement as HTMLElement).style.maxWidth = 'none';
             (dialogElement as HTMLElement).style.overflowX = "visible";*/
            Object.assign((dialogElement as HTMLElement).style, {
                width: '90vw',        // <— almost full screen
                maxWidth: '1400px',      // put a ceiling if you like
                left: '50%',         // keep it centred
                transform: 'translateX(-50%)',
                overflowX: 'visible'
            });
        }
        const dialog_inner = dialogElement?.querySelector('[id^="dialog"]');
        if (dialog_inner) {

            /* (dialog_inner as HTMLElement).style.width = 'fit-content';
             (dialog_inner as HTMLElement).style.maxWidth = 'none';
             (dialog_inner as HTMLElement).style.overflowX = "visible";*/
            Object.assign((dialog_inner as HTMLElement).style, {
                width: '90vw',        // <— almost full screen
                maxWidth: '1400px',      // put a ceiling if you like
                left: '50%',         // keep it centred
                transform: 'translateX(-50%)',
                overflowX: 'visible'
            });
        }

    }

}


async function getCourseDetails(course: Course): Promise<HTMLDivElement> {
    console.log("Fetching course details for:", course);
    const {host: wrapper, container} = createShadowHost("mypack-extension-data-grade");
    wrapper.style.marginTop = "0.5rem";
    wrapper.style.overflow = 'visible';   // not 'auto'

    wrapper.style.maxWidth = "400px";
    wrapper.style.display = 'inline-block';
    wrapper.style.verticalAlign = 'top';
    try {
        const url = `https://app-gradefetchbackend.azurewebsites.net/api/FetchGradeData?courseName=${encodeURIComponent(course.abr)}&professorName=${encodeURIComponent(course.instructor)}`;
        const response = await fetch(url);

        if (!response.ok) {
            AppLogger.error("Error fetching course details:", response.status, response.statusText);
            wrapper.textContent = "No grade data available.";
            return wrapper;
        }

        const json = await response.json();
        console.log(json);
        const root = createRoot(container);
        const a = parseFloat(json.AAverage ?? "0");
        const b = parseFloat(json.BAverage ?? "0");
        const c = parseFloat(json.CAverage ?? "0");
        const d = parseFloat(json.DAverage ?? "0");
        const f = parseFloat(json.FAverage ?? "0");

        // If all are null or 0, skip rendering
        const total = a + b + c + d + f;
        if (!total || isNaN(total)) {
            AppLogger.info("No valid grade data found. Skipping GradeCard.");
            wrapper.textContent = "No grade data available.";
            return wrapper;
        }
        const gradeData: GradeData = {
            courseName: json.CourseName,
            subject: json.Subject,
            instructorName: json.InstructorName,
            aAverage: parseFloat(json.AAverage ?? "0"),
            bAverage: parseFloat(json.BAverage ?? "0"),
            cAverage: parseFloat(json.CAverage ?? "0"),
            dAverage: parseFloat(json.DAverage ?? "0"),
            fAverage: parseFloat(json.FAverage ?? "0"),
            classAverageMin: json.ClassAverageMin ? parseFloat(json.ClassAverageMin) : 0,
            classAverageMax: json.ClassAverageMax ? parseFloat(json.ClassAverageMax) : 0,
        };

        root.render(<GradeCard {...gradeData} />);
        return wrapper;

    } catch (error) {
        AppLogger.error("Exception while fetching course details:", error);
        wrapper.textContent = "Error loading data.";
        return wrapper;
    }
}

async function getProfessorDetails(profName: string): Promise<HTMLDivElement> {
    console.log("Fetching RateMyProfessor data for: ", profName);
    const wrapper = document.createElement("div");
    wrapper.id = "mypack-extension-data-prof";
    wrapper.style.marginTop = "0.5rem";
    wrapper.style.overflow = 'visible';   // not 'auto'

    wrapper.style.maxWidth = "400px";
    wrapper.style.display = 'inline-block';
    wrapper.style.verticalAlign = 'top';
    try {
        const url = `https://app-gradefetchbackend.azurewebsites.net/api/FetchRateMyProfData?&professorName=${encodeURIComponent(profName)}`;
        const response = await fetch(url);

        if (!response.ok) {
            AppLogger.error("Error fetching professor details.", response.status, response.statusText);
            wrapper.textContent = "Professor not found.";
            return wrapper;
        }
        const json = await response.json();
        const root = createRoot(wrapper);
        console.log(json);
        const profData: MatchedRateMyProf = {
            master_name: json.MasterName,
            first_name: json.FirstName,
            last_name: json.LastName,
            avgRating: parseFloat(json.AvgRating ?? "0"),
            department: json.Department,
            school: json.School,
            id: json.Id,
        }
        root.render(<ProfRatingCard {...profData} />);
        return wrapper;
    } catch (error) {
        AppLogger.error("Exception while fetching course details:", error);
        wrapper.textContent = "Error loading data.";
        return wrapper;
    }
}
if (__psDefine) {
    Object.defineProperty(window, 'define', {   // hand the loader back
        value: __psDefine,
        configurable: true
    });
}
