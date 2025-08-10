import {waitForScheduleTable, ensureOverlayContainer} from "./utils/dom.ts";
import { createRoot } from 'react-dom/client';

declare global {
    interface Window {
        __mypackEnhancerInitialized?: boolean;
    }
}

import {AppLogger} from "./utils/logger.ts";
import {scrapeScheduleTable} from "./services/scraper.ts";
import {setupListener} from "./services/PreloadCache/siteResponseStorage.ts";
import SlideOutDrawer from "./components/MainPopupCard.tsx";
import { debouncedScrapePlanner } from "./services/scraper.ts";

AppLogger.info("MyPack Enhancer script started.");

import createCache from '@emotion/cache';
import { CacheProvider } from "@emotion/react";
import FirstStartDialog from "./components/UserGuide/FirstStart.tsx";
// Is this even needed? 
export function createEmotionCache() {
  
  try {
    return createCache({
      key: 'mypack-css'
    });
  } catch (error) {
    AppLogger.error("Error creating emotion cache:", error);
    return createCache({
      key: 'mypack-css'
    });
  }
}

export const myEmotionCache = createEmotionCache();

function injectXHRHookScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("realFetchHook.js");
    script.setAttribute("data-hooked", "true");
    (document.head || document.documentElement).appendChild(script);
}

// Track processed iframes to prevent duplicates
const processedIframes = new WeakSet<HTMLIFrameElement>();

function injectIntoIframe(iframe: HTMLIFrameElement) {
    if (processedIframes.has(iframe)) {
        return;
    }

    try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        if (doc.querySelector('script[data-hooked="true"]')) {
            processedIframes.add(iframe);
            return;
        }

        // Only inject into MyPack-related iframes
        const isMyPackIframe = 
            iframe.src.includes('mypack') || 
            iframe.src.includes('enrollment') ||
            iframe.id.includes('PAGECONTAINER') ||
            doc.location?.href.includes('mypack');

        if (!isMyPackIframe) {
            processedIframes.add(iframe);
            return;
        }

        const script = doc.createElement("script");
        script.src = chrome.runtime.getURL("realFetchHook.js");
        script.setAttribute("data-hooked", "true");
        
        if (doc.readyState === 'loading') {
            doc.addEventListener('DOMContentLoaded', () => {
                doc.documentElement.appendChild(script);
            });
        } else {
            doc.documentElement.appendChild(script);
        }

        processedIframes.add(iframe);
        AppLogger.info('[Hook] Injected into iframe:', iframe.src || iframe.id);

    } catch (err) {
        processedIframes.add(iframe);
    }
}

// Inject into main document
injectXHRHookScript();

// Optimized iframe observer
const iframeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                
                if (element.tagName === 'IFRAME') {
                    const iframe = element as HTMLIFrameElement;
                    setTimeout(() => injectIntoIframe(iframe), 100);
                }
                
                const iframes = element.querySelectorAll('iframe');
                iframes.forEach((iframe) => {
                    setTimeout(() => injectIntoIframe(iframe as HTMLIFrameElement), 100);
                });
            }
        });
    });
});

iframeObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// Process existing iframes on load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('iframe').forEach((iframe) => {
        injectIntoIframe(iframe as HTMLIFrameElement);
    });
});

// --- Main Execution Block ---
(async () => {
    try {
        if (window.__mypackEnhancerInitialized) {
            AppLogger.warn("MyPack Enhancer already initialized. Skipping...");
            return;
        }
        window.__mypackEnhancerInitialized = true;
        
        AppLogger.info("Initializing MyPack Drawer");
        
        // Wait for elements to appear. This is a bit hacky lol
        
        const scheduleElement = await waitForScheduleTable();
        const overlayElement = ensureOverlayContainer();
        const root = createRoot(overlayElement);
        scrapeScheduleTable(scheduleElement);
        
      // Render root component
        root.render(
            <CacheProvider value={myEmotionCache}>
                <FirstStartDialog />
                <SlideOutDrawer />
            </CacheProvider>
        );
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

