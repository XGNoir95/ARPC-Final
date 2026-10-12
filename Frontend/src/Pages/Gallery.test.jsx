import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Gallery from "./Gallery";
import GalleryJournal from "../Components/GalleryJournal";
import { galleryPhotos } from "../data/gallery";

const renderGallery = () => render(<MemoryRouter><Gallery /></MemoryRouter>);
const imageButtons = () => screen.getAllByRole("button", { name: /^(View image|Show photo):/ });
afterEach(() => { cleanup(); document.body.style.overflow = ""; vi.useRealTimers(); vi.restoreAllMocks(); });

describe("Club gallery", () => {
  it("uses local images and distinguishes illustrative photos from club artwork", () => {
    const { container } = renderGallery();
    expect(container.querySelector("header img")).toHaveAttribute("src", `${import.meta.env.BASE_URL}heroBanner.jpg`);
    expect(imageButtons()).toHaveLength(galleryPhotos.length);
    expect(screen.queryByRole("group", { name: "Gallery categories" })).not.toBeInTheDocument();
    expect(container.querySelector('[role="status"] > div:not([aria-hidden])')).toHaveTextContent("Illustrative photo");
    expect(screen.getAllByRole("img")).toHaveLength(galleryPhotos.length);
    expect(screen.queryByText(galleryPhotos[0].description)).not.toBeInTheDocument();
  });

  it("uses one playback control group and opens the selected photo directly", () => {
    renderGallery();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getAllByRole("group", { name: "Album playback" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: `Show photo: ${galleryPhotos[3].title}` }));
    expect(screen.getAllByRole("img")).toHaveLength(galleryPhotos.length);
    expect(screen.queryByRole("button", { name: "View photo" })).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: `View image: ${galleryPhotos[3].title}` });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: galleryPhotos[3].title })).toBeVisible();
    expect(within(screen.getByRole("dialog")).getByText(galleryPhotos[3].description)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close image viewer" }));
    expect(trigger).toHaveFocus();
  });

  it("opens the selected photo, moves focus into the viewer and restores it on close", () => {
    renderGallery();
    const trigger = imageButtons()[0];
    document.body.style.overflow = "auto";
    fireEvent.click(trigger);
    const viewer = screen.getByRole("dialog", { name: galleryPhotos[0].title });
    expect(within(viewer).getByRole("img")).toHaveAttribute("src", `${import.meta.env.BASE_URL}heroBanner.jpg`);
    const close = within(viewer).getByRole("button", { name: "Close image viewer" });
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(close);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("browses the complete album, supports arrow keys and wraps at either end", () => {
    renderGallery();
    const photos = galleryPhotos;
    fireEvent.click(imageButtons()[0]);
    let viewer = screen.getByRole("dialog");
    fireEvent.keyDown(viewer, { key: "ArrowLeft" });
    expect(screen.getByRole("dialog", { name: photos.at(-1).title })).toBeVisible();
    fireEvent.keyDown(viewer, { key: "ArrowRight" });
    viewer = screen.getByRole("dialog", { name: photos[0].title });
    fireEvent.click(within(viewer).getByRole("button", { name: "Next image" }));
    expect(screen.getByRole("dialog", { name: photos[1].title })).toBeVisible();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on native Escape cancellation or an outside click, but keeps inside clicks open", () => {
    renderGallery();
    const trigger = imageButtons()[0];
    fireEvent.click(trigger);
    let viewer = screen.getByRole("dialog");
    fireEvent.click(within(viewer).getByRole("heading"));
    expect(viewer).toBeInTheDocument();
    fireEvent(viewer, new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    viewer = screen.getByRole("dialog");
    fireEvent.click(viewer, { clientX: -10, clientY: -10 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("releases the viewer scroll lock on unmount", () => {
    const { unmount } = renderGallery();
    fireEvent.click(imageButtons()[0]);
    expect(screen.getByRole("dialog")).toBeVisible();
    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("jumps to the photo archive without rewriting the route hash", () => {
    renderGallery();
    const target = document.getElementById("gallery-moments");
    target.scrollIntoView = vi.fn();
    const hash = window.location.hash;
    fireEvent.click(screen.getByRole("button", { name: "Explore the gallery" }));
    expect(target.scrollIntoView).toHaveBeenCalledOnce();
    expect(window.location.hash).toBe(hash);
  });

  it("brings a side page forward before opening it, preserving the photo identity", () => {
    renderGallery();
    const page = screen.getByRole("button", { name: `Show photo: ${galleryPhotos[3].title}` });
    fireEvent.click(page);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: `View image: ${galleryPhotos[3].title}` })).toBe(page);
    fireEvent.click(page);
    expect(screen.getByRole("dialog", { name: galleryPhotos[3].title })).toBeVisible();
  });

  it("turns journal pages with the controls and keyboard and wraps at either end", () => {
    renderGallery();
    const journal = screen.getByRole("region", { name: "Club photo journal" });
    const pages = within(journal).getByLabelText(/Photo pages/);
    fireEvent.click(within(journal).getByRole("button", { name: "Previous journal photo" }));
    expect(within(journal).getByRole("button", { name: `View image: ${galleryPhotos.at(-1).title}` })).toHaveAttribute("aria-current", "true");
    fireEvent.keyDown(pages, { key: "ArrowRight" });
    expect(within(journal).getByRole("button", { name: `View image: ${galleryPhotos[0].title}` })).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(pages, { key: "End" });
    expect(within(journal).getByRole("heading")).toHaveTextContent(galleryPhotos.at(-1).title);
    fireEvent.keyDown(pages, { key: "Home" });
    fireEvent.click(within(journal).getByRole("button", { name: "Next journal photo" }));
    expect(within(journal).getByRole("heading")).toHaveTextContent(galleryPhotos[1].title);
    fireEvent.keyDown(screen.getByLabelText(/Photo pages/), { key: "Home" });
    expect(screen.getByRole("button", { name: `View image: ${galleryPhotos[0].title}` })).toBeVisible();
  });

  it("swipes horizontally without accidentally opening a viewer and leaves vertical scrolling alone", () => {
    renderGallery();
    const pages = screen.getByLabelText(/Photo pages/);
    const pointer = (type, x, y) => {
      const event = new Event(type, { bubbles: true });
      Object.assign(event, { clientX: x, clientY: y, pointerId: 1, pointerType: "touch", isPrimary: true });
      fireEvent(pages, event);
    };
    pointer("pointerdown", 200, 100);
    pointer("pointerup", 80, 105);
    const next = screen.getByRole("button", { name: `View image: ${galleryPhotos[1].title}` });
    fireEvent.click(next);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    pointer("pointerdown", 200, 100);
    pointer("pointerup", 190, 220);
    expect(next).toHaveAttribute("aria-current", "true");
    fireEvent.click(next);
    expect(screen.getByRole("dialog", { name: galleryPhotos[1].title })).toBeVisible();
  });

  it("keeps both folded halves on the correct photo during rapid turns and keyboard jumps", () => {
    vi.useFakeTimers();
    const { container } = renderGallery();
    const next = screen.getByRole("button", { name: "Next journal photo" });
    fireEvent.click(next);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.click(next);
    const page = screen.getByRole("button", { name: `View image: ${galleryPhotos[2].title}` });
    const halves = page.querySelectorAll("[data-page-half] img");
    expect(halves).toHaveLength(2);
    for (const half of halves) expect(half).toHaveAttribute("src", `${import.meta.env.BASE_URL}${galleryPhotos[2].image.slice(1)}`);
    act(() => vi.advanceTimersByTime(350));
    expect(container.querySelector("[data-folding=true]")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(200));
    expect(container.querySelector("[data-folding=true]")).not.toBeInTheDocument();
    fireEvent.click(next);
    fireEvent.keyDown(screen.getByLabelText(/Photo pages/), { key: "Home" });
    act(() => vi.advanceTimersByTime(800));
    const campus = screen.getByRole("button", { name: `View image: ${galleryPhotos[0].title}` });
    expect(campus.querySelectorAll("[data-page-half]")).toHaveLength(2);
    expect(container.querySelector("[data-folding=true]")).not.toBeInTheDocument();
    fireEvent.click(campus);
    expect(screen.getByRole("dialog", { name: galleryPhotos[0].title })).toBeVisible();
  });

  it("loops a two-photo album without exposing decorative copies or opening the wrong photo", () => {
    vi.useFakeTimers();
    const learning = galleryPhotos.filter((photo) => photo.category === "Learning");
    const onOpen = vi.fn();
    render(<GalleryJournal photos={learning} onOpen={onOpen} />);
    for (const expected of [learning[1], learning[0], learning[1]]) {
      fireEvent.click(screen.getByRole("button", { name: "Next journal photo" }));
      act(() => vi.advanceTimersByTime(500));
      expect(imageButtons()).toHaveLength(2);
      expect(screen.getAllByRole("img")).toHaveLength(2);
      const selected = screen.getByRole("button", { name: `View image: ${expected.title}` });
      fireEvent.click(selected);
      expect(onOpen).toHaveBeenLastCalledWith(learning.indexOf(expected), selected);
    }
    fireEvent.click(screen.getByRole("button", { name: "Previous journal photo" }));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole("button", { name: `View image: ${learning[0].title}` })).toBeVisible();
  });
});
