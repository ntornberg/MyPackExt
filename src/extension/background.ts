import { trackExtensionInstalled } from "../analytics/gaBackground";
import { clearAllExtensionCaches } from "../course-management/cache/courseRetrieval";
import {
  fetchStatusWorkerStatusDirect,
  isStatusWorkerFetchMessage,
} from "../user-experience/status/statusWorker";
import { AppLogger } from "../utils/logger";

let isListenerRegistered = false;

function setupMessageListener() {
  if (isListenerRegistered) {
    AppLogger.info(
      "[Background] Message listener already registered, skipping",
    );
    return;
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    AppLogger.info("[Background] Received message:", message);

    if (message.type === "fetchData") {
      AppLogger.info(
        "[Background] Fetching URL:",
        message.url,
        "with formData:",
        message.formData,
      );

      fetch(message.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: message.formData,
      })
        .then(async (res) => {
          const data = await res.text();
          AppLogger.info(`[Background] Fetch response text for course:`, data);
          sendResponse({ success: true, data });
        })
        .catch((err) => {
          AppLogger.error("[Background] Fetch error:", err);
          sendResponse({ success: false, error: err.toString() });
        });

      return true;
    }

    if (isStatusWorkerFetchMessage(message)) {
      fetchStatusWorkerStatusDirect()
        .then((status) => {
          sendResponse({ success: true, status });
        })
        .catch((error) => {
          AppLogger.error("[Status] Failed to fetch worker status:", error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        });

      return true;
    }

    if (message.type === "ping") {
      sendResponse({ type: "pong", timestamp: Date.now() });
      return false;
    }
  });

  isListenerRegistered = true;
  AppLogger.info("[Background] Message listener registered successfully");
}

function initializeServiceWorker() {
  AppLogger.info("[Background] Initializing service worker...");
  setupMessageListener();
  AppLogger.info("[Background] Service worker initialization complete");
}

async function handleInstalled(
  details: chrome.runtime.InstalledDetails,
): Promise<void> {
  AppLogger.info("[Background] Extension installed/updated:", details.reason);
  if (details.reason === "install") {
    void trackExtensionInstalled();
  }
  if (details.reason === "update") {
    AppLogger.info("[Background] Extension updated; clearing local caches");
    await clearAllExtensionCaches();
  }
  initializeServiceWorker();
}

chrome.runtime.onInstalled.addListener((details) => {
  void handleInstalled(details);
});

chrome.runtime.onStartup.addListener(() => {
  AppLogger.info("[Background] Service worker startup event");
  initializeServiceWorker();
});

initializeServiceWorker();
