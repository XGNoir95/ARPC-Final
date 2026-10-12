import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GalleryJournal from "./GalleryJournal";
import { galleryPhotos } from "../data/gallery";

const preferences = vi.hoisted(() => ({ reducedMotion: false }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal(),
  useReducedMotion: () => preferences.reducedMotion,
}));

let observers;
let hidden;
const advance = (milliseconds) => act(() => vi.advanceTimersByTime(milliseconds));
const currentPhoto = (index) => screen.getByRole("button", { name: `View image: ${galleryPhotos[index].title}` });
const renderJournal = (props = {}) => render(<GalleryJournal photos={galleryPhotos} onOpen={vi.fn()} {...props} />);
const intersect = (ratio) => act(() => observers[0].callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]));
const setHidden = (value) => {
  hidden = value;
  fireEvent(document, new Event("visibilitychange"));
};

beforeEach(() => {
  vi.useFakeTimers();
  preferences.reducedMotion = false;
  hidden = false;
  observers = [];
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) {
      this.callback = callback;
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      observers.push(this);
    }
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Gallery journal slideshow", () => {
  it("gives each photo six seconds to read and completes the same folding turn as manual navigation", () => {
    renderJournal();
    intersect(1);
    const pages = screen.getByLabelText(/Photo pages/);
    advance(5999);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    advance(1);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
    expect(pages).toHaveAttribute("data-turn-phase", "fold");
    advance(240);
    expect(pages).toHaveAttribute("data-turn-phase", "unfold");
    advance(240);
    expect(pages).not.toHaveAttribute("data-turn-phase");
    advance(5999);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
    advance(1);
    expect(currentPhoto(2)).toHaveAttribute("aria-current", "true");
  });

  it("resets the reading interval after a manual turn and supports an explicit pause and resume", () => {
    renderJournal();
    intersect(1);
    advance(5000);
    fireEvent.click(screen.getByRole("button", { name: "Next journal photo" }));
    advance(480);
    advance(5999);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));
    advance(18000);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: "Play slideshow" }));
    advance(5999);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
    advance(1);
    expect(currentPhoto(2)).toHaveAttribute("aria-current", "true");
  });

  it("pauses while hovered or keyboard focused, including when focus moves between its controls", () => {
    renderJournal();
    intersect(1);
    const journal = screen.getByRole("region", { name: "Club photo journal" });
    advance(5000);
    fireEvent.mouseEnter(journal);
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    fireEvent.mouseLeave(journal);
    advance(5999);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");

    const pages = screen.getByLabelText(/Photo pages/);
    const next = screen.getByRole("button", { name: "Next journal photo" });
    act(() => pages.focus());
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    act(() => next.focus());
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    act(() => next.blur());
    advance(5999);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    advance(1);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
  });

  it("holds the selected photo while its full-image viewer is open", () => {
    const { rerender } = renderJournal();
    intersect(1);
    advance(5000);
    rerender(<GalleryJournal photos={galleryPhotos} onOpen={vi.fn()} viewerOpen />);
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    rerender(<GalleryJournal photos={galleryPhotos} onOpen={vi.fn()} viewerOpen={false} />);
    advance(5999);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    advance(1);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
  });

  it("does not advance while outside the viewport or in a hidden browser tab", () => {
    renderJournal();
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    intersect(0.34);
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    intersect(0.35);
    advance(5000);
    setHidden(true);
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    setHidden(false);
    advance(5000);
    intersect(0);
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    intersect(1);
    advance(5999);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    advance(1);
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
  });

  it("keeps reduced-motion browsing manual and immediate", () => {
    preferences.reducedMotion = true;
    renderJournal();
    intersect(1);
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    expect(screen.queryByRole("button", { name: "Pause slideshow" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next journal photo" }));
    expect(currentPhoto(1)).toHaveAttribute("aria-current", "true");
    expect(screen.getByLabelText(/Photo pages/)).not.toHaveAttribute("data-turn-phase");
  });

  it("avoids unnecessary autoplay controls for a single photo", () => {
    const open = vi.fn();
    renderJournal({ photos: galleryPhotos.slice(0, 1), onOpen: open });
    intersect(1);
    advance(18000);
    expect(currentPhoto(0)).toHaveAttribute("aria-current", "true");
    expect(screen.queryByRole("button", { name: "Pause slideshow" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next journal photo" })).not.toBeInTheDocument();
    fireEvent.click(currentPhoto(0));
    expect(open).toHaveBeenCalledWith(0, currentPhoto(0));
  });

  it("releases its viewport observer and visibility listener when removed", () => {
    const addListener = vi.spyOn(document, "addEventListener");
    const removeListener = vi.spyOn(document, "removeEventListener");
    const clearTimer = vi.spyOn(window, "clearTimeout");
    const setTimer = vi.spyOn(window, "setTimeout");
    const { unmount } = renderJournal();
    intersect(1);
    const listener = addListener.mock.calls.find(([event]) => event === "visibilitychange")[1];
    const dwellTimerIndex = setTimer.mock.calls.findLastIndex(([, milliseconds]) => milliseconds === 6000);
    const dwellTimer = setTimer.mock.results[dwellTimerIndex].value;
    expect(observers[0].observe).toHaveBeenCalledWith(screen.getByRole("region", { name: "Club photo journal" }));
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith("visibilitychange", listener);
    expect(clearTimer).toHaveBeenCalledWith(dwellTimer);
    advance(18000);
  });
});
