import { AppLogger } from './logger';

/**
 * Creates a shadow DOM host element with a container div inside.
 * @param {string} id - The ID to assign to the host element.
 * @returns {Object} - An object containing the host element and container element.
 */
export function createShadowHost(id: string): { host: HTMLDivElement, container: HTMLDivElement } {
    const host = document.createElement("div");
    host.id = id;

    const shadow = host.attachShadow({mode: "open"});
    const container = document.createElement("div");
    shadow.appendChild(container);

    return {host, container};
}

/**
 * Ensures that an extension cell exists in the given row, creating one if necessary.
 * @param {HTMLTableRowElement} row - The table row where the cell should be added.
 * @returns {HTMLTableCellElement} - The extension cell.
 */
export function ensureExtensionCell(row: HTMLTableRowElement): HTMLTableCellElement {
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
 * Waits for the schedule table ('#scheduleTable') within the MyPack iframe.
 * @returns {Promise<Element>} A promise that resolves with the '#scheduleTable' element.
 */
export function waitForScheduleTable(): Promise<Element> {
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
                AppLogger.info(table);
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
export function waitForCart(): Promise<Element> {
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
export function waitForRows(table: HTMLTableElement, minRows = 2): Promise<NodeListOf<HTMLTableRowElement>> {
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
