import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { post } from "../utils/api";
vi.mock("../utils/api",()=>({post:vi.fn()}));
beforeEach(()=>post.mockResolvedValue({id:"enrollment-1",message:"Enrollment received."}));
import Enrollment from "./Enrollment";
import { catalogue } from "../data/catalogue";
import { featuredEvents } from "../data/featuredEvents";

function renderEnrollment(kind, id) {
  return render(<MemoryRouter initialEntries={[`/enroll/${kind}/${id}`]}><Routes><Route path="/enroll/:kind/:id" element={<Enrollment />} /></Routes></MemoryRouter>);
}
function fillDetails(course = false) {
  const fields = { "Full name": " Test Student ", "Student ID": "202601001", "Email address": "student@example.com" };
  if (course) fields["Mobile number"] = "+880 1712345678";
  Object.entries(fields).forEach(([label, value]) => fireEvent.change(screen.getByRole("textbox", { name: label }), { target: { value } }));
  fireEvent.change(screen.getByRole("combobox", { name: "Department" }), { target: { value: "Architecture" } });
  fireEvent.change(screen.getByRole("combobox", { name: "Semester" }), { target: { value: "5.2" } });
  fireEvent.change(screen.getByRole("combobox", { name: "Gender" }), { target: { value: "Prefer not to say" } });
}

describe("Programme enrollment", () => {
  it.each(Object.entries(catalogue).flatMap(([kind, items]) => items.map((item) => [kind, item.id, item.title])))("opens the unique %s page for %s", (kind, id, title) => {
    renderEnrollment(kind, id);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
    const hero = screen.getByRole("heading", { level: 1 }).closest("header");
    expect(within(hero).getByText(catalogue[kind].find((item) => item.id === id).description)).toBeVisible();
    const form = screen.getByRole("form", { name: "Your enrollment details" });
    expect(within(form).getAllByRole("textbox")).toHaveLength(kind === "courses" ? 4 : 3);
    expect(within(form).getAllByRole("combobox")).toHaveLength(3);
    expect(Boolean(screen.queryByRole("textbox", { name: "Mobile number" }))).toBe(kind === "courses");
    expect(within(form).getByRole("group", { name: "Student information" })).toBeVisible();
    expect(within(form).getByRole("group", { name: "Contact information" })).toBeVisible();
  });

  it.each(featuredEvents.map((item) => [item.id, item.title]))("opens featured event %s with the matching title", (id, title) => {
    renderEnrollment("events", `featured-${id}`);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title);
    expect(screen.getByRole("form")).toBeVisible();
  });

  it.each(["events", "webinars", "courses"])("validates %s fields, focuses errors, and submits the required data", async (kind) => {
    const item = catalogue[kind][0];
    renderEnrollment(kind, item.id);
    fireEvent.click(screen.getByRole("button", { name: "Review enrollment" }));
    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    expect(within(summary).getAllByRole("link")).toHaveLength(kind === "courses" ? 7 : 6);
    fireEvent.click(within(summary).getByRole("link", { name: "Enter your full name." }));
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
    fillDetails(kind === "courses");
    fireEvent.click(screen.getByRole("button", { name: "Review enrollment" }));
    expect(screen.getByRole("heading", { name: "Review your enrollment" })).toHaveFocus();
    expect(screen.getByText(/submit your enrollment for club approval/)).toBeVisible();
    const programme = screen.getByRole("complementary", { name: "Selected programme" });
    expect(within(programme).queryByRole("img")).not.toBeInTheDocument();
    expect(within(programme).queryByRole("heading", { name: "What to expect" })).not.toBeInTheDocument();
    expect(within(programme).getByRole("heading", { name: "Programme details" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", {name:"Submit enrollment"}));
    await waitFor(()=>expect(post).toHaveBeenCalled());
    expect(post.mock.lastCall[1]).toMatchObject({type:kind,programmeId:item.id,details:{fullName:" Test Student ",semester:"5.2"}});
    expect(Boolean(post.mock.lastCall[1].details.phone)).toBe(kind==='courses');
    expect(await screen.findByText(/Reference: enrollment-1/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Edit details" }));
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue(" Test Student ");
  });

  it("rejects invalid email and mobile details", () => {
    renderEnrollment("courses", catalogue.courses[0].id);
    fillDetails(true);
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value: "bad@" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Mobile number" }), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Review enrollment" }));
    expect(within(screen.getByRole("alert")).getAllByRole("link")).toHaveLength(2);
  });

  it("resets details when another programme is selected", () => {
    render(<MemoryRouter initialEntries={["/enroll/events/reflection-evening"]}><Link to="/enroll/events/books-conversations">Next event</Link><Routes><Route path="/enroll/:kind/:id" element={<Enrollment />} /></Routes></MemoryRouter>);
    fillDetails();
    fireEvent.click(screen.getByRole("link", { name: "Next event" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Books that start conversations");
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("");
  });

  it.each([["events", "missing"], ["courses", "faith-campus"], ["unknown", "reflection-evening"]])("handles invalid %s links without displaying a misleading form", (kind, id) => {
    renderEnrollment(kind, id);
    expect(screen.getByRole("heading", { name: "Programme not found" })).toBeVisible();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the catalogue" })).toHaveAttribute("href", "/catalogue");
  });
});
