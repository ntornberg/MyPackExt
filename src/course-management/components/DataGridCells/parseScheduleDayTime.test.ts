import { describe, expect, it } from "vitest";

import { CALENDAR_COLOR_PINNED_SECTION } from "../../types/Calendar";
import { parseDayTimeEvent } from "./parseScheduleDayTime";

describe("parseDayTimeEvent", () => {
  it("parses upper-case AM/PM times and mapped weekdays", () => {
    const parsed = parseDayTimeEvent("M T 1:00 PM - 2:15 PM", "CSC");

    expect(parsed).toMatchObject({
      subj: "CSC",
      start: "1:00 PM",
      end: "2:15 PM",
      color: CALENDAR_COLOR_PINNED_SECTION,
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

  it("parses compact MW and TuTh registrar-style prefixes", () => {
    const mw = parseDayTimeEvent("MW 12:00 PM - 1:15 PM", "CSC 316");
    expect(mw?.days.map((d) => d.day)).toEqual(["Mon", "Wed"]);

    const tuth = parseDayTimeEvent("TuTh 1:30 PM - 2:45 PM", "MA 305");
    expect(tuth?.days.map((d) => d.day)).toEqual(["Tue", "Thu"]);
  });
});
