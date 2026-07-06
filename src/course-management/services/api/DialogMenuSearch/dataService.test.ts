import { beforeEach, describe, expect, it, vi } from "vitest";

import { batchFetchCoursesData, fetchSingleCourseData } from "./dataService";

const mocks = vi.hoisted(() => ({
  generateCacheKey: vi.fn(async (value: string) => `hash:${value}`),
  getGenericCache: vi.fn(),
  setGenericCache: vi.fn(),
  searchOpenCoursesByParams: vi.fn(),
  batchSearchOpenCourses: vi.fn(),
}));

vi.mock("../../../cache/CourseRetrieval", () => ({
  generateCacheKey: mocks.generateCacheKey,
  getGenericCache: mocks.getGenericCache,
  setGenericCache: mocks.setGenericCache,
}));

vi.mock("./searchService", () => ({
  searchOpenCoursesByParams: mocks.searchOpenCoursesByParams,
  batchSearchOpenCourses: mocks.batchSearchOpenCourses,
}));

describe("dataService null-course cache keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes null cache on first miss and returns early on second single-course request", async () => {
    const term = "Fall 2024";

    mocks.getGenericCache.mockResolvedValueOnce(null); // null cache miss
    mocks.getGenericCache.mockResolvedValueOnce(null); // open course cache miss
    mocks.searchOpenCoursesByParams.mockResolvedValueOnce(null);

    const first = await fetchSingleCourseData("CSC", "316", "id-1", term);

    expect(first).toBeNull();
    expect(mocks.setGenericCache).toHaveBeenCalledWith(
      "nullCourses",
      expect.objectContaining({
        ["hash:null-CSC 316 Fall 2024"]: expect.objectContaining({
          courseKey: "CSC 316",
          term,
        }),
      }),
    );

    mocks.getGenericCache.mockReset();
    mocks.getGenericCache.mockResolvedValueOnce({
      combinedData: JSON.stringify({ reason: "API returned null" }),
    }); // null cache hit

    const second = await fetchSingleCourseData("CSC", "316", "id-1", term);

    expect(second).toBeNull();
    expect(mocks.searchOpenCoursesByParams).toHaveBeenCalledTimes(1);
  });

  it("uses the same null-key convention (including term) in batch reads and writes", async () => {
    const term = "Spring 2025";
    const course = {
      course_abr: "CSC",
      catalog_num: "246",
      course_descrip: "",
      course_id: "id-2",
    };

    mocks.getGenericCache.mockResolvedValueOnce(null); // null cache miss in phase 1
    mocks.getGenericCache.mockResolvedValueOnce(null); // open courses miss
    mocks.batchSearchOpenCourses.mockResolvedValueOnce({
      code: "MTH 999", // unrelated returned singleton -> writes null cache
      sections: [],
    });

    await batchFetchCoursesData([course], term);

    expect(mocks.generateCacheKey).toHaveBeenCalledWith(
      "null-CSC 246 Spring 2025",
    );
    expect(mocks.generateCacheKey).toHaveBeenCalledWith(
      "null-MTH 999 Spring 2025",
    );
    expect(mocks.setGenericCache).toHaveBeenCalledWith(
      "nullCourses",
      expect.objectContaining({
        ["hash:null-MTH 999 Spring 2025"]: expect.objectContaining({
          term,
        }),
      }),
    );
  });

  it("caches open course data for two minutes", async () => {
    const term = "Fall 2024";
    const courseData = {
      code: "CSC 316",
      title: "Data Structures and Algorithms",
      units: "3",
      description: "",
      prerequisite: null,
      sections: [],
    };

    mocks.getGenericCache.mockResolvedValueOnce(null); // null cache miss
    mocks.getGenericCache.mockResolvedValueOnce(null); // open course cache miss
    mocks.searchOpenCoursesByParams.mockResolvedValueOnce(courseData);

    await fetchSingleCourseData("CSC", "316", "id-1", term);

    expect(mocks.setGenericCache).toHaveBeenCalledWith(
      "openCourses",
      expect.any(Object),
      2 * 60 * 1000,
    );
  });
});
