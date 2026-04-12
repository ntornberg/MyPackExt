import { describe, expect, it } from "vitest";

import { parseDayTimeEvent } from "./parseScheduleDayTime";

describe("parseDayTimeEvent", () => {
  it("parses upper-case AM/PM times and mapped weekdays", () => {
    const parsed = parseDayTimeEvent("M T 1:00 PM - 2:15 PM", "CSC");

    expect(parsed).toMatchObject({
      subj: "CSC",
      start: "1:00 PM",
      end: "2:15 PM",
      color: "#2ECC71",
    });
    expect(parsed?.days).toEqual([
      { day: "Mon", isOverlapping: false },
      { day: "Tue", isOverlapping: false },
    ]);
  });

  it("parses lower-case AM/PM without errors", () => {
    const parsed = parseDayTimeEvent("W 7:15 pm - 9:00 am", "MATH");

    expect(parsed).toMatchObject({
      subj: "MATH",
      start: "7:15 PM",
      end: "9:00 AM",
    });
  });

  it("returns null for malformed day/time values", () => {
    expect(parseDayTimeEvent("M W 1:00 - 2:00 PM", "BIO")).toBeNull();
    expect(parseDayTimeEvent(undefined, "BIO")).toBeNull();
  });
});
