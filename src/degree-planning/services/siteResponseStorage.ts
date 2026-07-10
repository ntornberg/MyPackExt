import {
  generateCacheKey,
  setGenericCache,
} from "../../course-management/cache/courseRetrieval";
import { invalidateScheduleCache } from "../../course-management/components/calendar/CalendarView";
import { AppLogger } from "../../utils/logger";

function cacheKeyFromItem(
  item: Record<string, unknown>,
  preferredKeys: string[],
): string {
  for (const key of preferredKeys) {
    const value = item[key];
    if (value != null && String(value).trim()) {
      return String(value);
    }
  }
  return JSON.stringify(item);
}

function compositeCacheKeyFromItem(
  item: Record<string, unknown>,
  preferredKeys: string[],
): string {
  const parts = preferredKeys
    .map((key) => item[key])
    .filter((value) => value != null && String(value).trim())
    .map((value) => String(value).trim());

  return parts.length ? parts.join("|") : JSON.stringify(item);
}

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
      const items = Array.isArray(payload.data)
        ? payload.data
        : payload.data && typeof payload.data === "object"
          ? Object.values(payload.data)
          : [];

      for (const item of items) {
        if (!item || typeof item !== "object") {
          continue;
        }
        const record = item as Record<string, unknown>;
        if (payload.responseType === "_getScheduleTableData") {
          const hash = await generateCacheKey(
            cacheKeyFromItem(record, ["crse_id", "class_nbr", "id"]),
          );
          await setGenericCache("scheduleTableData", { [hash]: item });
          invalidateScheduleCache();
        }
        if (payload.responseType === "_getShopCartTableData") {
          const hash = await generateCacheKey(
            cacheKeyFromItem(record, ["crse_id", "class_nbr", "id"]),
          );
          await setGenericCache("shopCartTableData", { [hash]: item });
          invalidateScheduleCache();
        }
        if (payload.responseType === "_getPlanTermTableData") {
          const hash = await generateCacheKey(
            cacheKeyFromItem(record, ["crse_id", "class_nbr", "id"]),
          );
          await setGenericCache("planTermTableData", { [hash]: item });
        }
        if (payload.responseType === "_getShopCartCalEvents") {
          const hash = await generateCacheKey(
            compositeCacheKeyFromItem(record, [
              "class_nbr",
              "id",
              "event_id",
              "title",
              "start",
              "start_date",
              "startDate",
              "end",
              "end_date",
              "endDate",
            ]),
          );
          await setGenericCache("shopCartCalEventsData", { [hash]: item });
          invalidateScheduleCache();
        }
        if (payload.responseType === "_getScheduleCalEvents") {
          const hash = await generateCacheKey(
            compositeCacheKeyFromItem(record, [
              "class_nbr",
              "id",
              "event_id",
              "title",
              "start",
              "start_date",
              "startDate",
              "end",
              "end_date",
              "endDate",
            ]),
          );
          await setGenericCache("scheduleCalEventsData", { [hash]: item });
          invalidateScheduleCache();
        }
      }
    }
  });
}
