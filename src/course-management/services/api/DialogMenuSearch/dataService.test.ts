import assert from "node:assert/strict";
import test from "node:test";

import { getGenericCache } from "../../../cache/CourseRetrieval.ts";
import { cacheSingleOpenCourseData } from "./dataService.ts";

function createChromeStorageMock() {
  const storage: Record<string, any> = {};

  return {
    storage,
    chrome: {
      storage: {
        local: {
          async get(key: string) {
            return { [key]: storage[key] };
          },
          async set(value: Record<string, any>) {
            Object.assign(storage, value);
          },
        },
      },
    },
  };
}

test("cacheSingleOpenCourseData stores single course entries with the same key used by cache reads", async () => {
  const { chrome } = createChromeStorageMock();
  (globalThis as any).chrome = chrome;

  const courseData = {
    code: "CSC 316",
    title: "Data Structures",
    units: "3",
    description: "Core data structures",
    prerequisite: null,
    sections: [],
  };

  const openCoursesHashKeys = {
    [courseData.code]: "hash-csc-316-fall-2026",
  };
  const openCoursesCache: Record<string, typeof courseData> = {};

  await cacheSingleOpenCourseData(
    courseData,
    openCoursesHashKeys,
    openCoursesCache,
  );

  const cachedEntry = await getGenericCache(
    "openCourses",
    openCoursesHashKeys[courseData.code],
  );

  assert.ok(cachedEntry);
  assert.equal(cachedEntry?.combinedData, JSON.stringify(courseData));
  assert.deepEqual(openCoursesCache[courseData.code], courseData);
});

test("cacheSingleOpenCourseData skips writes when a hash key is missing", async () => {
  const { chrome } = createChromeStorageMock();
  (globalThis as any).chrome = chrome;

  const courseData = {
    code: "CSC 401",
    title: "Advanced Topics",
    units: "3",
    description: "Specialized content",
    prerequisite: null,
    sections: [],
  };

  const openCoursesCache: Record<string, typeof courseData> = {};
  await cacheSingleOpenCourseData(courseData, {}, openCoursesCache);

  const cachedEntry = await getGenericCache("openCourses", "missing-key");

  assert.equal(cachedEntry, null);
  assert.equal(openCoursesCache[courseData.code], undefined);
});
