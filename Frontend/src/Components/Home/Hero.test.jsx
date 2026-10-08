import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Hero from "./Hero";

const mockMedia = ({ reducedMotion = false, desktop = false } = {}) => {
  const listeners = new Map();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query) => ({
      matches: query.includes("reduced-motion") ? reducedMotion : desktop,
      addEventListener: (_, listener) => listeners.set(query, listener),
      removeEventListener: (_, listener) => {
        if (listeners.get(query) === listener) listeners.delete(query);
      },
    })),
  );
  return listeners;
};

afterEach(() => vi.useRealTimers());

describe("Hero photos", () => {
  it("offers exactly three numbered photos and selects them manually", () => {
    render(<Hero />);
    const controls = screen.getByRole("group", { name: "Hero photos" });
    expect(within(controls).getAllByRole("button")).toHaveLength(3);
    expect(
      within(controls).getAllByRole("button", { pressed: false }),
    ).toHaveLength(2);
    expect(screen.queryByText("Start")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "03: Learning" }));
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      "Learning",
    );
    expect(screen.getByText("Photo 3 of 3: Learning")).toBeInTheDocument();
    expect(
      within(controls).getAllByRole("button", { pressed: true }),
    ).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "01: AUST campus" }));
    expect(screen.getByText("Photo 1 of 3: AUST campus")).toBeInTheDocument();
  });

  it("supports arrow keys, Home, and End without losing slider focus", () => {
    render(<Hero />);
    fireEvent.keyDown(screen.getByRole("button", { name: "01: AUST campus" }), {
      key: "ArrowRight",
    });
    expect(screen.getByRole("button", { name: "02: Community" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement, { key: "End" });
    expect(screen.getByRole("button", { name: "03: Learning" })).toHaveFocus();
    const slider = screen.getByRole("slider");
    act(() => slider.focus());
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    expect(slider).toHaveFocus();
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider).toHaveAttribute("aria-valuenow", "2");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
  });

  it.each([false, true])(
    "drags the rail and clamps its edges (desktop: %s)",
    (desktop) => {
      mockMedia({ desktop });
      render(<Hero />);
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute(
        "aria-orientation",
        desktop ? "vertical" : "horizontal",
      );
      slider.setPointerCapture = vi.fn();
      vi.spyOn(slider, "getBoundingClientRect").mockReturnValue({
        top: 100,
        left: 100,
        height: 240,
        width: 240,
      });
      const pointer = (type, position) => {
        const event = new MouseEvent(type, {
          bubbles: true,
          button: 0,
          clientY: position,
          clientX: position,
        });
        Object.defineProperty(event, "pointerId", { value: 1 });
        fireEvent(slider, event);
      };
      pointer("pointerdown", 180);
      expect(slider).toHaveAttribute("aria-valuenow", "1");
      pointer("pointermove", 999);
      expect(slider).toHaveAttribute("aria-valuenow", "2");
      pointer("pointerup", 999);
      pointer("pointermove", 100);
      expect(slider).toHaveAttribute("aria-valuenow", "2");
      pointer("pointerdown", -10);
      expect(slider).toHaveAttribute("aria-valuenow", "0");
      pointer("pointercancel", -10);
      pointer("pointermove", 300);
      expect(slider).toHaveAttribute("aria-valuenow", "0");
    },
  );

  it("updates the rail orientation when the viewport crosses the desktop breakpoint", () => {
    const listeners = mockMedia();
    render(<Hero />);
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    act(() => listeners.get("(min-width: 1024px)")({ matches: true }));
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("advances every six seconds, loops, restarts after selection, and clears its timer", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Hero />);
    const slider = screen.getByRole("slider");
    for (const index of [1, 2, 0]) {
      act(() => vi.advanceTimersByTime(6000));
      expect(slider).toHaveAttribute("aria-valuenow", String(index));
    }
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(screen.getByRole("button", { name: "01: AUST campus" }));
    act(() => vi.advanceTimersByTime(5999));
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    act(() => vi.advanceTimersByTime(1));
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("pauses during interaction and while the tab is hidden, then resumes cycling", () => {
    vi.useFakeTimers();
    render(<Hero />);
    const slider = screen.getByRole("slider");
    fireEvent.mouseEnter(slider.parentElement);
    act(() => vi.advanceTimersByTime(12000));
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    fireEvent.mouseLeave(slider.parentElement);
    act(() => vi.advanceTimersByTime(6000));
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    act(() => slider.focus());
    act(() => vi.advanceTimersByTime(12000));
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    act(() => slider.blur());

    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    act(() => vi.advanceTimersByTime(12000));
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    act(() => vi.advanceTimersByTime(6000));
    expect(slider).toHaveAttribute("aria-valuenow", "2");
  });

  it("keeps manual selection available without autoplay when reduced motion is preferred", () => {
    vi.useFakeTimers();
    mockMedia({ reducedMotion: true });
    render(<Hero />);
    act(() => vi.advanceTimersByTime(18000));
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0");
    expect(
      screen.queryByRole("button", { name: "Pause slideshow" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "03: Learning" }));
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "2");
  });
});

describe("Discover ARPC", () => {
  it.each([
    { reducedMotion: false, behavior: "smooth" },
    { reducedMotion: true, behavior: "auto" },
  ])(
    "is the single CTA and scrolls to About with $behavior scrolling",
    ({ reducedMotion, behavior }) => {
      mockMedia({ reducedMotion });
      render(
        <>
          <Hero />
          <section id="about" aria-label="About ARPC" />
        </>,
      );
      const scrollIntoView = vi.fn();
      screen.getByRole("region", { name: "About ARPC" }).scrollIntoView =
        scrollIntoView;
      expect(
        screen.queryByRole("link", { name: "Join us today!" }),
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Discover ARPC" }));
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior, block: "start" });
    },
  );
});
