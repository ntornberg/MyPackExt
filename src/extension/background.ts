import {AppLogger} from "../core/utils/logger";

// Service worker state tracking
let isListenerRegistered = false;

/**
 * Setup message listener with duplicate prevention
 */
function setupMessageListener() {
  // Prevent duplicate listeners
  if (isListenerRegistered) {
    AppLogger.info('[Background] Message listener already registered, skipping');
    return;
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    AppLogger.info('[Background] Received message:', message);
    
    if (message.type === "fetchData") {
      AppLogger.info('[Background] Fetching URL:', message.url, 'with formData:', message.formData);
      
      // Handle the fetch request
      fetch(message.url, { 
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }, 
        body: message.formData 
      })
      .then(async res => {
        let data = null;
        try {
          data = await res.text();
          AppLogger.info(`[Background] Fetch response text for course:`, data);
        } catch (err) {
          AppLogger.error('[Background] Error reading response text:', err);
        }
        sendResponse({ success: true, data });
      })
      .catch(err => {
        AppLogger.error('[Background] Fetch error:', err);
        sendResponse({ success: false, error: err.toString() });
      });
      
      return true; // Keep message channel open for async response
    }
    
    // Handle ping messages for connection testing
    if (message.type === "ping") {
      sendResponse({ type: "pong", timestamp: Date.now() });
      return false;
    }
  });
  
  isListenerRegistered = true;
  AppLogger.info('[Background] Message listener registered successfully');
}

/**
 * Initialize service worker on startup/restart
 */
function initializeServiceWorker() {
  AppLogger.info('[Background] Initializing service worker...');
  
  // Setup message listener
  setupMessageListener();
  
  AppLogger.info('[Background] Service worker initialization complete');
}

/**
 * Handle service worker install event
 */
chrome.runtime.onInstalled.addListener((details) => {
  AppLogger.info('[Background] Extension installed/updated:', details.reason);
  initializeServiceWorker();
});

/**
 * Handle service worker startup
 */
chrome.runtime.onStartup.addListener(() => {
  AppLogger.info('[Background] Service worker startup event');
  initializeServiceWorker();
});

// Initialize immediately
initializeServiceWorker();