import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

let desktopMedia;
let breakpointChanged;
beforeEach(() => {
  desktopMedia = { matches: false, addEventListener: vi.fn((_, listener) => { breakpointChanged = listener; }), removeEventListener: vi.fn() };
  vi.stubGlobal("matchMedia", vi.fn(() => desktopMedia));
});
afterEach(() => vi.unstubAllGlobals());

function renderNavigation() {
  return render(<MemoryRouter><Navbar blendWithHero /><Routes><Route path="/" element={<h1>Home</h1>} /><Route path="/join" element={<h1>Membership application</h1>} /></Routes></MemoryRouter>);
}

describe("Public navigation", () => {
  it("replaces account navigation with a membership action", () => {
    renderNavigation();
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(navigation).queryByRole("button", { name: /Auth|Login|Register|Profile/ })).not.toBeInTheDocument();
    fireEvent.click(within(navigation).getByRole("button", { name: "Join Us" }));
    expect(screen.getByRole("heading", { name: "Membership application" })).toBeVisible();
  });

  it("offers Join Us in the mobile menu and closes the menu when navigating", () => {
    renderNavigation();
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = document.getElementById(toggle.getAttribute("aria-controls"));
    expect(within(menu).queryByText(/Auth|Login|Register|Profile/)).not.toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("button", { name: "Join Us" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Membership application" })).toBeVisible();
  });

  it("dismisses the mobile menu with Escape and restores focus to its toggle", () => {
    renderNavigation();
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    fireEvent.click(toggle);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("dismisses the mobile menu when tapping outside navigation", () => {
    renderNavigation();
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    fireEvent.click(toggle);
    fireEvent.pointerDown(screen.getByRole("heading", { name: "Home" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("resets the mobile menu when resizing to desktop navigation", () => {
    renderNavigation();
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    fireEvent.click(toggle);
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
    desktopMedia.matches = true;
    act(() => breakpointChanged());
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    desktopMedia.matches = false;
    act(() => breakpointChanged());
    expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
  });

  it("marks the current page in the mobile menu and updates it after navigation", () => {
    renderNavigation();
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    fireEvent.click(toggle);
    let menu = document.getElementById("mobile-navigation");
    expect(within(menu).getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(within(menu).getByRole("button", { name: "Catalogue" })).not.toHaveAttribute("aria-current");
    fireEvent.click(within(menu).getByRole("button", { name: "Join Us" }));
    fireEvent.click(toggle);
    menu = document.getElementById("mobile-navigation");
    expect(within(menu).getByRole("button", { name: "Join Us" })).toHaveAttribute("aria-current", "page");
    expect(within(menu).getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
  });
});
