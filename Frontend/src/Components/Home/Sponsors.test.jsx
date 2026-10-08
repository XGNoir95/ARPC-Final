import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Sponsors from "./Sponsors";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const selected = () => screen.getByRole("button", { pressed: true });
const advance = () => act(() => vi.advanceTimersByTime(3600));

describe("Vertical affiliations carousel", () => {
  it("automatically advances all seven affiliations and loops back to the first", () => {
    render(<Sponsors />);
    expect(selected()).toHaveTextContent("Al-Falaq");
    for (const name of ["Shomokalin", "Sean Publication", "Luncheon", "Academy for Community Development", "As-Sunnah Foundation", "Sattayan", "Al-Falaq"]) {
      advance();
      expect(selected()).toHaveTextContent(name);
    }
    expect(screen.queryByRole("button", { name: /pause/i })).not.toBeInTheDocument();
  });

  it("pauses on hover and keyboard focus, then resumes when interaction ends", () => {
    render(<Sponsors />);
    const carousel = screen.getByRole("group", { name: "Affiliations carousel" });
    fireEvent.pointerEnter(carousel);
    advance();
    expect(selected()).toHaveTextContent("Al-Falaq");
    fireEvent.pointerLeave(carousel);
    advance();
    expect(selected()).toHaveTextContent("Shomokalin");
    fireEvent.focus(selected());
    advance();
    expect(selected()).toHaveTextContent("Shomokalin");
    fireEvent.blur(selected(), { relatedTarget: null });
    advance();
    expect(selected()).toHaveTextContent("Sean Publication");
    const next = screen.getByRole("button", { name: "Next affiliation" });
    fireEvent.focus(next);
    advance();
    expect(selected()).toHaveTextContent("Sean Publication");
    fireEvent.blur(next, { relatedTarget: null });
    advance();
    expect(selected()).toHaveTextContent("Luncheon");
  });

  it("supports name selection, both direction controls and keyboard navigation", () => {
    render(<Sponsors />);
    const list = screen.getByRole("list", { name: "Affiliated organisations" });
    fireEvent.click(within(list).getByRole("button", { name: "Sean Publication" }));
    expect(selected()).toHaveTextContent("Sean Publication");
    fireEvent.click(screen.getByRole("button", { name: "Previous affiliation" }));
    expect(selected()).toHaveTextContent("Shomokalin");
    fireEvent.click(screen.getByRole("button", { name: "Next affiliation" }));
    expect(selected()).toHaveTextContent("Sean Publication");
    fireEvent.keyDown(selected(), { key: "End" });
    expect(selected()).toHaveTextContent("Sattayan");
    expect(selected()).toHaveFocus();
    fireEvent.keyDown(selected(), { key: "ArrowDown" });
    expect(selected()).toHaveTextContent("Al-Falaq");
    fireEvent.keyDown(selected(), { key: "ArrowUp" });
    expect(selected()).toHaveTextContent("Sattayan");
    fireEvent.keyDown(selected(), { key: "Home" });
    expect(selected()).toHaveTextContent("Al-Falaq");
  });

  it("holds autoplay during a touch gesture and selects the next item on an upward swipe", () => {
    const { container } = render(<Sponsors />);
    const slider = container.querySelector("#affiliations-slider");
    const down = new MouseEvent("pointerdown", { bubbles: true, clientY: 200 });
    Object.defineProperty(down, "pointerType", { value: "touch" });
    fireEvent(slider, down);
    advance();
    expect(selected()).toHaveTextContent("Al-Falaq");
    fireEvent(slider, new MouseEvent("pointerup", { bubbles: true, clientY: 100 }));
    expect(selected()).toHaveTextContent("Shomokalin");
    advance();
    expect(selected()).toHaveTextContent("Sean Publication");
  });

  it("respects reduced motion while keeping every affiliation reachable manually", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    render(<Sponsors />);
    advance();
    expect(selected()).toHaveTextContent("Al-Falaq");
    fireEvent.click(screen.getByRole("button", { name: "Previous affiliation" }));
    expect(selected()).toHaveTextContent("Sattayan");
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Affiliation 7 of 7");
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });
});
