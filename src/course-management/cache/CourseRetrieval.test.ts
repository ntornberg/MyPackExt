import {
  getGenericCache,
  isCacheEntryExpired,
  type CacheEntry,
} from "./CourseRetrieval.js";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests(): Promise<void> {
  {
    const now = 10_000;
    const entry: CacheEntry = {
      combinedData: { value: "override" },
      timestamp: now - 100,
      expiresAt: now - 1,
    };

    assert(
      isCacheEntryExpired(entry, now) === true,
      "isCacheEntryExpired should use expiresAt when present",
    );
  }

  {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = oneDay + 2;
    const legacyEntry: CacheEntry = {
      combinedData: { value: "legacy" },
      timestamp: 0,
    };

    assert(
      isCacheEntryExpired(legacyEntry, now) === true,
      "isCacheEntryExpired should fall back to legacy timestamp when expiresAt is missing",
    );
  }

  {
    const cacheCategory = "override-expiration";
    const hash = "hash-1";
    const now = 10_000;
    const setCalls: unknown[] = [];

    const storageState: Record<string, Record<string, CacheEntry>> = {
      [cacheCategory]: {
        [hash]: {
          combinedData: { value: "short-lived" },
          timestamp: now - 100,
          expiresAt: now - 1,
        },
      },
    };

    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: {
        local: {
          async get(key: string) {
            return { [key]: storageState[key] };
          },
          async set(payload: Record<string, Record<string, CacheEntry>>) {
            setCalls.push(payload);
            for (const [key, value] of Object.entries(payload)) {
              storageState[key] = value;
            }
          },
        },
      },
    };

    const originalNow = Date.now;
    Date.now = () => now;

    try {
      const result = await getGenericCache(cacheCategory, hash);
      assert(
        result === null,
        "getGenericCache should return null when override expiration has passed",
      );
      assert(
        setCalls.length === 1,
        "getGenericCache should clean up expired entries from storage",
      );
      assert(
        storageState[cacheCategory][hash] === undefined,
        "expired entry should be deleted from cache category",
      );
    } finally {
      Date.now = originalNow;
      delete (globalThis as unknown as { chrome?: unknown }).chrome;
    }
  }
}

void runTests();
