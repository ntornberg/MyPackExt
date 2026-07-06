import { beforeEach, describe, expect, it, vi } from "vitest";

import { setupListener } from "./siteResponseStorage";

const mocks = vi.hoisted(() => ({
  generateCacheKey: vi.fn(async (value: string) => `hash:${value}`),
  setGenericCache: vi.fn(async () => undefined),
  invalidateScheduleCache: vi.fn(),
}));

vi.mock("../../course-management/cache/CourseRetrieval", () => ({
  generateCacheKey: mocks.generateCacheKey,
  setGenericCache: mocks.setGenericCache,
}));

vi.mock(
  "../../course-management/components/DataGridCells/CalendarView",
  () => ({
    invalidateScheduleCache: mocks.invalidateScheduleCache,
  }),
);

describe("siteResponseStorage listener", () => {
  let messageHandler: ((event: { data: unknown }) => Promise<void>) | null;

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandler = null;
    (globalThis as unknown as { window: Partial<Window> }).window = {
      postMessage: vi.fn(),
      addEventListener: vi.fn((type, handler) => {
        if (type === "message") {
          messageHandler = handler as typeof messageHandler;
        }
      }),
    };
  });

  it.each([
    ["_getScheduleTableData", "crse-1"],
    ["_getShopCartTableData", "crse-2"],
    ["_getShopCartCalEvents", "class-1"],
    ["_getScheduleCalEvents", "class-2"],
  ])(
    "invalidates schedule cache after %s updates",
    async (responseType, id) => {
      await setupListener();

      await messageHandler?.({
        data: {
          source: "realFetchHook",
          type: "CLASS_DATA",
          payload: {
            responseType,
            data: [
              {
                crse_id: id,
                class_nbr: id,
              },
            ],
          },
        },
      });

      expect(mocks.setGenericCache).toHaveBeenCalledTimes(1);
      expect(mocks.invalidateScheduleCache).toHaveBeenCalledTimes(1);
    },
  );
});
