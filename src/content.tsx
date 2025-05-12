import React from 'react';
import {createRoot} from 'react-dom/client';

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

// --- React Component ---
/*const App: React.FC = () => {
    return (
        <div style={{ padding: '1rem' }}>
            <h2>📚 MyPack Enhancer</h2>
            <p>React injected into MyPack via Chrome Extension!</p>
        </div>
    );
};*/

// --- Sidebar Injection ---
/*const mount = document.createElement('div');
mount.id = 'mypack-sidebar';
Object.assign(mount.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '300px',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: '999999',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
});
document.body.appendChild(mount);
const root = createRoot(mount);
root.render(<App />);
AppLogger.info("MyPack Enhancer sidebar injected.");*/

// --- Course Data Structure ---
type Course = {
    title: string;
    id: string;
    abr: string;
    instructor: string;
}
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

const GradeCard: React.FC<GradeData> = (data) => (
    <div style={{
        maxWidth: '400px',
        margin: '0.5rem',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 99999,
        position: 'relative'
    }}>
        <h3>{data.courseName} - {data.subject}</h3>
        <p><strong>Instructor:</strong> {data.instructorName}</p>
        <p>A Avg: {data.aAverage}%</p>
        <p>B Avg: {data.bAverage}%</p>
        <p>C Avg: {data.cAverage}%</p>
        <p>D Avg: {data.dAverage}%</p>
        <p>F Avg: {data.fAverage}%</p>
        <p style={{ color: 'gray' }}>
            Class Avg Range: {data.classAverageMin}% – {data.classAverageMax}%
        </p>
    </div>
);
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
        observer.observe(document.documentElement, { childList: true, subtree: true });
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
        observer.observe(targetNodeToObserve, { childList: true, subtree: true });
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
        observer.observe(tbody, { childList: true });
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
/**
 * Sets up a MutationObserver to watch for changes in the planner/cart container.
 * When changes occur, it triggers a debounced scraping of the planner table.
 */
/*async function observer_planner_changes(): Promise<void> {
    const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe');
    const iframeDoc = iframe?.contentDocument;
    if (!iframeDoc) {
        AppLogger.warn("observer_planner_changes: Iframe document not found. Cannot observe planner changes.");
        return;
    }
    const plannerParentContainer = iframeDoc.querySelector('#enroll-wizard-container');
    if (!plannerParentContainer) {
        AppLogger.warn("observer_planner_changes: Planner container (#enroll-wizard-container) not found. Cannot observe planner changes.");
        return;
    }
    console.log(plannerParentContainer);
    let mutationRelevant = false;
    let mutationQueued = false;
    const plannerObserver = new MutationObserver((mutationsList) => {

        for (const m of mutationsList) {
            if (m.addedNodes.length > 0 || m.removedNodes.length > 0) {
                mutationRelevant = true;
                const isInternal = Array.from(m.addedNodes).concat(Array.from(m.removedNodes)).some(node =>
                    node instanceof HTMLElement &&
                    (node.id === "mypack-extension-data" || node.closest?.("#mypack-extension-data"))
                );
                if (isInternal) {
                    AppLogger.info("Skipped internal mutation from extension content.");
                    return;
                }
                for (const node of m.addedNodes) {
                    console.log("Added node:", node);
                }
            }
        }
        if (mutationRelevant) {
            AppLogger.info("External DOM mutation detected (added/removed node). Re-scraping...");
            console.log("Changes: ", mutationsList);
            AppLogger.info("Planner changes detected, re-scraping planner...");
            if (!mutationQueued) {
                mutationQueued = true;
                setTimeout(() => {
                    mutationQueued = false;
                    debouncedScrapePlanner();
                }, 0);
            }
        }
    });



    plannerObserver.observe(plannerParentContainer, { childList: true, subtree: true ,  attributes: false,
        characterData: false });
    AppLogger.info("Observer for planner/cart changes is now active.");
}*/

// --- Main Execution Block ---
(async () => {
    try {
        const scheduleElement = await waitForScheduleTable();
        scrapeScheduleTable(scheduleElement);
        const initialIframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe');
        if(initialIframe) {
            console.log(initialIframe);
            const initialIframeDoc = initialIframe.contentDocument;
            if (!initialIframeDoc) {
                AppLogger.warn("Initial iframe document not found. Cannot set up event listener for button clicks.");
                return;
            }
            initialIframeDoc.addEventListener("click", function (event) {
                const target = event.target;
                console.log(target);
                if(!target) return;
                let buttonSpan = (target as HTMLElement).closest('[class^="showClassSectionsLink"]');
                console.log(buttonSpan);
                if(!buttonSpan){
                    buttonSpan = (target as HTMLElement).closest('[class^=" control center"]');
                    if(buttonSpan){
                        debouncedScrapePlanner();
                        console.log("Button clicked:", buttonSpan.textContent);
                    }
                }
                if(!buttonSpan) return;
                if (buttonSpan.role === "button") {
                    console.log("Button clicked:", buttonSpan.textContent);
                    console.log(target);
                    debouncedScrapePlanner();
                }
            });
        }else{
            AppLogger.warn("Initial iframe not found. Cannot set up event listener for button clicks.");
        }
        //const plannerElement = await waitForCart();
        AppLogger.info("Initial planner element found, performing first scrape.");
        //await observer_planner_changes(); // Set up observer for subsequent changes

    } catch (error) {
        AppLogger.error("An error occurred during the main execution block:", error);
    }
})();

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
        const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe');
        if (iframe) { // Expand to allow content to fit
            const dialogElement = iframe.querySelector('[role="dialog"]');
            if (dialogElement) {

                (dialogElement as HTMLElement).style.width = "auto";
                (dialogElement as HTMLElement).style.maxWidth = "none";
                (dialogElement as HTMLElement).style.overflowX = "visible";
            }
        }
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
            const detailsElement = await getCourseDetails(scrapedPlannerCourse);
            if(detailsElement.textContent === "No grade data available."){
                continue;
            }
            const tableCell = document.createElement("td");
            tableCell.colSpan = 8;
            tableCell.appendChild(detailsElement);

            const existing = classDetailRow.querySelector("#mypack-extension-data");
            if (!existing) {
                classDetailRow.appendChild(tableCell);
            }
        }
        AppLogger.info(`Planner/cart scraping complete. Found ${scrapedCount} courses.`);

    } catch (error) {
        AppLogger.error("Error scraping planner/cart table or waiting for rows:", error);
    }
}


async function getCourseDetails(course: Course): Promise<HTMLDivElement> {
    console.log("Fetching course details for:", course);
    const wrapper = document.createElement("div");
    wrapper.id = "mypack-extension-data";
    wrapper.style.marginTop = "0.5rem";
    wrapper.style.overflow = "auto";
    wrapper.style.maxWidth = "400px";

    try {
        const url = `https://app-gradefetchbackend.azurewebsites.net/api/FetchGradeData?courseName=${encodeURIComponent(course.abr)}&professorName=${encodeURIComponent(course.instructor)}`;
        const response = await fetch(url);

        if (!response.ok) {
            AppLogger.error("Error fetching course details:", response.status, response.statusText);
            wrapper.textContent = "No grade data available.";
            return wrapper;
        }

        const json = await response.json();
        const root = createRoot(wrapper);

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
