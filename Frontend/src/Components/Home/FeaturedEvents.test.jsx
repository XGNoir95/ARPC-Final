import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeaturedEvents from "./FeaturedEvents";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const renderEvents = () => render(<MemoryRouter><FeaturedEvents /></MemoryRouter>);
const advance = () => act(() => vi.advanceTimersByTime(6000));
const selected = () => screen.getByRole("button", { pressed: true });

describe("Featured events carousel", () => {
  it("cycles through all events while exposing only the active card", () => {
    renderEvents();
    expect(selected()).toHaveAccessibleName("Go to event 1");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Register now" })).toHaveLength(1);
    advance();
    expect(screen.getByRole("status")).toHaveTextContent("Event 2 of 3: Tafsir & Reflection Circle");
    advance();
    expect(screen.getByRole("status")).toHaveTextContent("Event 3 of 3: Seerah Storytelling Evening");
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 1");
  });

  it("supports both directions, numbered selection and keyboard focus", () => {
    renderEvents();
    fireEvent.click(screen.getByRole("button", { name: "Previous event" }));
    expect(selected()).toHaveAccessibleName("Go to event 3");
    fireEvent.click(screen.getByRole("button", { name: "Next event" }));
    expect(selected()).toHaveAccessibleName("Go to event 1");
    fireEvent.click(screen.getByRole("button", { name: "Go to event 2" }));
    fireEvent.keyDown(selected(), { key: "ArrowRight" });
    expect(selected()).toHaveAccessibleName("Go to event 3");
    expect(selected()).toHaveFocus();
    fireEvent.keyDown(selected(), { key: "ArrowRight" });
    expect(selected()).toHaveAccessibleName("Go to event 1");
    fireEvent.keyDown(selected(), { key: "End" });
    expect(selected()).toHaveAccessibleName("Go to event 3");
    fireEvent.keyDown(selected(), { key: "Home" });
    expect(selected()).toHaveAccessibleName("Go to event 1");
  });

  it("pauses during hover or focus and resumes after interaction", () => {
    renderEvents();
    const carousel = screen.getByRole("group", { name: "Featured events carousel" });
    fireEvent.pointerEnter(carousel);
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 1");
    fireEvent.pointerLeave(carousel);
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 2");
    fireEvent.focus(screen.getByRole("link", { name: "Register now" }));
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 2");
    fireEvent.blur(screen.getByRole("link", { name: "Register now" }), { relatedTarget: null });
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 3");
  });

  it("respects reduced motion while retaining manual controls", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    renderEvents();
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 1");
    fireEvent.click(screen.getByRole("button", { name: "Next event" }));
    expect(selected()).toHaveAccessibleName("Go to event 2");
  });

  it("holds autoplay during touch and ignores vertical scrolling gestures", () => {
    const { container } = renderEvents();
    const slider = container.querySelector("#featured-events-slider");
    const down = () => {
      const event = new MouseEvent("pointerdown", { bubbles: true, clientX: 220, clientY: 200 });
      Object.defineProperty(event, "pointerType", { value: "touch" });
      fireEvent(slider, event);
    };
    down();
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 1");
    fireEvent(slider, new MouseEvent("pointerup", { bubbles: true, clientX: 70, clientY: 190 }));
    expect(selected()).toHaveAccessibleName("Go to event 2");
    down();
    fireEvent(slider, new MouseEvent("pointerup", { bubbles: true, clientX: 210, clientY: 60 }));
    expect(selected()).toHaveAccessibleName("Go to event 2");
    advance();
    expect(selected()).toHaveAccessibleName("Go to event 3");
  });

  it("opens the existing registration route from the active event", () => {
    render(<MemoryRouter><Routes><Route path="/" element={<FeaturedEvents />} /><Route path="/register" element={<h1>Registration</h1>} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole("link", { name: "Register now" }));
    expect(screen.getByRole("heading", { name: "Registration" })).toBeVisible();
  });
});
