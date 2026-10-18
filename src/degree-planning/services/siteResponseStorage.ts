import {
  generateCacheKey,
  replaceGenericCache,
  syncIndexedDBCacheEpoch,
} from "../../course-management/cache/courseRetrieval";
import {
  SCHEDULE_DATA_VERSION_KEY,
  invalidateScheduleCache,
} from "../../course-management/components/calendar/CalendarView";
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

type ResponseStorageRule = {
  category: string;
  keyFields: string[];
  composite: boolean;
  /** Whether cart/schedule calendar views read this category. */
  affectsSchedule: boolean;
  /**
   * Calendar responses cover one visible range; an empty one (e.g. a week with
   * no meetings) shouldn't wipe the stored weekly pattern.
   */
  skipEmpty: boolean;
};

const RESPONSE_STORAGE_RULES: Record<string, ResponseStorageRule> = {
  _getScheduleTableData: {
    category: "scheduleTableData",
    keyFields: TABLE_KEY_FIELDS,
    composite: false,
    affectsSchedule: true,
    skipEmpty: false,
  },
  _getShopCartTableData: {
    category: "shopCartTableData",
    keyFields: TABLE_KEY_FIELDS,
    composite: false,
    affectsSchedule: true,
    skipEmpty: false,
  },
  _getPlanTermTableData: {
    category: "planTermTableData",
    keyFields: TABLE_KEY_FIELDS,
    composite: false,
    affectsSchedule: false,
    skipEmpty: false,
  },
  _getShopCartCalEvents: {
    category: "shopCartCalEventsData",
    keyFields: CALENDAR_KEY_FIELDS,
    composite: true,
    affectsSchedule: true,
    skipEmpty: true,
  },
  _getScheduleCalEvents: {
    category: "scheduleCalEventsData",
    keyFields: CALENDAR_KEY_FIELDS,
    composite: true,
    affectsSchedule: true,
    skipEmpty: true,
  },
};

function itemsFromPayloadData(data: unknown): Record<string, unknown>[] {
  const items = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? Object.values(data)
      : [];
  return items.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object",
  );
}

async function storeResponse(responseType: string, data: unknown) {
  const rule = RESPONSE_STORAGE_RULES[responseType];
  if (!rule) {
    return;
  }

  const items = itemsFromPayloadData(data);
  if (rule.skipEmpty && items.length === 0) {
    return;
  }

  const entries: Record<string, unknown> = {};
  for (const item of items) {
    const key = rule.composite
      ? compositeCacheKeyFromItem(item, rule.keyFields)
      : cacheKeyFromItem(item, rule.keyFields);
    entries[await generateCacheKey(key)] = item;
  }

  // Each response is the full current list, so replace rather than merge:
  // classes dropped from the cart/schedule must disappear.
  await replaceGenericCache(rule.category, entries);

  if (rule.affectsSchedule) {
    invalidateScheduleCache();
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({
        [SCHEDULE_DATA_VERSION_KEY]: Date.now(),
      });
    }
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
