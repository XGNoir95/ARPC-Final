import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HijriDate from "./HijriDate";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-09T17:59:59.900Z"));
});
afterEach(() => vi.useRealTimers());

describe("Live Hijri date", () => {
  it("updates an open page at Dhaka midnight without reloading", () => {
    const { container } = render(<HijriDate />);
    const time = container.querySelector("time");
    expect(time).toHaveTextContent("28 Rabi al-Thani 1448 AH");
    expect(time).toHaveAttribute("datetime", "2026-10-09");
    act(() => vi.advanceTimersByTime(99));
    expect(time).toHaveTextContent("28 Rabi al-Thani 1448 AH");
    act(() => vi.advanceTimersByTime(26));
    expect(time).toHaveTextContent("29 Rabi al-Thani 1448 AH");
    expect(time).toHaveAttribute("datetime", "2026-10-10");
  });

  it.each(["focus", "pageshow", "visibilitychange"])("catches up immediately after %s", (event) => {
    render(<HijriDate />);
    vi.setSystemTime(new Date("2026-10-09T18:30:00Z"));
    fireEvent(event === "visibilitychange" ? document : window, new Event(event));
    expect(screen.getByText("29 Rabi al-Thani 1448 AH")).toBeVisible();
    expect(vi.getTimerCount()).toBe(1);
  });

  it("recovers from a device clock change within one minute", () => {
    vi.setSystemTime(new Date("2026-10-09T06:00:00Z"));
    render(<HijriDate />);
    vi.setSystemTime(new Date("2026-10-09T20:00:00Z"));
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByText("29 Rabi al-Thani 1448 AH")).toBeVisible();
  });

  it("cleans up timers and wake-up listeners when navigating away", () => {
    const { unmount } = render(<HijriDate />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    fireEvent(window, new Event("focus"));
    fireEvent(window, new Event("pageshow"));
    fireEvent(document, new Event("visibilitychange"));
    expect(vi.getTimerCount()).toBe(0);
  });
});
