import { MemoryRouter } from "react-router-dom";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CourseLaptop from "./CourseLaptop";
import { catalogue } from "../data/catalogue";
import { courseCoverPresets, getCourseCover } from "../utils/courseCovers";

const originalAnimate = Object.getOwnPropertyDescriptor(Element.prototype, "animate");
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalAnimate) Object.defineProperty(Element.prototype, "animate", originalAnimate);
  else delete Element.prototype.animate;
});

function mockAnimations() {
  const animations = [];
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: vi.fn(() => {
    const animation = { cancel: vi.fn(), finished: new Promise(() => {}) };
    animations.push(animation);
    return animation;
  }) });
  return animations;
}

const newCourse = (id, title, extra = {}) => ({
  ...catalogue.courses[0], id, title, format: "Guided learning", coverTheme: undefined, ...extra,
});

it("opens a course from the library dock and returns keyboard focus to the dock", () => {
  renderLaptop(<CourseLaptop items={catalogue.courses} />);
  expect(screen.getByText("3 courses")).toBeInTheDocument();
  expect(screen.getByText(/2 free/)).toHaveTextContent("2 free · 1 paid");
  const open = screen.getByRole("button", { name: "Explore a course" });
  fireEvent.click(open);
  const details = screen.getByRole("region", { name: catalogue.courses[0].title });
  expect(details).toHaveFocus();
  fireEvent.keyDown(details, { key: "Escape" });
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Explore a course" })).toHaveFocus();
});

it("gives new courses subject artwork and supports browsing beyond the original three", () => {
  const courses = [
    newCourse("new-faith", "Faith and everyday choices"),
    newCourse("new-writing", "Creative writing"),
    newCourse("new-history", "A history of community service"),
    newCourse("new-science", "Science in daily life"),
    newCourse("new-topic", "A new subject", { coverTheme: "not-a-theme" }),
    newCourse("new-explicit", "A guided workshop", { coverTheme: "writing" }),
  ];
  renderLaptop(<CourseLaptop items={courses} />);
  const buttons = screen.getAllByRole("button", { name: /Open course folder:/ });
  expect(buttons).toHaveLength(6);
  expect(screen.getByText("6 courses")).toBeInTheDocument();
  for (const [index, artwork] of ["reflection", "writing", "seerah", "science", "learning", "writing"].entries()) {
    expect(buttons[index].querySelector("img").getAttribute("src")).toContain(`${artwork}-cover`);
    fireEvent.click(buttons[index]);
    const details = screen.getByRole("region", { name: courses[index].title });
    expect(within(details).getByRole("heading", { name: courses[index].title })).toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(1);
  }
});

it("retains the selected library view while opening and closing a course", () => {
  const { container } = renderLaptop(<CourseLaptop items={catalogue.courses} />);
  const grid = screen.getByRole("button", { name: "Grid view" });
  const list = screen.getByRole("button", { name: "List view" });
  expect(grid).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(list);
  expect(list).toHaveAttribute("aria-pressed", "true");
  expect(grid).toHaveAttribute("aria-pressed", "false");
  expect(container.querySelector(".course-workspace")).toHaveAttribute("data-view", "list");
  fireEvent.click(screen.getAllByRole("button", { name: /Open course folder:/ })[0]);
  expect(list).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
  expect(list).not.toBeDisabled();
  expect(list).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(grid);
  expect(container.querySelector(".course-workspace")).toHaveAttribute("data-view", "grid");
});

it("provides eleven unique selectable cover presets for a future admin picker", () => {
  expect(courseCoverPresets).toHaveLength(11);
  expect(new Set(courseCoverPresets.map((preset) => preset.id)).size).toBe(11);
  expect(new Set(courseCoverPresets.map((preset) => preset.cover)).size).toBe(11);
  for (const preset of courseCoverPresets) {
    expect(preset.label).toBeTruthy();
    const appearance = getCourseCover(newCourse(`future-${preset.id}`, "Future course", { coverTheme: preset.id }));
    expect(appearance.cover).toBe(preset.cover);
    expect(appearance.fallbackCover).toBe(preset.cover);
  }
});

it("uses a custom course cover and recovers with subject artwork if it fails to load", () => {
  const course = newCourse("custom-writing", "Writing for students", { coverImage: "/images/courses/writing.jpg" });
  renderLaptop(<CourseLaptop items={[course]} />);
  const button = screen.getByRole("button", { name: `Open course folder: ${course.title}` });
  const cover = button.querySelector("img");
  expect(cover).toHaveAttribute("src", "/images/courses/writing.jpg");
  fireEvent.error(cover);
  expect(cover.getAttribute("src")).toContain("writing-cover");
  const fallback = cover.getAttribute("src");
  fireEvent.error(cover);
  expect(cover).toHaveAttribute("src", fallback);
  fireEvent.click(button);
  expect(screen.getByRole("region", { name: course.title })).toHaveFocus();
});

it("keeps rapid animated switches independent and removes outgoing details from keyboard and accessibility navigation", () => {
  const animations = mockAnimations();
  const { container, unmount } = renderLaptop(<CourseLaptop items={catalogue.courses} />);
  const folders = screen.getAllByRole("button", { name: /Open course folder:/ });
  fireEvent.click(folders[0]);
  fireEvent.click(folders[1]);
  expect(animations[0].cancel).toHaveBeenCalled();
  const outgoing = container.querySelector(".course-screen-details--outgoing");
  expect(outgoing).toHaveAttribute("inert");
  expect(outgoing).toHaveAttribute("aria-hidden", "true");
  expect(outgoing.querySelectorAll("[id]")).toHaveLength(0);
  expect(screen.queryByRole("region", { name: catalogue.courses[0].title })).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: catalogue.courses[1].title })).toHaveFocus();
  fireEvent.click(folders[2]);
  expect(screen.getAllByRole("region")).toHaveLength(1);
  expect(screen.getByRole("region", { name: catalogue.courses[2].title })).toHaveFocus();
  expect(container.querySelectorAll("#course-screen-details")).toHaveLength(1);
  expect(container.querySelectorAll(".course-screen-details--outgoing")).toHaveLength(1);
  unmount();
  expect(animations.every((animation) => animation.cancel.mock.calls.length > 0)).toBe(true);
});

it("switches immediately without outgoing snapshots when reduced motion is requested", () => {
  const animations = mockAnimations();
  vi.stubGlobal("matchMedia", vi.fn((query) => ({ matches: query === "(prefers-reduced-motion: reduce)" })));
  const { container } = renderLaptop(<CourseLaptop items={catalogue.courses} />);
  const folders = screen.getAllByRole("button", { name: /Open course folder:/ });
  fireEvent.click(folders[0]);
  fireEvent.click(folders[1]);
  expect(screen.getByRole("region", { name: catalogue.courses[1].title })).toHaveFocus();
  expect(animations).toHaveLength(0);
  expect(container.querySelector(".course-screen-details--outgoing")).not.toBeInTheDocument();
});

function renderLaptop(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>); }
