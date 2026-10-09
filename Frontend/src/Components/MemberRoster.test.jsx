import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MemberRoster from "./MemberRoster";

const team = {
  id: "test-team", label: "Design Team", description: "Designs the club's event materials. Supports campus activities.",
  members: [
    { id: "amina", name: "Amina", role: "Lead", department: "Architecture", image: "/member.svg", linkedin: "https://www.linkedin.com/in/amina-test", github: "https://github.com/amina-test" },
    { id: "rafi", name: "Rafi", department: "Computer Science", image: "/member.svg" },
  ],
};
const memberButton = () => screen.getByRole("button", { name: "View profile: Amina, Lead" });
const profile = () => screen.queryByRole("region", { name: "Amina, Lead profile" });
const pointer = (element, type, pointerType = "mouse") => {
  const event = new MouseEvent(type, { bubbles: true, buttons: 0 });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(element, event);
};
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("Member roster profiles", () => {
  it("replaces the accessible roster with only the clicked member's details", () => {
    render(<MemberRoster team={team} />);
    fireEvent.click(memberButton());
    expect(profile()).toBeVisible();
    expect(within(profile()).getByRole("heading", { name: "Amina" })).toBeVisible();
    expect(within(profile()).getByText("Lead")).toBeVisible();
    expect(within(profile()).getByText("Architecture")).toBeVisible();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /View profile: Rafi/ })).not.toBeInTheDocument();
  });

  it("keeps a clicked profile open through mouse exit and scrolling", () => {
    const { container } = render(<MemberRoster team={team} />);
    const wrapper = container.firstChild;
    fireEvent.click(memberButton());
    pointer(wrapper, "pointerout");
    advance(100);
    pointer(profile(), "pointermove");
    advance(200);
    expect(profile()).toBeVisible();
    pointer(wrapper, "pointerout");
    fireEvent.scroll(window);
    advance(1000);
    expect(profile()).toBeVisible();
  });

  it("never expands from mouse hover, focus, touch movement or scrolling", () => {
    render(<MemberRoster team={team} />);
    pointer(memberButton(), "pointerover");
    pointer(memberButton(), "pointermove", "touch");
    advance(200);
    expect(profile()).not.toBeInTheDocument();
    pointer(memberButton(), "pointermove");
    fireEvent.focus(memberButton());
    fireEvent.scroll(window);
    advance(200);
    expect(profile()).not.toBeInTheDocument();
    pointer(memberButton(), "pointermove");
    pointer(memberButton(), "pointerout");
    advance(200);
    expect(profile()).not.toBeInTheDocument();
  });

  it("supports activation, moves focus into the profile, and restores focus on return", () => {
    const { container } = render(<MemberRoster team={team} />);
    const trigger = memberButton();
    fireEvent.click(trigger);
    expect(screen.getByRole("button", { name: "All members" })).toHaveFocus();
    pointer(container.firstChild, "pointerout");
    advance(200);
    expect(profile()).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "All members" }));
    expect(trigger).toHaveFocus();
    expect(profile()).not.toBeInTheDocument();
    pointer(trigger, "pointermove");
    advance(200);
    expect(profile()).not.toBeInTheDocument();
  });

  it("handles Escape locally so the surrounding team stays open", () => {
    const parentKeyDown = vi.fn();
    render(<div onKeyDown={parentKeyDown}><MemberRoster team={team} /></div>);
    fireEvent.click(memberButton());
    fireEvent.keyDown(screen.getByRole("button", { name: "All members" }), { key: "Escape" });
    expect(profile()).not.toBeInTheDocument();
    expect(memberButton()).toHaveFocus();
    expect(parentKeyDown).not.toHaveBeenCalled();
  });

  it("supports touch activation and notifies the enclosing team to stay open", () => {
    const onOpen = vi.fn();
    render(<MemberRoster team={team} onOpen={onOpen} />);
    const trigger = memberButton();
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.click(trigger);
    expect(onOpen).toHaveBeenCalledOnce();
    const back = screen.getByRole("button", { name: "All members" });
    fireEvent.keyDown(back, { key: "Escape" });
    expect(trigger).toHaveFocus();
    expect(profile()).not.toBeInTheDocument();
  });

  it("shows social links when provided and does not invent URLs for missing profiles", () => {
    render(<MemberRoster team={team} />);
    fireEvent.click(memberButton());
    expect(within(profile()).getByRole("link", { name: "Amina on LinkedIn" })).toHaveAttribute("href", team.members[0].linkedin);
    expect(within(profile()).getByRole("link", { name: "Amina on GitHub" })).toHaveAttribute("href", team.members[0].github);
    fireEvent.click(screen.getByRole("button", { name: "All members" }));
    fireEvent.click(screen.getByRole("button", { name: /View profile: Rafi/ }));
    const details = screen.getByRole("region", { name: "Rafi, Design Team profile" });
    expect(within(details).getByRole("img", { name: "LinkedIn profile unavailable" })).toBeInTheDocument();
    expect(within(details).getByRole("img", { name: "GitHub profile unavailable" })).toBeInTheDocument();
    expect(within(details).queryByRole("link")).not.toBeInTheDocument();
    expect(within(details).queryByText("Team focus")).not.toBeInTheDocument();
  });
});
