import React from 'react';
import { createRoot } from 'react-dom/client';

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
const App: React.FC = () => {
    return (
        <div style={{ padding: '1rem' }}>
            <h2>📚 MyPack Enhancer</h2>
            <p>React injected into MyPack via Chrome Extension!</p>
        </div>
    );
};

// --- Sidebar Injection ---
const mount = document.createElement('div');
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
AppLogger.info("MyPack Enhancer sidebar injected.");

// --- Course Data Structure ---
type Course = {
    title: string;
    id: string;
    abr: string;
    instructor: string;
}

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

/**
 * Sets up a MutationObserver to watch for changes in the planner/cart container.
 * When changes occur, it triggers a debounced scraping of the planner table.
 */
async function observer_planner_changes(): Promise<void> {
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

    const debouncedScrape = debounce(async () => {
        AppLogger.info("Planner changes detected, re-scraping planner...");
        try {
            const plannerElement = await waitForCart(); // Re-ensure planner table is accessible
            await scrapePlanner(plannerElement);
        } catch (error) {
            AppLogger.error("Error during debounced planner scrape:", error);
        }
    }, 100); // Debounce time of 100ms

    const plannerObserver = new MutationObserver(debouncedScrape);
    plannerObserver.observe(plannerParentContainer, { childList: true, subtree: true });
    AppLogger.info("Observer for planner/cart changes is now active.");
}

// --- Main Execution Block ---
(async () => {
    try {
        const scheduleElement = await waitForScheduleTable();
        scrapeScheduleTable(scheduleElement);

        const plannerElement = await waitForCart();
        AppLogger.info("Initial planner element found, performing first scrape.");
        await scrapePlanner(plannerElement);

        await observer_planner_changes(); // Set up observer for subsequent changes

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

        filteredClassDetailRows.forEach((classDetailRow) => {
            let courseAbbreviation = "N/A";
            let courseInstructor = "N/A";

            const searchResultsInnerTable = classDetailRow.querySelector('[id^="searchResultsInner"]');
            if (!searchResultsInnerTable) return;

            const innerTableBodyRow = searchResultsInnerTable.querySelector('tbody > tr');
            if (!innerTableBodyRow) return;

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
        });
        AppLogger.info(`Planner/cart scraping complete. Found ${scrapedCount} courses.`);

    } catch (error) {
        AppLogger.error("Error scraping planner/cart table or waiting for rows:", error);
    }
}
async function computeHash(courseName: string, professorName: string): Promise<string> {
    const input = courseName + professorName;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data); // Hash as ArrayBuffer


    // Convert first 8 bytes to a single 64-bit unsigned integer (big-endian)
    const view = new DataView(hashBuffer);
    const uniqueHash = view.getBigUint64(0, false); // false = big-endian like C#

    return uniqueHash.toString();
}

async function getCourseDetails(course: Course): Promise<void> {
    const uniqueCourseHash = await computeHash(course.abr, course.instructor);
}

/* --- Commented Out Code Block (Original - Kept for reference) --- */
/*type CourseInfo = {
    courseID : string;
}*/
/*let userId : string;
const cookieObserver = new MutationObserver(() => {
    chrome.runtime.sendMessage({ type: "GET_COOKIES" }, (cookies) => {
        if (chrome.runtime.lastError) {
            AppLogger.error("Message failed:", chrome.runtime.lastError.message); // Using new logger
            return;
        }
        const targetCookie = cookies.find((cookie: any) => cookie.name === 'PS_LOGINLIST');
        if (targetCookie) {
            AppLogger.info(targetCookie.value); // Using new logger
            userId = targetCookie.value.substring(targetCookie.value.lastIndexOf("/") + 1);
        }else{
            AppLogger.warn("Failed To find Cookie"); // Using new logger
        }
    });
});*/
/*cookieObserver.observe(document.body, {childList: true, subtree: true});*/

/*function form_url(userId: string, courseId :string) : string{
    const base = "https://portalsp.acs.ncsu.edu/psc/" + userId;
    return base + "/EMPLOYEE/NCSIS/s/WEBLIB_ENROLL.ISCRIPT1.FieldFormula.IScript_getClassSearchResults?crseId=" + courseId;
}*/

/*const GetCourseDetails: React.FC<CourseInfo> = ({courseID}) =>{
const [data,setData] = useState<any>(null);
    useEffect(() => {
        fetch('')
    }, []);
}*/