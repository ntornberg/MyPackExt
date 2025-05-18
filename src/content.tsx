import {waitForCart, waitForScheduleTable, ensureOverlayContainer} from "./utils/dom.ts";
import { createRoot } from 'react-dom/client';

declare global {
    interface Window {
        __savedDefine?: any;
        __mypackEnhancerInitialized?: boolean;
    }
}

const __psDefine = window.__savedDefine;      // pull from global
delete window.__savedDefine;


import {AppLogger} from "./utils/logger.ts";
import {scrapePlanner, scrapeScheduleTable} from "./services/scraper.ts";
import {debounce} from "./utils/common.ts";
import {setupListener} from "./services/siteResponseStorage.ts";
import SlideOutDrawer from "./components/MainPopupCard.tsx";
// Stores courses from the main schedule table// Stores courses from the planner/cart




AppLogger.info("MyPack Enhancer script started.");

import createCache from '@emotion/cache';
import { CacheProvider } from "@emotion/react";

export function createEmotionCache() {
    // Target a specific element in the host's <head> that appears AFTER their main CSS.
    // Using the ID of a link tag visible in your screenshot as an example insertion point.
    const insertionPoint = document.querySelector('#PTGP_HOME_TILE_FL_1_CSS');
  
    const emotionCache = createCache({
      key: 'mui-styles', // Keep your unique key
  
      // --- Use insertionPoint to inject styles immediately AFTER the selected element ---
      insertionPoint: insertionPoint as HTMLElement | undefined,
      // --------------------------------------------------------------------------------
  
      // Remove or comment out the prepend line
      // prepend: false,
    });
  
    // Optional: Add a warning if the insertion point is not found
    if (!insertionPoint) {
        console.warn("Emotion insertion point (#PTGP_HOME_TILE_FL_1_CSS) not found in <head>. Styles may not be injected in the desired location.");
    }
  
    return emotionCache;
  }
const myEmotionCache = createEmotionCache();
function debounceScraper(scrapePlanner: (plannerTableElement: Element) => Promise<void>) {
    // Debounce time of 100ms
    return debounce(async () => {
        AppLogger.info("Planner changes detected, re-scraping planner...");
        try {
            const plannerElement = await waitForCart(); // Re-ensure planner table is accessible
            AppLogger.info(plannerElement);
            await scrapePlanner(plannerElement);
        } catch (error) {
            AppLogger.error("Error during debounced planner scrape:", error);
        }
    }, 100);
}

const debouncedScrapePlanner = debounceScraper(scrapePlanner);


function injectXHRHookScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("realFetchHook.js");
    script.onload = () => script.remove(); // Clean up
    (document.head || document.documentElement).appendChild(script);
}

// Inject immediately
injectXHRHookScript();

// Also inject into dynamic iframes
const observer = new MutationObserver(() => {
    document.querySelectorAll("iframe").forEach((iframe) => {
        try {
            //const win = iframe.contentWindow;
            const doc = iframe.contentDocument;
            if (doc && !doc.querySelector('script[data-hooked="true"]')) {
                const script = doc.createElement("script");
                script.src = chrome.runtime.getURL("realFetchHook.js");
                script.setAttribute("data-hooked", "true");  // Prevent future injections
                script.onload = () => script.remove();
                doc.documentElement.appendChild(script);
            }
        } catch (err) {
            // Ignore cross-origin access issues silently
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// --- Main Execution Block ---
(async () => {
    try {
        if (window.__mypackEnhancerInitialized) {
            console.warn("MyPack Enhancer already initialized. Skipping...");
            return;
        }
        window.__mypackEnhancerInitialized = true;
        AppLogger.info("Initializing MyPack Drawer");
        // 1. Ensure the container element exists in the DOM
                const overlayElement = ensureOverlayContainer();
        // 2. Create the React root for that container
        const root = createRoot(overlayElement);

        // 3. Render your root component (<SlideOutDrawer />) wrapped with CacheProvider
        // SlideOutDrawer itself should contain your AppTheme/ThemeProvider inside it,
        // like shown in the previous corrected code for SlideOutDrawer.
        root.render(
            <CacheProvider value={myEmotionCache}>
                <SlideOutDrawer />
            </CacheProvider>
        );
        const scheduleElement = await waitForScheduleTable();
        scrapeScheduleTable(scheduleElement);
        const initialIframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe');
        await setupListener();
        if (initialIframe) {
            const initialIframeDoc = initialIframe.contentDocument;
            if (!initialIframeDoc) {
                AppLogger.warn("Initial iframe document not found. Cannot set up event listener for button clicks.");
                return;
            }
            initialIframeDoc.addEventListener("click", function (event) {
                const target = event.target;
                if (!target) return;
                let buttonSpan = (target as HTMLElement).closest('[class^="showClassSectionsLink"]');
                if (!buttonSpan) {
                    buttonSpan = (target as HTMLElement).closest('[class^=" control center"]');
                    if (buttonSpan) {
                        debouncedScrapePlanner();
                        AppLogger.info("Button clicked:", buttonSpan.textContent);
                    }
                }
                if (!buttonSpan) return;
                if (buttonSpan.role === "button") {
                    AppLogger.info("Button clicked:", buttonSpan.textContent);
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