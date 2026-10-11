import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Catalogue from "./Catalogue";

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.setSystemTime(new Date("2026-10-10T06:00:00Z"));
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function () { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function () { this.removeAttribute("open"); } });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete HTMLDialogElement.prototype.showModal;
  delete HTMLDialogElement.prototype.close;
});
const section = (name) => screen.getByRole("region", { name, exact: true });
const renderCatalogue = () => render(<MemoryRouter><Catalogue /></MemoryRouter>);
const finishOpening = () => {
  act(() => vi.advanceTimersByTime(420));
  act(() => vi.advanceTimersByTime(680));
};
const finishClosing = () => {
  act(() => vi.advanceTimersByTime(520));
  act(() => vi.advanceTimersByTime(420));
};

describe("Catalogue page", () => {
  it.each([
    ["An evening of reflection", "24 October 2026", "4:30 PM", "Upcoming event"],
    ["Books that start conversations", "7 November 2026", "3:00 PM", "Upcoming event"],
    ["Stories from the Seerah", "3 October 2026", "5:00 PM", "Recently finished"],
    ["A morning for our community", "26 September 2026", "9:00 AM", "Recently finished"],
  ])("opens %s in its shelf position and restores focus after closing", (title, date, time, status) => {
    renderCatalogue();
    const trigger = within(section("Events")).getByRole("button", { name: `Open event book: ${title}` });
    trigger.focus();
    fireEvent.click(trigger);
    const book = within(section("Events")).getByRole("region", { name: title });
    expect(book.closest("article")).toBe(trigger.closest("article"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(book).getByRole("heading", { name: title })).toBeInTheDocument();
    expect(book.querySelector(".event-book-metadata time")).toHaveTextContent(date);
    expect(within(book).getByText(time)).toBeInTheDocument();
    expect(within(book).getByText(status)).toBeInTheDocument();
    expect(within(book).getByText("Time", { selector: "dt" })).toBeInTheDocument();
    expect(within(book).queryByText("Time in Dhaka")).not.toBeInTheDocument();
    expect(within(book).queryByRole("button", { name: "Close book", exact: true })).not.toBeInTheDocument();
    if (status === "Upcoming event") {
      expect(within(book).getByRole("link", { name: "Register", exact: true })).toHaveAttribute("href", "/register");
    } else {
      expect(within(book).getByRole("button", { name: "Registration closed" })).toBeDisabled();
      expect(within(book).queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    }
    expect(within(book).getByText(/Sample programme/)).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(book).toHaveFocus();
    fireEvent.keyDown(book, { key: "Escape" });
    finishClosing();
    expect(within(section("Events")).queryByRole("region", { name: title })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports arrow keys, Home and End on the shelf", () => {
    renderCatalogue();
    const spines = within(section("Events")).getAllByRole("button", { name: /Open event book:/ });
    spines.forEach((spine) => { spine.scrollIntoView = vi.fn(); });
    spines[0].focus();
    fireEvent.keyDown(spines[0], { key: "ArrowRight" });
    expect(spines[1]).toHaveFocus();
    expect(spines[1].scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest", behavior: "auto" });
    fireEvent.keyDown(spines[1], { key: "End" });
    expect(spines[3]).toHaveFocus();
    fireEvent.keyDown(spines[3], { key: "ArrowLeft" });
    expect(spines[2]).toHaveFocus();
    fireEvent.keyDown(spines[2], { key: "Home" });
    expect(spines[0]).toHaveFocus();
  });

  it("uses the navbar wordmark when closed and round logos beside an open book", () => {
    renderCatalogue();
    const spines = within(section("Events")).getAllByRole("button", { name: /Open event book:/ });
    const shelf = spines[0].closest(".event-shelf");
    const expectLogos = (spine) => {
      const wordmark = spine.querySelector(".event-spine__wordmark");
      const roundLogo = spine.querySelector(".event-spine__round-logo");
      expect(wordmark.querySelector("img")).toHaveAttribute("src", "/logo1.png");
      expect(roundLogo).toHaveAttribute("src", "/newLogo.png");
      // A native hidden attribute wins over responsive CSS through Tailwind's preflight.
      expect(wordmark).not.toHaveAttribute("hidden");
      expect(roundLogo).not.toHaveAttribute("hidden");
    };
    spines.forEach(expectLogos);
    expect(shelf).not.toHaveClass("event-shelf--reading");
    fireEvent.click(spines[0]);
    spines.slice(1).forEach(expectLogos);
    expect(shelf).toHaveClass("event-shelf--reading");
    fireEvent.click(screen.getByRole("button", { name: "Close event book" }));
    finishClosing();
    spines.forEach(expectLogos);
    expect(shelf).not.toHaveClass("event-shelf--reading");
  });

  it("preserves each book's appearance when filtering and closes through its button", () => {
    renderCatalogue();
    const title = "Stories from the Seerah";
    let trigger = within(section("Events")).getByRole("button", { name: `Open event book: ${title}` });
    const binding = trigger.closest("article").getAttribute("style");
    fireEvent.click(within(section("Events")).getByRole("button", { name: "Finished", exact: true }));
    trigger = within(section("Events")).getByRole("button", { name: `Open event book: ${title}` });
    expect(trigger.closest("article")).toHaveAttribute("style", binding);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close event book" }));
    finishClosing();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close event book" }));
    finishClosing();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("opens only the latest chosen book when switching quickly", () => {
    renderCatalogue();
    const shelf = within(section("Events"));
    fireEvent.click(shelf.getByRole("button", { name: "Open event book: An evening of reflection" }));
    fireEvent.click(shelf.getByRole("button", { name: "Open event book: Books that start conversations" }));
    fireEvent.click(shelf.getByRole("button", { name: "Open event book: Stories from the Seerah" }));
    finishClosing();
    expect(shelf.getByRole("region", { name: "Stories from the Seerah" })).toHaveFocus();
    expect(shelf.queryByRole("region", { name: "Books that start conversations" })).not.toBeInTheDocument();
    expect(shelf.queryByRole("region", { name: "An evening of reflection" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps a book at full width while folding the cover, then collapses it before switching", () => {
    renderCatalogue();
    const shelf = within(section("Events"));
    const first = shelf.getByRole("button", { name: "Open event book: An evening of reflection" });
    const next = shelf.getByRole("button", { name: "Open event book: Books that start conversations" });
    fireEvent.click(first);
    finishOpening();
    const oldPages = shelf.getByRole("region", { name: "An evening of reflection" });
    expect(first.closest("article")).toHaveAttribute("data-book-phase", "open");
    fireEvent.click(next);
    expect(first.closest("article")).toHaveAttribute("data-book-phase", "closing");
    expect(first.closest("article")).not.toHaveClass("event-volume--collapsing");
    expect(next.closest("article")).toHaveAttribute("data-book-phase", "closed");
    act(() => vi.advanceTimersByTime(520));
    expect(first.closest("article")).toHaveClass("event-volume--collapsing");
    expect(oldPages).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(420));
    expect(oldPages).not.toBeInTheDocument();
    expect(next.closest("article")).toHaveAttribute("data-book-phase", "expanding");
    const newPages = shelf.getByRole("region", { name: "Books that start conversations" });
    expect(newPages).toHaveFocus();
    expect(newPages.querySelector(".event-book-cover__title")).toHaveTextContent("Books that start conversations");
    expect(newPages).not.toHaveTextContent("An evening of reflection");
    finishOpening();
    expect(next.closest("article")).toHaveAttribute("data-book-phase", "open");
  });

  it("creates fresh pages and a fresh cover when closing and reopening different books", () => {
    renderCatalogue();
    const shelf = within(section("Events"));
    const titles = ["An evening of reflection", "Stories from the Seerah", "Books that start conversations", "An evening of reflection"];
    let previousPages;
    titles.forEach((title) => {
      const trigger = shelf.getByRole("button", { name: `Open event book: ${title}` });
      fireEvent.click(trigger);
      const pages = shelf.getByRole("region", { name: title });
      expect(pages).not.toBe(previousPages);
      expect(pages.querySelectorAll(".event-book-cover__title")).toHaveLength(1);
      expect(pages.querySelector(".event-book-cover__title")).toHaveTextContent(title);
      expect(trigger.closest("article")).toHaveAttribute("data-book-phase", "expanding");
      finishOpening();
      expect(trigger.closest("article")).toHaveAttribute("data-book-phase", "open");
      fireEvent.click(within(pages).getByRole("button", { name: "Close event book" }));
      finishClosing();
      expect(pages).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(trigger.closest("article")).toHaveAttribute("data-book-phase", "closed");
      previousPages = pages;
    });
  });

  it("clears the open pages when changing event filters", () => {
    renderCatalogue();
    const shelf = within(section("Events"));
    fireEvent.click(shelf.getByRole("button", { name: "Open event book: An evening of reflection" }));
    fireEvent.click(shelf.getByRole("button", { name: "Finished", exact: true }));
    expect(shelf.queryByRole("region", { name: "An evening of reflection" })).not.toBeInTheDocument();
    expect(shelf.getAllByRole("button", { name: /Open event book:/ })).toHaveLength(2);
    expect(document.body.style.overflow).toBe("");
  });

  it("restores page scrolling when leaving while a book is open", () => {
    const { unmount } = renderCatalogue();
    fireEvent.click(within(section("Events")).getAllByRole("button", { name: /Open event book:/ })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Close event book" }));
    unmount();
    expect(document.body.style.overflow).toBe("");
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters each section independently and searches across all three", () => {
    renderCatalogue();
    fireEvent.click(within(section("Events")).getByRole("button", { name: "Upcoming", exact: true }));
    expect(within(section("Events")).getAllByRole("article")).toHaveLength(2);
    expect(within(section("Webinars")).getAllByRole("button", { name: /Open webinar folder:/ })).toHaveLength(4);
    fireEvent.click(within(section("Courses")).getByRole("button", { name: "Paid", exact: true }));
    expect(within(section("Courses")).getAllByRole("article")).toHaveLength(1);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "writing" } });
    expect(within(section("Events")).queryByRole("article")).not.toBeInTheDocument();
    expect(within(section("Webinars")).getByRole("heading", { name: "Writing with purpose" })).toBeVisible();
    expect(within(section("Courses")).getByRole("heading", { name: "Content writing for community work" })).toBeVisible();
    fireEvent.click(within(section("Events")).getByRole("button", { name: "Reset search and filter" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(within(section("Events")).getAllByRole("article")).toHaveLength(4);
  });
  it("opens the correct details, supports Escape and restores page scrolling", () => {
    const { container } = renderCatalogue();
    fireEvent.click(screen.getByRole("button", { name: "View details: Content writing for community work" }));
    const dialog = screen.getByRole("dialog", { name: "Content writing for community work" });
    expect(within(dialog).getByText(/no payment or enrolment is currently being collected/)).toBeVisible();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent(dialog, new Event("cancel", { bubbles: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
  });
  it("switches webinar folders inline and shows only the selected session's actions", () => {
    renderCatalogue();
    const webinars = within(section("Webinars"));
    const covers = webinars.getAllByRole("button", { name: /Open webinar folder:/ });
    expect(webinars.queryByRole("region")).not.toBeInTheDocument();
    expect(webinars.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    for (const cover of covers) {
      fireEvent.click(cover);
      const panel = webinars.getByRole("region");
      expect(panel).toHaveAttribute("id", cover.getAttribute("aria-controls"));
      expect(cover).toHaveAttribute("aria-expanded", "true");
      expect(cover).toBeDisabled();
      expect(panel).toHaveFocus();
      expect(within(panel).getByRole("heading")).toBeInTheDocument();
      expect(within(panel).getByText("Time", { selector: "dt" })).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe("");
      if (cover.textContent.includes("Finished")) {
        expect(within(panel).getByRole("button", { name: "Recording coming soon" })).toBeDisabled();
        expect(within(panel).queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
      } else {
        expect(within(panel).getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
      }
    }
    fireEvent.click(covers[0]);
    fireEvent.click(covers[1]);
    fireEvent.click(covers[0]);
    expect(webinars.getAllByRole("region")).toHaveLength(1);
    const panel = within(webinars.getByRole("region"));
    expect(panel.getByRole("heading", { name: "Faith in everyday campus life" })).toBeInTheDocument();
    expect(panel.queryByRole("heading", { name: "Writing with purpose" })).not.toBeInTheDocument();
    fireEvent.keyDown(webinars.getByRole("region"), { key: "Escape" });
    expect(webinars.queryByRole("region")).not.toBeInTheDocument();
    expect(covers[0]).toHaveFocus();
    expect(covers[0]).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(covers[1]);
    fireEvent.click(webinars.getByRole("button", { name: "Close webinar folder" }));
    expect(covers[1]).toHaveFocus();
    expect(webinars.queryByRole("region")).not.toBeInTheDocument();
  });
  it("supports keyboard navigation and selects a valid webinar after filtering", () => {
    renderCatalogue();
    const webinars = within(section("Webinars"));
    const covers = webinars.getAllByRole("button", { name: /Open webinar folder:/ });
    covers[0].focus();
    for (const [key, target] of [["ArrowDown", 1], ["End", 3], ["ArrowLeft", 2], ["Home", 0], ["ArrowUp", 3]]) {
      fireEvent.keyDown(document.activeElement, { key });
      expect(covers[target]).toHaveFocus();
      expect(covers[target]).toHaveAttribute("aria-expanded", "false");
    }
    fireEvent.click(covers[2]);
    fireEvent.click(webinars.getByRole("button", { name: "Upcoming", exact: true }));
    expect(webinars.getAllByRole("button", { name: /Open webinar folder:/ })).toHaveLength(2);
    expect(webinars.queryByRole("region")).not.toBeInTheDocument();
    expect(webinars.queryByRole("heading", { name: "Making room for reading" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "no such session" } });
    expect(webinars.queryByRole("button", { name: /Open webinar folder:/ })).not.toBeInTheDocument();
    expect(webinars.getByRole("heading", { name: "No webinars match this selection." })).toBeInTheDocument();
    fireEvent.click(webinars.getByRole("button", { name: "Reset search and filter" }));
    expect(webinars.getAllByRole("button", { name: /Open webinar folder:/ })).toHaveLength(4);
    expect(webinars.queryByRole("region")).not.toBeInTheDocument();
  });
  it("cycles the webinar covers forward one at a time and wraps to the first", () => {
    renderCatalogue();
    const webinars = within(section("Webinars"));
    const covers = webinars.getAllByRole("button", { name: /Open webinar folder:/ });
    expect(covers[0]).toHaveAttribute("aria-current", "true");
    for (const next of [1, 2, 3, 0]) {
      act(() => vi.advanceTimersByTime(5000));
      expect(webinars.getByRole("button", { name: "Next webinar folder" })).toBeDisabled();
      act(() => vi.advanceTimersByTime(350));
      expect(covers[next]).toHaveAttribute("aria-current", "true");
      expect(covers.filter((cover) => cover.hasAttribute("aria-current"))).toHaveLength(1);
      act(() => vi.advanceTimersByTime(700));
      expect(webinars.getByRole("button", { name: "Next webinar folder" })).not.toBeDisabled();
    }
    expect(webinars.queryByRole("region")).not.toBeInTheDocument();
  });
  it("pauses rotation for hover, focus and an open folder without a pause button", () => {
    renderCatalogue();
    const webinars = within(section("Webinars"));
    const covers = webinars.getAllByRole("button", { name: /Open webinar folder:/ });
    const frame = covers[0].closest(".webinar-folders");
    expect(webinars.queryByRole("button", { name: /Pause|Resume/ })).not.toBeInTheDocument();
    fireEvent.mouseEnter(frame);
    act(() => vi.advanceTimersByTime(10000));
    expect(covers[0]).toHaveAttribute("aria-current", "true");
    fireEvent.mouseLeave(frame);
    act(() => { covers[0].focus(); });
    act(() => vi.advanceTimersByTime(10000));
    expect(covers[0]).toHaveAttribute("aria-current", "true");
    act(() => { screen.getByRole("searchbox").focus(); });
    act(() => vi.advanceTimersByTime(5000));
    // Opening cancels the pending handoff, so a timer cannot replace its details.
    fireEvent.click(covers[2]);
    act(() => vi.advanceTimersByTime(10000));
    expect(webinars.getByRole("region", { name: "Making room for reading" })).toBeInTheDocument();
    expect(covers[2]).toHaveAttribute("aria-current", "true");
    expect(webinars.getByRole("button", { name: "Next webinar folder" })).toBeDisabled();
  });
  it("allows manual folder rotation and cleans up pending transitions when leaving", () => {
    const { unmount } = renderCatalogue();
    const webinars = within(section("Webinars"));
    const covers = webinars.getAllByRole("button", { name: /Open webinar folder:/ });
    fireEvent.click(webinars.getByRole("button", { name: "Next webinar folder" }));
    act(() => vi.advanceTimersByTime(350));
    act(() => vi.advanceTimersByTime(700));
    expect(covers[1]).toHaveAttribute("aria-current", "true");
    act(() => vi.advanceTimersByTime(10000));
    expect(covers[1]).toHaveAttribute("aria-current", "true");
    fireEvent.click(webinars.getByRole("button", { name: "Previous webinar folder" }));
    act(() => vi.advanceTimersByTime(350));
    act(() => vi.advanceTimersByTime(700));
    expect(covers[0]).toHaveAttribute("aria-current", "true");
    fireEvent.click(webinars.getByRole("button", { name: "Next webinar folder" }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("updates finished listings when the Dhaka day changes and cleans up the timer", () => {
    vi.setSystemTime(new Date("2026-10-24T17:59:30Z"));
    const { unmount } = renderCatalogue();
    fireEvent.click(within(section("Events")).getByRole("button", { name: "Upcoming", exact: true }));
    expect(within(section("Events")).getAllByRole("article")).toHaveLength(2);
    act(() => vi.advanceTimersByTime(60000));
    expect(within(section("Events")).getAllByRole("article")).toHaveLength(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
