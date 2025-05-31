import { AppLogger } from "./utils/logger";

// Service worker state tracking
let isListenerRegistered = false;
let keepAlivePort: chrome.runtime.Port | null = null;

/**
 * Robust keep-alive strategy using Chrome alarms API
 * This survives service worker restarts unlike setInterval
 */
function setupKeepAlive() {
  // Create a persistent alarm that survives service worker restarts
  chrome.alarms.create('keepAlive', { 
    periodInMinutes: 0.5 // Every 30 seconds
  });
  
  // Listen for alarm events
  if (!chrome.alarms.onAlarm.hasListeners()) {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'keepAlive') {
        AppLogger.info('[Background] Keep-alive alarm fired - service worker active');
        // Perform a lightweight operation to maintain activity
        chrome.runtime.getPlatformInfo(() => {
          // This callback keeps the service worker context alive
        });
      }
    });
  }
}

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
 * Setup port connection for real-time communication
 */
function setupPortConnection() {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "keepAlive") {
      keepAlivePort = port;
      AppLogger.info('[Background] Keep-alive port connected');
      
      port.onDisconnect.addListener(() => {
        keepAlivePort = null;
        AppLogger.info('[Background] Keep-alive port disconnected');
      });
      
      port.onMessage.addListener((message) => {
        if (message.type === "heartbeat") {
          port.postMessage({ type: "heartbeatResponse", timestamp: Date.now() });
        }
      });
    }
  });
}

/**
 * Initialize service worker on startup/restart
 */
function initializeServiceWorker() {
  AppLogger.info('[Background] Initializing service worker...');
  
  // Setup all listeners and keep-alive mechanisms
  setupMessageListener();
  setupKeepAlive();
  setupPortConnection();
  
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

// Export for debugging
if (typeof globalThis !== 'undefined') {
  (globalThis as any).debugServiceWorker = {
    isListenerRegistered,
    keepAlivePort: () => keepAlivePort,
    restartServiceWorker: initializeServiceWorker,
    checkAlarms: () => chrome.alarms.getAll(),
  };
}