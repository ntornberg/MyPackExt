import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  batchFetchCoursesData,
  fetchSingleCourseData,
} from "./dataService";

const mockGenerateCacheKey = vi.fn(async (value: string) => `hash:${value}`);
const mockGetGenericCache = vi.fn();
const mockSetGenericCache = vi.fn();
const mockSearchOpenCoursesByParams = vi.fn();
const mockBatchSearchOpenCourses = vi.fn();

vi.mock("../../../cache/CourseRetrieval", () => ({
  generateCacheKey: mockGenerateCacheKey,
  getGenericCache: mockGetGenericCache,
  setGenericCache: mockSetGenericCache,
}));

vi.mock("./searchService", () => ({
  searchOpenCoursesByParams: mockSearchOpenCoursesByParams,
  batchSearchOpenCourses: mockBatchSearchOpenCourses,
}));

describe("dataService null-course cache keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes null cache on first miss and returns early on second single-course request", async () => {
    const term = "Fall 2024";

    mockGetGenericCache.mockResolvedValueOnce(null); // null cache miss
    mockGetGenericCache.mockResolvedValueOnce(null); // open course cache miss
    mockSearchOpenCoursesByParams.mockResolvedValueOnce(null);

    const first = await fetchSingleCourseData("CSC", "316", "id-1", term);

    expect(first).toBeNull();
    expect(mockSetGenericCache).toHaveBeenCalledWith(
      "nullCourses",
      expect.objectContaining({
        ["hash:null-CSC 316 Fall 2024"]: expect.objectContaining({
          courseKey: "CSC 316",
          term,
        }),
      }),
    );

    mockGetGenericCache.mockReset();
    mockGetGenericCache.mockResolvedValueOnce({
      combinedData: JSON.stringify({ reason: "API returned null" }),
    }); // null cache hit

    const second = await fetchSingleCourseData("CSC", "316", "id-1", term);

    expect(second).toBeNull();
    expect(mockSearchOpenCoursesByParams).toHaveBeenCalledTimes(1);
  });

  it("uses the same null-key convention (including term) in batch reads and writes", async () => {
    const term = "Spring 2025";
    const course = {
      course_abr: "CSC",
      catalog_num: "246",
      course_descrip: "",
      course_id: "id-2",
    };

    mockGetGenericCache.mockResolvedValueOnce(null); // null cache miss in phase 1
    mockGetGenericCache.mockResolvedValueOnce(null); // open courses miss
    mockBatchSearchOpenCourses.mockResolvedValueOnce({
      code: "MTH 999", // unrelated returned singleton -> writes null cache
      sections: [],
    });

    await batchFetchCoursesData([course], term);

    expect(mockGenerateCacheKey).toHaveBeenCalledWith("null-CSC 246 Spring 2025");
    expect(mockGenerateCacheKey).toHaveBeenCalledWith("null-MTH 999 Spring 2025");
    expect(mockSetGenericCache).toHaveBeenCalledWith(
      "nullCourses",
      expect.objectContaining({
        ["hash:null-MTH 999 Spring 2025"]: expect.objectContaining({
          term,
        }),
      }),
    );
  });
});
