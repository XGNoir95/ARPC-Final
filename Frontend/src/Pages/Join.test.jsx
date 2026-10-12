import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Join from "./Join";

async function fillApplication(method = "bKash") {
  const details = {
    "Full name": "  Test Applicant  ", "Email address": "applicant@example.com",
    "Mobile number": "+880 1712-345678", "Student ID": "20260101234",
  };
  Object.entries(details).forEach(([label, value]) => fireEvent.change(screen.getByRole("textbox", { name: label }), { target: { value } }));
  fireEvent.change(screen.getByRole("combobox", { name: "Semester" }), { target: { value: "2.1" } });
  fireEvent.change(screen.getByRole("combobox", { name: "Gender" }), { target: { value: "Female" } });
  fireEvent.change(screen.getByRole("combobox", { name: "Department" }), { target: { value: "Computer Science & Engineering" } });
  fireEvent.click(screen.getByRole("button", { name: method }));
  await screen.findByRole("heading", { name: `${method} details` });
  if (method === "bKash") {
    fireEvent.change(screen.getByRole("textbox", { name: "bKash sender number" }), { target: { value: "01712345678" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Transaction ID" }), { target: { value: "ABC123XYZ" } });
  } else {
    fireEvent.change(screen.getByRole("textbox", { name: "Cash received by" }), { target: { value: "Test Representative" } });
  }
  fireEvent.click(screen.getByRole("checkbox", { name: /I agree/ }));
}

afterEach(() => vi.useRealTimers());

describe("Membership application", () => {
  it("uses a local photo hero, brand gold and the seven required member fields", () => {
    const { container } = render(<Join />);
    const header = container.querySelector("header");
    expect(header.querySelector("img")).toHaveAttribute("src", `${import.meta.env.BASE_URL}images/about/community.jpg`);
    expect(header.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Join theARPC community.");
    const student = screen.getByRole("group", { name: "Student information" });
    const contact = screen.getByRole("group", { name: "Contact information" });
    expect(within(student).getAllByRole("textbox")).toHaveLength(2);
    expect(within(student).getAllByRole("combobox")).toHaveLength(3);
    expect(within(contact).getAllByRole("textbox")).toHaveLength(2);
    expect(screen.getByText("৳100")).toBeVisible();
    expect(screen.queryByLabelText("Preferred team")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Transaction ID" })).not.toBeInTheDocument();
  });

  it("offers only the requested departments and semesters", () => {
    render(<Join />);
    expect(within(screen.getByRole("combobox", { name: "Semester" })).getAllByRole("option").map((option) => option.value).slice(1)).toEqual(["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2", "5.1", "5.2"]);
    expect(within(screen.getByRole("combobox", { name: "Department" })).getAllByRole("option").map((option) => option.value).slice(1)).toEqual([
      "Computer Science & Engineering", "Electrical & Electronic Engineering", "Mechanical Engineering",
      "Industrial & Production Engineering", "Civil Engineering", "Textile Engineering", "Bachelor of Business Administration", "Architecture",
    ]);
  });

  it.each([
    ["Nagad", "Nagad sender number", "01712345678", "Transaction ID", "NG123456", "nagad"],
    ["Rocket", "Rocket sender number", "017123456789", "Transaction ID", "RK123456", "rocket"],
    ["Bank transfer", "Sender bank", "Test Bank", "Transfer reference", "BANK-2026-123", "bank"],
  ])("transitions to %s details and includes them in the application", async (method, senderLabel, senderValue, referenceLabel, referenceValue) => {
    render(<Join />);
    await fillApplication();
    fireEvent.click(screen.getByRole("button", { name: "Change method" }));
    fireEvent.click(await screen.findByRole("button", { name: method }));
    await screen.findByRole("heading", { name: `${method} details` });
    expect(screen.queryByRole("button", { name: "bKash" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "bKash sender number" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    expect(within(screen.getByRole("alert")).getAllByRole("link")).toHaveLength(2);
    fireEvent.change(screen.getByRole("textbox", { name: senderLabel }), { target: { value: senderValue } });
    fireEvent.change(screen.getByRole("textbox", { name: referenceLabel }), { target: { value: referenceValue } });
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    const body = new URL(screen.getByRole("link", { name: "Open email to send" }).href).searchParams.get("body");
    expect(body).toContain(`Payment method: ${method}`);
    expect(body).toContain(`${senderLabel}: ${senderValue}`);
    expect(body).toContain(`${referenceLabel}: ${referenceValue}`);
    expect(body).not.toContain("ABC123XYZ");
    expect(body).toContain("Payment status: Pending club verification");
  });

  it("preserves separate payment drafts when returning to the original method", async () => {
    render(<Join />);
    await fillApplication();
    fireEvent.click(screen.getByRole("button", { name: "Change method" }));
    fireEvent.click(await screen.findByRole("button", { name: "Nagad" }));
    const nagadSender = await screen.findByRole("textbox", { name: "Nagad sender number" });
    expect(nagadSender).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Transaction ID" })).toHaveValue("");
    fireEvent.change(nagadSender, { target: { value: "01812345678" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Transaction ID" }), { target: { value: "NG123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Change method" }));
    fireEvent.click(await screen.findByRole("button", { name: "bKash" }));
    expect(await screen.findByRole("textbox", { name: "bKash sender number" })).toHaveValue("01712345678");
    expect(screen.getByRole("textbox", { name: "Transaction ID" })).toHaveValue("ABC123XYZ");
  });

  it("requires bKash payment details and rejects malformed transaction information", async () => {
    render(<Join />);
    await fillApplication();
    fireEvent.change(screen.getByRole("textbox", { name: "bKash sender number" }), { target: { value: "abc" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Transaction ID" }), { target: { value: "bad!" } });
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    expect(within(screen.getByRole("alert")).getAllByRole("link")).toHaveLength(2);
    fireEvent.change(screen.getByRole("textbox", { name: "Transaction ID" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    expect(within(screen.getByRole("alert")).getByRole("link", { name: "Enter the transaction id." })).toBeVisible();
  });

  it("clears hidden payment errors and exports only the chosen method", async () => {
    render(<Join />);
    await fillApplication();
    fireEvent.change(screen.getByRole("textbox", { name: "Transaction ID" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    expect(screen.getByRole("alert")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Change method" }));
    fireEvent.click(await screen.findByRole("button", { name: "Cash" }));
    await screen.findByRole("heading", { name: "Cash details" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Transaction ID" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    expect(within(screen.getByRole("alert")).getAllByRole("link")).toHaveLength(1);
    expect(within(screen.getByRole("alert")).getByRole("link", { name: "Enter the cash received by." })).toBeVisible();
    fireEvent.change(screen.getByRole("textbox", { name: "Cash received by" }), { target: { value: "Test Representative" } });
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    const body = new URL(screen.getByRole("link", { name: "Open email to send" }).href).searchParams.get("body");
    expect(body).toContain("Payment method: Cash");
    expect(body).toContain("Cash received by: Test Representative");
    expect(body).toContain("Receipt / reference: Not provided");
    expect(body).not.toContain("bKash sender number");
    expect(body).not.toContain("Transaction ID:");
  });

  it("identifies missing details and sends focus to the summary and chosen field", () => {
    render(<Join />);
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    const errors = screen.getByRole("alert");
    expect(errors).toHaveFocus();
    expect(within(errors).getAllByRole("link")).toHaveLength(9);
    fireEvent.click(within(errors).getByRole("link", { name: "Enter your full name." }));
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("link", { name: "Open email to send" })).not.toBeInTheDocument();
  });

  it("rejects whitespace-only required details and invalid email and phone values", async () => {
    render(<Join />);
    await fillApplication();
    fireEvent.change(screen.getByRole("textbox", { name: "Full name" }), { target: { value: "   " } });
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value: "bad@" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Mobile number" }), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    expect(within(screen.getByRole("alert")).getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByRole("heading", { name: "Review your application" })).not.toBeInTheDocument();
  });

  it("reviews validated details, creates an encoded email draft, and preserves edits", async () => {
    render(<Join />);
    await fillApplication();
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    expect(screen.getByRole("heading", { name: "Review your application" })).toHaveFocus();
    expect(screen.getByText("Test Applicant")).toBeVisible();
    expect(screen.getByText(/Your application has not been sent yet/)).toBeVisible();
    const email = new URL(screen.getByRole("link", { name: "Open email to send" }).href);
    expect(email.protocol).toBe("mailto:");
    expect(email.pathname).toBe("info@arpc.club");
    expect(email.searchParams.get("subject")).toBe("ARPC membership application");
    const body = email.searchParams.get("body");
    expect(body).toContain("Full name: Test Applicant");
    expect(body).toContain("Department: Computer Science & Engineering");
    expect(body).toContain("Semester: 2.1");
    expect(body).toContain("Gender: Female");
    expect(body).toContain("Registration fee: BDT 100");
    expect(body).toContain("Payment method: bKash");
    expect(body).toContain("bKash sender number: 01712345678");
    expect(body).toContain("Transaction ID: ABC123XYZ");
    expect(body).toContain("Payment status: Pending club verification");
    expect(body).not.toContain("Cash received by");
    fireEvent.click(screen.getByRole("button", { name: "Edit details" }));
    expect(screen.getByRole("heading", { name: "Membership application" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("  Test Applicant  ");
    expect(screen.getByRole("checkbox", { name: /I agree/ })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Semester" })).toHaveValue("2.1");
    expect(screen.getByRole("heading", { name: "bKash details" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Transaction ID" })).toHaveValue("ABC123XYZ");
  });

  it("downloads the reviewed application and releases its temporary file URL", async () => {
    const create = vi.fn(() => "blob:application");
    const revoke = vi.fn();
    vi.stubGlobal("URL", class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<Join />);
    await fillApplication();
    fireEvent.click(screen.getByRole("button", { name: "Review application" }));
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Download a copy" }));
    expect(create.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(create.mock.calls[0][0].type).toBe("text/plain;charset=utf-8");
    expect(click.mock.instances[0].download).toBe("arpc-membership-application.txt");
    expect(click.mock.instances[0].href).toBe("blob:application");
    vi.advanceTimersByTime(1000);
    expect(revoke).toHaveBeenCalledWith("blob:application");
  });
});
