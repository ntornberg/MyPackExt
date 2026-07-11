/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearAllExtensionCaches,
  getCacheCategory,
  getGenericCache,
  isCacheEntryExpired,
  setGenericCache,
  type CacheEntry,
} from "./courseRetrieval.js";

type ChromeStorageMock = {
  storage: {
    local: {
      get: ReturnType<typeof vi.fn>;
      set: ReturnType<typeof vi.fn>;
      remove?: ReturnType<typeof vi.fn>;
      clear?: ReturnType<typeof vi.fn>;
    };
  };
};

function installChromeStorageMock(storageState: Record<string, any>): {
  chromeMock: ChromeStorageMock;
  setCalls: unknown[];
} {
  const setCalls: unknown[] = [];
  const chromeMock: ChromeStorageMock = {
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: storageState[key] })),
        set: vi.fn(async (payload: Record<string, any>) => {
          setCalls.push(payload);
          for (const [key, value] of Object.entries(payload)) {
            storageState[key] = value;
          }
        }),
        remove: vi.fn(async (key: string | string[]) => {
          const keys = Array.isArray(key) ? key : [key];
          for (const storageKey of keys) {
            delete storageState[storageKey];
          }
        }),
        clear: vi.fn(async () => {
          for (const key of Object.keys(storageState)) {
            delete storageState[key];
          }
        }),
      },
    },
  };
  (globalThis as unknown as { chrome: ChromeStorageMock }).chrome = chromeMock;
  return { chromeMock, setCalls };
}

describe("CourseRetrieval cache expiration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as unknown as { chrome?: ChromeStorageMock }).chrome;
    delete (globalThis as unknown as { indexedDB?: IDBFactory }).indexedDB;
  });

  it("uses expiresAt when present", () => {
    const now = 10_000;
    const entry: CacheEntry = {
      combinedData: { value: "override" },
      timestamp: now - 100,
      expiresAt: now - 1,
    };

    expect(isCacheEntryExpired(entry, now)).toBe(true);
  });

  it("falls back to legacy timestamp when expiresAt is missing", () => {
    const sixHours = 6 * 60 * 60 * 1000;
    const now = sixHours + 2;
    const legacyEntry: CacheEntry = {
      combinedData: { value: "legacy" },
      timestamp: 0,
    };

    expect(isCacheEntryExpired(legacyEntry, now)).toBe(true);
  });

  it("cleans up expired single-entry reads from chrome storage", async () => {
    const cacheCategory = "override-expiration";
    const hash = "hash-1";
    const now = 10_000;
    const storageState: Record<string, Record<string, CacheEntry>> = {
      [cacheCategory]: {
        [hash]: {
          combinedData: { value: "short-lived" },
          timestamp: now - 100,
          expiresAt: now - 1,
        },
      },
    };
    const { setCalls } = installChromeStorageMock(storageState);
    vi.spyOn(Date, "now").mockReturnValue(now);

    const result = await getGenericCache(cacheCategory, hash);

    expect(result).toBeNull();
    expect(setCalls).toHaveLength(1);
    expect(storageState[cacheCategory][hash]).toBeUndefined();
  });

  it("stores override expiration values in milliseconds", async () => {
    const cacheCategory = "openCourses";
    const now = 20_000;
    const storageState: Record<string, Record<string, CacheEntry>> = {};
    installChromeStorageMock(storageState);
    vi.spyOn(Date, "now").mockReturnValue(now);

    await setGenericCache(
      cacheCategory,
      { CSC_316_Fall_2024: JSON.stringify({ code: "CSC 316" }) },
      2 * 60 * 1000,
    );

    expect(storageState[cacheCategory]["CSC_316_Fall_2024"].expiresAt).toBe(
      now + 2 * 60 * 1000,
    );
  });

  it("filters expired entries from category reads", async () => {
    const cacheCategory = "scheduleTableData";
    const now = 50_000;
    const storageState: Record<string, Record<string, CacheEntry>> = {
      [cacheCategory]: {
        expired: {
          combinedData: { value: "old" },
          timestamp: now - 1_000,
          expiresAt: now - 1,
        },
        valid: {
          combinedData: { value: "fresh" },
          timestamp: now - 1_000,
          expiresAt: now + 1_000,
        },
      },
    };
    const { setCalls } = installChromeStorageMock(storageState);
    vi.spyOn(Date, "now").mockReturnValue(now);

    const result = await getCacheCategory(cacheCategory);

    expect(result).toEqual({
      valid: storageState[cacheCategory].valid,
    });
    expect(setCalls).toHaveLength(1);
    expect(storageState[cacheCategory].expired).toBeUndefined();
  });

  it("clears cache categories without removing analytics state", async () => {
    const storageState: Record<string, any> = {
      openCourses: {
        CSC_316_Fall_2024: {
          combinedData: { code: "CSC 316" },
          timestamp: 1,
          expiresAt: 2,
        },
      },
      scheduleTableData: {
        "123": {
          combinedData: { crse_id: "123" },
          timestamp: 1,
          expiresAt: 2,
        },
      },
    };
    const { chromeMock } = installChromeStorageMock(storageState);

    await clearAllExtensionCaches();

    expect(chromeMock.storage.local.clear).not.toHaveBeenCalled();
    expect(chromeMock.storage.local.remove).toHaveBeenCalledWith(
      expect.arrayContaining(["openCourses", "scheduleTableData"]),
    );
    expect(storageState.openCourses).toBeUndefined();
    expect(storageState.scheduleTableData).toBeUndefined();
  });
});
