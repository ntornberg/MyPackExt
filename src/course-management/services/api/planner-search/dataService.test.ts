import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  batchFetchCoursesData,
  fetchPlannerCourseSections,
} from "./dataService";

const mocks = vi.hoisted(() => ({
  generateCacheKey: vi.fn(async (value: string) => `hash:${value}`),
  getGenericCache: vi.fn(),
  setGenericCache: vi.fn(),
  searchOpenCoursesByParams: vi.fn(),
  batchSearchOpenCourses: vi.fn(),
}));

vi.mock("../../../cache/courseRetrieval", () => ({
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

    const first = await fetchPlannerCourseSections("CSC", "316", "id-1", term);

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

    const second = await fetchPlannerCourseSections("CSC", "316", "id-1", term);

    expect(second).toBeNull();
    expect(mocks.searchOpenCoursesByParams).toHaveBeenCalledTimes(1);
  });

  it("does not null-cache courses based on a subject search", async () => {
    const term = "Spring 2025";
    const course = {
      course_abr: "CSC",
      catalog_num: "246",
      course_descrip: "",
      course_id: "id-2",
    };

    mocks.getGenericCache.mockResolvedValueOnce(null); // null cache miss in phase 1
    mocks.getGenericCache.mockResolvedValueOnce(null); // open courses miss
    mocks.batchSearchOpenCourses.mockResolvedValueOnce([
      { code: "MTH 999", sections: [] }, // unrelated returned course
    ]);

    await batchFetchCoursesData([course], term);

    expect(mocks.generateCacheKey).toHaveBeenCalledWith(
      "null-CSC 246 Spring 2025",
    ); // read side still checks the null cache
    expect(mocks.setGenericCache).not.toHaveBeenCalledWith(
      "nullCourses",
      expect.anything(),
    );
  });

  it("does not null-cache courses when the subject search fails", async () => {
    const course = {
      course_abr: "CSC",
      catalog_num: "246",
      course_descrip: "",
      course_id: "id-2",
    };

    mocks.getGenericCache.mockResolvedValue(null);
    mocks.batchSearchOpenCourses.mockRejectedValueOnce(new Error("HTTP 503"));

    await batchFetchCoursesData([course], "Spring 2025");

    expect(mocks.setGenericCache).not.toHaveBeenCalledWith(
      "nullCourses",
      expect.anything(),
    );
  });

  it("does not null-cache a course when the single search fails", async () => {
    mocks.getGenericCache.mockResolvedValue(null);
    mocks.searchOpenCoursesByParams.mockRejectedValueOnce(
      new Error("Received null response from background fetch"),
    );

    const result = await fetchPlannerCourseSections(
      "CSC",
      "316",
      "id-1",
      "Fall 2024",
    );

    expect(result).toBeNull();
    expect(mocks.setGenericCache).not.toHaveBeenCalled();
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

    await fetchPlannerCourseSections("CSC", "316", "id-1", term);

    expect(mocks.setGenericCache).toHaveBeenCalledWith(
      "openCourses",
      expect.any(Object),
      2 * 60 * 1000,
    );
  });
});
