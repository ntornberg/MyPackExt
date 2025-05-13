import {waitForCart, waitForScheduleTable} from "./utils/dom.ts";

declare global {
    interface Window {
        __savedDefine?: any;
    }
}

const __psDefine = window.__savedDefine;      // pull from global
delete window.__savedDefine;


import {AppLogger} from "./utils/logger.ts";
import {scrapePlanner, scrapeScheduleTable} from "./services/scraper.ts";
import {debounce} from "./utils/common.ts";// Stores courses from the main schedule table// Stores courses from the planner/cart

AppLogger.info("MyPack Enhancer script started.");


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

        AppLogger.info("Initial planner element found, performing first scrape.");


    } catch (error) {
        AppLogger.error("An error occurred during the main execution block:", error);
    }
})();

if (__psDefine) {
    Object.defineProperty(window, 'define', {   // hand the loader back
        value: __psDefine,
        configurable: true
    });
}










