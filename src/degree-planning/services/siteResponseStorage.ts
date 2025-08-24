import { AppLogger } from "../../utils/logger.ts";
import {
  generateCacheKey,
  setGenericCache,
} from "../../course-management/cache/CourseRetrieval";

/**
 * Listens for messages posted from the hook script injected into page/iframes and
 * persists relevant class data in cache categories for later display.
 */
export async function setupListener() {
  // Signal readiness within the same frame to avoid cross-origin top access
  window.postMessage({ type: "RECEIVER_READY", source: "content-script" }, "*");
  window.addEventListener("message", async (event) => {
    if (event.data?.source !== "realFetchHook") return;
    AppLogger.info("Received message from page:", event.data, event);

    const { type, payload } = event.data;
    if (type === "CLASS_DATA") {
      for (const item of payload.data) {
        if (payload.responseType == "_getScheduleTableData") {
          const hash = await generateCacheKey(item.crse_id);
          await setGenericCache("scheduleTableData", { [hash]: item });
        }
        if (payload.responseType == "_getShopCartTableData") {
          const hash = await generateCacheKey(item.crse_id);
          await setGenericCache("shopCartTableData", { [hash]: item });
        }
        if (payload.responseType == "_getPlanTermTableData") {
          const hash = await generateCacheKey(item.crse_id);
          await setGenericCache("planTermTableData", { [hash]: item });
        }
        if (payload.responseType == "_getShopCartCalEvents") {
          const hash = await generateCacheKey(item.class_nbr);
          await setGenericCache("shopCartCalEventsData", { [hash]: item });
        }
        if (payload.responseType == "_getScheduleCalEvents") {
          const hash = await generateCacheKey(item.class_nbr);
          await setGenericCache("scheduleCalEventsData", { [hash]: item });
        }
      }
    }
  });
}
