import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Catalogue from "../Pages/Catalogue";

afterEach(() => {
  cleanup();
});

it("opens and closes readable book pages without a 3D flip when reduced motion is requested", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: true, addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
  const { container } = render(<MemoryRouter><Catalogue /></MemoryRouter>);
  const trigger = screen.getByRole("button", { name: "Open event book: An evening of reflection" });
  fireEvent.click(trigger);
  const book = screen.getByRole("region", { name: "An evening of reflection" });
  expect(within(book).getByRole("heading", { name: "An evening of reflection" })).toBeVisible();
  expect(book.closest("article")).toBe(trigger.closest("article"));
  expect(container.querySelector(".event-book-cover")).not.toBeInTheDocument();
  fireEvent.click(within(book).getByRole("button", { name: "Close event book" }));
  expect(screen.queryByRole("region", { name: "An evening of reflection" })).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe("");
  expect(trigger).toHaveFocus();
});
