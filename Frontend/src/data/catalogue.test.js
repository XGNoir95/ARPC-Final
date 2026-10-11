import { describe, expect, it } from "vitest";
import { filterCatalogue } from "./catalogue";

const events = [
  { title: "Older", description: "Reading", format: "Circle", date: "2026-10-01" },
  { title: "Later", description: "Writing", format: "Workshop", date: "2026-11-10" },
  { title: "Today", description: "Learning", format: "Discussion", date: "2026-10-10" },
  { title: "Recent", description: "Reflection", format: "Circle", date: "2026-10-09" },
];
describe("Catalogue browsing", () => {
  it("shows today's programme as upcoming and sorts the archive newest first", () => {
    expect(filterCatalogue(events, "events", "All", "", "2026-10-10").map((e) => e.title)).toEqual(["Today", "Later", "Recent", "Older"]);
    expect(filterCatalogue(events, "events", "Upcoming", "", "2026-10-10").map((e) => e.title)).toEqual(["Today", "Later"]);
    expect(filterCatalogue(events, "events", "Finished", "", "2026-10-11").map((e) => e.title)).toEqual(["Today", "Recent", "Older"]);
  });
  it("combines search with status rather than discarding the selected filter", () => {
    expect(filterCatalogue(events, "webinars", "Finished", "  CIRCLE  ", "2026-10-10").map((e) => e.title)).toEqual(["Recent", "Older"]);
    expect(filterCatalogue(events, "webinars", "Upcoming", "circle", "2026-10-10")).toEqual([]);
  });
  it("keeps free courses distinct from paid courses", () => {
    const courses = [{ title: "Free writing", fee: 0 }, { title: "Paid writing", fee: 1200 }];
    expect(filterCatalogue(courses, "courses", "Free", "writing").map((c) => c.fee)).toEqual([0]);
    expect(filterCatalogue(courses, "courses", "Paid", "writing").map((c) => c.fee)).toEqual([1200]);
  });
});
