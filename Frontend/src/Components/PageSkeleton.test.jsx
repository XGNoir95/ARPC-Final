import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import PageSkeleton from "./PageSkeleton";
import Footer from "./Footer";
import { teams } from "../data/teams";

it.each([
  ["/", ["hero", "about", "featured-events", "affiliations"]],
  ["/catalogue", ["hero", "events", "webinars", "courses"]],
  ["/team", ["hero", "teams"]],
  ["/gallery", ["hero", "gallery"]],
])("covers all primary sections on %s rather than just the header", (pathname, sections) => {
  const { container } = render(<PageSkeleton pathname={pathname} />);
  expect(Array.from(container.querySelectorAll("[data-skeleton-section]"), (node) => node.dataset.skeletonSection)).toEqual(sections);
  expect(screen.queryAllByRole("button")).toHaveLength(0);
  expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  if (pathname === "/team") expect(container.querySelectorAll("[data-skeleton-team]")).toHaveLength(teams.length);
  if (pathname === "/gallery") expect(container.querySelectorAll("[data-skeleton-photo]")).toHaveLength(7);
});

it.each([["events", "reflection-evening", 6], ["webinars", "faith-campus", 6], ["courses", "quran-reflection", 7]])("matches the %s enrollment field count", (kind, id, count) => {
  const { container } = render(<PageSkeleton pathname={`/enroll/${kind}/${id}`} />);
  expect(container.querySelector('[data-skeleton-section="enrollment-form"]')).toBeInTheDocument();
  expect(container.querySelectorAll("[data-skeleton-field]")).toHaveLength(count);
});

it("covers the quote and footer while keeping its content inaccessible until ready", () => {
  const { container, rerender } = render(<MemoryRouter><Footer loading /></MemoryRouter>);
  const footer = screen.getByRole("contentinfo");
  expect(footer).toHaveAttribute("aria-busy", "true");
  expect(container.querySelector('[data-skeleton-section="footer"]')).toBeVisible();
  expect(screen.queryByRole("link", { name: "Join ARPC" })).not.toBeInTheDocument();
  rerender(<MemoryRouter><Footer loading={false} /></MemoryRouter>);
  expect(footer).toBe(screen.getByRole("contentinfo"));
  expect(container.querySelector('[data-skeleton-section="footer"]')).not.toBeInTheDocument();
  expect(screen.getByText("Read the full reflection")).toBeVisible();
});
