import { AppLogger } from "./utils/logger";

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    AppLogger.info('[background] Received message:', message);
    if (message.type === "fetchData") {
        AppLogger.info('[background] Fetching URL:', message.url, 'with formData:', message.formData);
        
        fetch(message.url, { method: "POST",headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }, body: message.formData })
            .then(async res => {
              
               
                let data = null;
                try {
                    data = await res.text();
                    AppLogger.info(`[background] Fetch response text for course:`, { course_abr: message.course.course_abr, course_id: message.course.catalog_num, data });
                } catch (err) {
                    AppLogger.error('[background] Error reading response text:', err);
                }
                sendResponse(data);
            })
            .catch(err => {
                AppLogger.error('[background] Fetch error:', err);
                sendResponse({ error: err.toString() });
            });
        return true; // Needed to use sendResponse asynchronously
    }
});