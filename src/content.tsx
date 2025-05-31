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
import {setupListener} from "./services/PreloadCache/siteResponseStorage.ts";
import SlideOutDrawer from "./components/MainPopupCard.tsx";
// Stores courses from the main schedule table// Stores courses from the planner/cart

AppLogger.info("MyPack Enhancer script started.");

import createCache from '@emotion/cache';
import { CacheProvider } from "@emotion/react";
import FirstStartDialog from "./components/UserGuide/FirstStart.tsx";

// Service worker connection management
let keepAlivePort: chrome.runtime.Port | null = null;
let isServiceWorkerConnected = true;

export function createEmotionCache() {
  
  try {
    return createCache({
      key: 'mypack-css'
      // No insertionPoint, let Emotion handle it automatically
    });
  } catch (error) {
    AppLogger.error("Error creating emotion cache:", error);
    return createCache({
      key: 'mypack-css'
    });
  }
}

export const myEmotionCache = createEmotionCache();
function debounceScraper(scrapePlanner: (plannerTableElement: Element) => Promise<void>) {
    // Debounce time of 100ms
    return debounce(async () => {
        AppLogger.info("Planner changes detected, re-scraping planner...");
        try {
            const plannerElement = await waitForCart(); // Re-ensure planner table is accessible
            await scrapePlanner(plannerElement);
        } catch (error) {
            AppLogger.error("Error during debounced planner scrape:", error);
        }
    }, 100);
}

const debouncedScrapePlanner = debounceScraper(scrapePlanner);

/**
 * Enhanced message sending with retry logic for service worker restarts
 */
async function sendMessageWithRetry(message: any, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      
      // Check if response indicates success
      if (response && response.success !== false) {
        isServiceWorkerConnected = true;
        return response;
      }
      
      // If we get a failed response, don't retry
      if (response && response.success === false) {
        throw new Error(response.error || 'Request failed');
      }
      
    } catch (error) {
      AppLogger.warn(`[Content] Message attempt ${i + 1} failed:`, error);
      isServiceWorkerConnected = false;
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

/**
 * Setup service worker connection monitoring
 */
function setupServiceWorkerMonitoring() {
  // Setup initial keep-alive connection
  setupKeepAliveConnection();
  
  // Periodic health check
  setInterval(async () => {
    try {
      await sendMessageWithRetry({ type: "ping" });
      if (!isServiceWorkerConnected) {
        AppLogger.info('[Content] Service worker connection restored');
        isServiceWorkerConnected = true;
      }
    } catch (error) {
      if (isServiceWorkerConnected) {
        AppLogger.warn('[Content] Service worker connection lost');
        isServiceWorkerConnected = false;
      }
    }
  }, 30000); // Check every 30 seconds
}

/**
 * Setup keep-alive port connection
 */
function setupKeepAliveConnection() {
  try {
    if (keepAlivePort) {
      keepAlivePort.disconnect();
    }
    
    keepAlivePort = chrome.runtime.connect({ name: "keepAlive" });
    
    keepAlivePort.onDisconnect.addListener(() => {
      AppLogger.info('[Content] Keep-alive port disconnected');
      keepAlivePort = null;
      isServiceWorkerConnected = false;
      
      // Try to reconnect after a delay
      setTimeout(setupKeepAliveConnection, 5000);
    });
    
    // Send periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      if (keepAlivePort) {
        try {
          keepAlivePort.postMessage({ type: "heartbeat" });
        } catch (error) {
          clearInterval(heartbeatInterval);
        }
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 25000); // Every 25 seconds
    
  } catch (error) {
    AppLogger.error('[Content] Failed to setup keep-alive connection:', error);
  }
}

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
            console.warn("MyPack Enhancer already initialized. Skipping...");
            return;
        }
       
        window.__mypackEnhancerInitialized = true;
        
        // Setup service worker monitoring first
        setupServiceWorkerMonitoring();
        
        const overlayElement = ensureOverlayContainer();
        const root = createRoot(overlayElement);
        AppLogger.info("Initializing MyPack Drawer");
        // 1. Ensure the container element exists in the DOM
        
        const scheduleElement = await waitForScheduleTable();
        scrapeScheduleTable(scheduleElement);
        chrome.runtime.sendMessage({type:"open_gradient"});
        // 3. Render your root component containing both FirstStartDialog and SlideOutDrawer
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

if (__psDefine) {
    Object.defineProperty(window, 'define', {   // hand the loader back
        value: __psDefine,
        configurable: true
    });
}

// Export enhanced message sending for other modules
(window as any).sendMessageWithRetry = sendMessageWithRetry;