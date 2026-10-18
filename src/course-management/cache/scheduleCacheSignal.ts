/**
 * Signals when stored cart/schedule data changes so views can drop their
 * in-memory copies. Kept free of UI code so services can notify without
 * importing components.
 */

/**
 * chrome.storage key bumped whenever site responses update schedule/cart data.
 * Responses are captured by the content script in the PeopleSoft iframe, while
 * the drawer lives in the top frame, so module state alone can't signal them.
 */
export const SCHEDULE_DATA_VERSION_KEY = "scheduleDataVersion";

// Bumped on every invalidation so a load that started before it can't
// repopulate a cache with stale data.
let scheduleCacheGeneration = 0;
const scheduleCacheListeners = new Set<() => void>();

export const getScheduleCacheGeneration = (): number => scheduleCacheGeneration;

/** Invalidates this frame's schedule caches and notifies subscribers. */
export const invalidateScheduleCache = (): void => {
  scheduleCacheGeneration++;
  for (const listener of scheduleCacheListeners) {
    listener();
  }
};

/** Registers a callback for schedule cache invalidations; returns an unsubscribe. */
export const subscribeScheduleCache = (listener: () => void): (() => void) => {
  scheduleCacheListeners.add(listener);
  return () => {
    scheduleCacheListeners.delete(listener);
  };
};

/** Invalidates this frame and tells other frames (via chrome.storage) to do the same. */
export async function notifyScheduleDataChanged(): Promise<void> {
  invalidateScheduleCache();
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({
      [SCHEDULE_DATA_VERSION_KEY]: Date.now(),
    });
  }
}

let isWatchingScheduleCache = false;

/** Invalidates this frame's schedule cache when another frame stores new data. */
export const watchScheduleCacheChanges = (): void => {
  if (
    isWatchingScheduleCache ||
    typeof chrome === "undefined" ||
    !chrome.storage?.onChanged
  ) {
    return;
  }
  isWatchingScheduleCache = true;
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && SCHEDULE_DATA_VERSION_KEY in changes) {
      invalidateScheduleCache();
    }
  });
};
