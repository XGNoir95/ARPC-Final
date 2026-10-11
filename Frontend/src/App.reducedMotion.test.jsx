import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => window.history.replaceState(null, "", "/"));

describe("Navigation with reduced motion", () => {
  it("keeps the skeleton delay while skipping the crossfade, and transfers keyboard focus", async () => {
    vi.stubEnv("VITE_GITHUB_PAGES", "false");
    vi.stubEnv("BASE_URL", "/");
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal("Image", class { complete = true });
    vi.stubGlobal("matchMedia", vi.fn((query) => ({
      matches: query.includes("prefers-reduced-motion"),
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    window.history.replaceState(null, "", "/catalogue");
    render(<App />);
    fireEvent.click(within(screen.getByRole("navigation", { name: "Main navigation" })).getAllByRole("button", { name: "Panel", exact: true })[0]);
    expect(document.querySelector('[data-page-skeleton]')).toBeVisible();
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    await waitFor(() => expect(screen.getByRole("heading", { name: /The teams.*behind.*ARPC/ })).toBeVisible(), { timeout: 4000 });
    expect(screen.getByRole("main").firstElementChild).toHaveStyle({ opacity: "1" });
    expect(document.querySelector('[data-page-skeleton]')).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveFocus();
  });
});
