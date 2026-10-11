import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Navbar from "./Navbar";

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
});
