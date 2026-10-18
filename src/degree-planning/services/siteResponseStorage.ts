import {
  generateCacheKey,
  getCacheCategory,
  removeGenericCacheEntries,
  replaceGenericCache,
  setGenericCache,
  syncIndexedDBCacheEpoch,
} from "../../course-management/cache/courseRetrieval";
import { notifyScheduleDataChanged } from "../../course-management/cache/scheduleCacheSignal";
import { AppLogger } from "../../utils/logger";

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

// Composite so two rows for the same course (e.g. different class numbers)
// don't share one cache entry.
const TABLE_KEY_FIELDS = ["crse_id", "class_nbr", "id"];
const CALENDAR_KEY_FIELDS = [
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
];
const CALENDAR_DATE_FIELDS = ["start", "start_date", "startDate"];

type ResponseStorageRule = {
  category: string;
  keyFields: string[];
  /** Whether cart/schedule calendar views read this category. */
  affectsSchedule: boolean;
  /**
   * Calendar responses cover only the visible date range, so they replace the
   * stored events in that range and keep other weeks. Table responses are the
   * full current list and replace the whole category.
   */
  rangeScoped: boolean;
};

const RESPONSE_STORAGE_RULES: Record<string, ResponseStorageRule> = {
  _getScheduleTableData: {
    category: "scheduleTableData",
    keyFields: TABLE_KEY_FIELDS,
    affectsSchedule: true,
    rangeScoped: false,
  },
  _getShopCartTableData: {
    category: "shopCartTableData",
    keyFields: TABLE_KEY_FIELDS,
    affectsSchedule: true,
    rangeScoped: false,
  },
  _getPlanTermTableData: {
    category: "planTermTableData",
    keyFields: TABLE_KEY_FIELDS,
    affectsSchedule: false,
    rangeScoped: false,
  },
  _getShopCartCalEvents: {
    category: "shopCartCalEventsData",
    keyFields: CALENDAR_KEY_FIELDS,
    affectsSchedule: true,
    rangeScoped: true,
  },
  _getScheduleCalEvents: {
    category: "scheduleCalEventsData",
    keyFields: CALENDAR_KEY_FIELDS,
    affectsSchedule: true,
    rangeScoped: true,
  },
};

function itemsFromPayloadData(data: unknown): Record<string, unknown>[] {
  const items = Array.isArray(data) ? data : Object.values(data as object);
  return items.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object",
  );
}

/** The `YYYY-MM-DD` date an event starts on, if it has one. */
function eventDate(item: unknown): string | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  for (const field of CALENDAR_DATE_FIELDS) {
    const value = (item as Record<string, unknown>)[field];
    const match =
      typeof value === "string" ? value.match(/^\d{4}-\d{2}-\d{2}/) : null;
    if (match) {
      return match[0];
    }
  }
  return null;
}

/**
 * Stores calendar events for the response's date range. Stored events inside
 * that range (or without a date) are replaced; other weeks are kept, so viewing
 * a week where a class doesn't meet doesn't drop it from the weekly pattern.
 */
async function storeCalendarRange(
  category: string,
  items: Record<string, unknown>[],
  entries: Record<string, unknown>,
): Promise<void> {
  const dates = items.map(eventDate);
  if (dates.some((date) => date === null)) {
    // No reliable range to scope to: treat the response as the full list.
    await replaceGenericCache(category, entries);
    return;
  }
  const sorted = (dates as string[]).sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const stored = (await getCacheCategory(category)) ?? {};
  const staleHashes = Object.entries(stored)
    .filter(([, entry]) => {
      const date = eventDate(entry.combinedData);
      return date === null || (date >= first && date <= last);
    })
    .map(([hash]) => hash);
  await removeGenericCacheEntries(category, staleHashes);
  await setGenericCache(category, entries);
}

async function storeResponse(responseType: string, data: unknown) {
  const rule = RESPONSE_STORAGE_RULES[responseType];
  if (!rule) {
    return;
  }
  if (!data || typeof data !== "object") {
    // A response without a data list (e.g. an error body) isn't an empty
    // snapshot; storing it would wipe the cart or schedule.
    AppLogger.warn(`Ignoring ${responseType} response without data`);
    return;
  }

  const items = itemsFromPayloadData(data);
  if (rule.rangeScoped && items.length === 0) {
    // A week with no meetings has nothing to replace.
    return;
  }

  const entries: Record<string, unknown> = {};
  for (const item of items) {
    const key = compositeCacheKeyFromItem(item, rule.keyFields);
    entries[await generateCacheKey(key)] = item;
  }

  if (rule.rangeScoped) {
    await storeCalendarRange(rule.category, items, entries);
  } else {
    // Each table response is the full current list, so replace rather than
    // merge: classes dropped from the cart/schedule must disappear.
    await replaceGenericCache(rule.category, entries);
  }

  if (rule.affectsSchedule) {
    await notifyScheduleDataChanged();
  }
}

// Responses are stored one at a time so a clear-then-write for one response
// can't interleave with another response for the same category.
let storageQueue: Promise<void> = Promise.resolve();

/**
 * Listens for messages posted from the hook script injected into page/iframes and
 * persists relevant class data in cache categories for later display.
 */
export async function setupListener() {
  // Drop this origin's IndexedDB cache if the extension cleared caches since
  // (e.g. after an update); queued so no response is stored before it runs.
  storageQueue = storageQueue.then(() => syncIndexedDBCacheEpoch());
  // Signal readiness within the same frame to avoid cross-origin top access
  const origin = window.location.origin;
  window.postMessage(
    { type: "RECEIVER_READY", source: "content-script" },
    // "null" origins (sandboxed/about:blank) can't be targeted.
    origin && origin !== "null" ? origin : "*",
  );
  window.addEventListener("message", (event: MessageEvent) => {
    // Only accept messages the hook posted in this same window.
    if (event.source !== window) return;
    const message = event.data;
    if (
      !message ||
      typeof message !== "object" ||
      message.source !== "realFetchHook" ||
      message.type !== "CLASS_DATA"
    ) {
      return;
    }
    const payload = message.payload;
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.responseType !== "string"
    ) {
      return;
    }
    AppLogger.info("Received message from page:", payload.responseType);

    storageQueue = storageQueue
      .then(() => storeResponse(payload.responseType, payload.data))
      .catch((error) => {
        AppLogger.error("Failed to store site response:", error);
      });
  });
  return storageQueue;
}

/** Resolves once every queued site response has been stored (for tests). */
export function whenSiteResponsesStored(): Promise<void> {
  return storageQueue;
}
