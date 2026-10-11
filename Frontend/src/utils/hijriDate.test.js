import { describe, expect, it } from "vitest";
import { getHijriDate, millisecondsToDhakaMidnight } from "./hijriDate";

describe("Hijri calendar conversion", () => {
  it("matches 1 Ramadan 1447 on 18 February 2026 in Umm al-Qura", () => {
    expect(getHijriDate(new Date("2026-02-18T06:00:00Z"))).toEqual({
      gregorianDate: "2026-02-18", label: "1 Ramadan 1447 AH",
    });
  });

  it("uses the Dhaka day, even while the UTC day has not changed", () => {
    expect(getHijriDate(new Date("2026-10-09T17:59:59Z"))).toEqual({
      gregorianDate: "2026-10-09", label: "28 Rabi al-Thani 1448 AH",
    });
    expect(getHijriDate(new Date("2026-10-09T18:00:00Z"))).toEqual({
      gregorianDate: "2026-10-10", label: "29 Rabi al-Thani 1448 AH",
    });
  });

  it.each([
    ["2026-10-09T17:59:59.999Z", 1],
    ["2026-10-09T18:00:00.000Z", 86400000],
    ["2026-10-09T16:00:00.000Z", 7200000],
  ])("schedules the Dhaka midnight boundary at %s", (instant, expected) => {
    expect(millisecondsToDhakaMidnight(new Date(instant))).toBe(expected);
  });
});
