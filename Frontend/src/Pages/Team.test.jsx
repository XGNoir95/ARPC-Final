import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TeamPage from "./Team";

const renderTeam = () => render(<MemoryRouter><TeamPage /></MemoryRouter>);
const card = (name) => screen.getByRole("article", { name });
const trigger = (name) => within(card(name)).getByRole("button", { name: /^(View team|Close team):/ });
const pointer = (name, type, pointerType = "mouse") => {
  const event = new MouseEvent(type, { bubbles: true, buttons: 0 });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(card(name), event);
};
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Panel team directory", () => {
  it("starts with seven overviews and explicit View team controls", () => {
    renderTeam();
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(7);
    expect(screen.getAllByText("View team")).toHaveLength(7);
    expect(screen.queryAllByRole("region", { name: /members$/ })).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 1, name: /The teams.*behind ARPC\s*\./ })).toBeVisible();
  });

  it("opens on activation and closes on a second activation", () => {
    renderTeam();
    const control = trigger("Executive Committee");
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-expanded", "true");
    expect(within(control).getByText("Close team")).toBeInTheDocument();
    const roster = screen.getByRole("region", { name: "Executive Committee members" });
    expect(within(roster).getAllByRole("listitem")).toHaveLength(4);
    expect(within(roster).getByText("President")).toBeInTheDocument();
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(within(card("Executive Committee")).getByText(/The committee gives our shared ideas/).closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "false");
    expect(screen.queryAllByRole("region", { name: /members$/ })).toHaveLength(0);
  });

  it("keeps an intentionally opened roster through mouse exit, scrolling and focus changes", () => {
    renderTeam();
    const control = trigger("Dawah Team");
    fireEvent.click(control);
    pointer("Dawah Team", "pointerout");
    fireEvent.scroll(window);
    fireEvent.blur(control, { relatedTarget: trigger("Graphics Team") });
    fireEvent.keyDown(document, { key: "Tab" });
    fireEvent.blur(window);
    expect(control).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "false");
  });

  it("opens on deliberate mouse hover and restores the overview on exit", () => {
    renderTeam();
    pointer("Graphics Team", "pointermove");
    advance(119);
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "false");
    advance(1);
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "true");
    pointer("Graphics Team", "pointerout");
    advance(180);
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "false");
  });

  it("does not open from stationary pointer entry, focus, touch movement or scrolling", () => {
    renderTeam();
    pointer("Graphics Team", "pointerover");
    fireEvent.focus(trigger("Graphics Team"));
    pointer("Graphics Team", "pointermove", "touch");
    advance(500);
    expect(screen.queryAllByRole("region", { name: /members$/ })).toHaveLength(0);
    pointer("Graphics Team", "pointermove");
    fireEvent.scroll(window);
    advance(500);
    expect(screen.queryAllByRole("region", { name: /members$/ })).toHaveLength(0);
  });

  it("cancels quick passes and keeps the roster open when the mouse returns during exit grace", () => {
    renderTeam();
    pointer("Dawah Team", "pointermove");
    pointer("Dawah Team", "pointerout");
    advance(200);
    expect(trigger("Dawah Team")).toHaveAttribute("aria-expanded", "false");
    pointer("Dawah Team", "pointermove");
    advance(120);
    pointer("Dawah Team", "pointerout");
    advance(100);
    pointer("Dawah Team", "pointermove");
    advance(200);
    expect(trigger("Dawah Team")).toHaveAttribute("aria-expanded", "true");
  });

  it("switches hover directly to the next team and allows Escape without immediate reopening", () => {
    renderTeam();
    pointer("Dawah Team", "pointermove");
    advance(120);
    pointer("Dawah Team", "pointerout");
    pointer("Graphics Team", "pointermove");
    advance(120);
    expect(trigger("Dawah Team")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    pointer("Graphics Team", "pointermove");
    advance(200);
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "false");
    pointer("Graphics Team", "pointerout");
    pointer("Graphics Team", "pointermove");
    advance(120);
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "true");
  });

  it("switches directly between teams with only one roster open", () => {
    renderTeam();
    fireEvent.click(trigger("Dawah Team"));
    fireEvent.click(trigger("Graphics Team"));
    expect(trigger("Dawah Team")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Graphics Team")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("region", { name: /members$/ })).toHaveLength(1);
    expect(within(screen.getByRole("region", { name: "Graphics Team members" })).getAllByRole("listitem")).toHaveLength(5);
  });

  it("supports touch activation with the same persistent behavior", () => {
    renderTeam();
    const control = trigger("Dawah Team");
    fireEvent.pointerDown(control, { pointerType: "touch" });
    fireEvent.click(control);
    fireEvent.pointerOut(card("Dawah Team"), { pointerType: "touch" });
    fireEvent.scroll(window);
    expect(control).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-expanded", "false");
  });

  it("allows Escape dismissal even after focus or the pointer has moved away", () => {
    renderTeam();
    fireEvent.click(trigger("Web Development Team"));
    fireEvent.blur(trigger("Web Development Team"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryAllByRole("region", { name: /members$/ })).toHaveLength(0);
    expect(trigger("Web Development Team")).toHaveAttribute("aria-expanded", "false");
  });

  it("uses native buttons with synchronized expansion state and controlled regions", () => {
    renderTeam();
    const control = trigger("Social Media & Content Writing Team");
    expect(control.tagName).toBe("BUTTON");
    expect(control).toHaveAttribute("type", "button");
    expect(control).toHaveAttribute("aria-controls", "social-media-members");
    fireEvent.click(control);
    const region = screen.getByRole("region", { name: "Social Media & Content Writing Team members" });
    expect(region).toHaveAttribute("id", control.getAttribute("aria-controls"));
    expect(region).not.toHaveAttribute("inert");
    fireEvent.click(control);
    expect(region).toHaveAttribute("inert");
    expect(region).toHaveAttribute("aria-hidden", "true");
  });

  it("resets a member profile when its team is closed and reopened", () => {
    renderTeam();
    fireEvent.click(trigger("Executive Committee"));
    fireEvent.click(screen.getByRole("button", { name: "View profile: Sample Member, President" }));
    expect(screen.getByRole("region", { name: "Sample Member, President profile" })).toBeVisible();
    fireEvent.click(trigger("Executive Committee"));
    fireEvent.click(trigger("Executive Committee"));
    expect(screen.queryByRole("region", { name: "Sample Member, President profile" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View profile: Sample Member, President" })).toBeVisible();
  });

  it("keeps a team opened by hover visible after a member is clicked and the mouse leaves", () => {
    renderTeam();
    pointer("Executive Committee", "pointermove");
    advance(120);
    fireEvent.click(screen.getByRole("button", { name: "View profile: Sample Member, President" }));
    pointer("Executive Committee", "pointerout");
    fireEvent.scroll(window);
    advance(1000);
    expect(trigger("Executive Committee")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Sample Member, President profile" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "All members" }));
    expect(screen.getByRole("button", { name: "View profile: Sample Member, President" })).toBeVisible();
    expect(trigger("Executive Committee")).toHaveAttribute("aria-expanded", "true");
  });
});
