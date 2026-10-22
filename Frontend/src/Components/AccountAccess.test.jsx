import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { api, post } from "../utils/api";
vi.mock("../utils/api",()=>({api:vi.fn(),post:vi.fn()}));
beforeEach(()=>{api.mockResolvedValue({googleClientId:""});post.mockResolvedValue({profile:{status:"pending"}});});
import AccountAccess from "./AccountAccess";

const renderAccount = (register = false) => render(<MemoryRouter><AccountAccess register={register} /></MemoryRouter>);
afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("shows and hides a password without changing the entered value", () => {
  renderAccount();
  const password = screen.getByLabelText(/^Password/);
  fireEvent.change(password, { target: { value: "a-private-password" } });
  expect(password).toHaveAttribute("type", "password");
  fireEvent.click(screen.getByRole("button", { name: "Show password" }));
  expect(password).toHaveAttribute("type", "text");
  expect(password).toHaveValue("a-private-password");
  fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
  expect(password).toHaveAttribute("type", "password");
  expect(password).toHaveValue("a-private-password");
});

it("keeps registration password visibility independent for each field", () => {
  renderAccount(true);
  fireEvent.click(screen.getByRole("button", { name: "Show confirm password" }));
  expect(screen.getByLabelText(/^Confirm password/)).toHaveAttribute("type", "text");
  expect(screen.getByLabelText(/^Password/)).toHaveAttribute("type", "password");
  expect(screen.getByRole("combobox", { name: /Department/ })).toHaveTextContent("Architecture");
});

it("focuses mismatched confirmation and retains registration details for correction", async () => {
  const { container } = renderAccount(true);
  fireEvent.change(screen.getByLabelText(/^Full name/), { target: { value: "An ARPC administrator" } });
  fireEvent.change(screen.getByLabelText(/^Phone number/), { target: { value: "01700000000" } });
  fireEvent.change(screen.getByLabelText(/^Email address/), { target: { value: "admin@aust.edu" } });
  fireEvent.change(screen.getByLabelText(/^Student ID/), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(/^Department/), { target: { value: "Architecture" } });
  fireEvent.change(screen.getByLabelText(/^Batch/), { target: { value: "22.1.1" } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "first-password" } });
  fireEvent.change(screen.getByLabelText(/^Confirm password/), { target: { value: "other-password" } });
  fireEvent.submit(container.querySelector("form"));
  expect(screen.getByRole("alert")).toHaveTextContent("Your passwords do not match.");
  expect(screen.getByLabelText(/^Confirm password/)).toHaveFocus();
  expect(screen.getByLabelText(/^Confirm password/)).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText(/^Full name/)).toHaveValue("An ARPC administrator");
  fireEvent.change(screen.getByLabelText(/^Confirm password/), { target: { value: "first-password" } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  fireEvent.submit(container.querySelector("form"));
  await waitFor(()=>expect(post).toHaveBeenCalledWith("/auth/register",expect.objectContaining({fullName:"An ARPC administrator",email:"admin@aust.edu"})));
  expect(sessionStorage.getItem("arpc-admin-preview-v1")).toBeNull();
});

it("shows API errors and keeps the entered email for retry", async () => {
  post.mockRejectedValue(Object.assign(new Error("Email or password is incorrect."),{userFacing:true,status:401}));
  const { container } = renderAccount();
  fireEvent.change(screen.getByLabelText(/^Email address/), { target: { value: "admin@aust.edu" } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "a-private-password" } });
  fireEvent.submit(container.querySelector("form"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
  expect(screen.getByLabelText(/^Email address/)).toHaveValue("admin@aust.edu");
  expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/register");
  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});

it("keeps Google sign-in independent of the password form validation", async () => {
  vi.spyOn(HTMLDialogElement.prototype,'showModal').mockImplementation(function(){this.setAttribute('open','');});
  vi.spyOn(HTMLDialogElement.prototype,'close').mockImplementation(function(){this.removeAttribute('open');});
  let credentialCallback;
  vi.stubGlobal('google', {accounts:{id:{
    initialize:vi.fn(config=>{credentialCallback=config.callback;}),
    renderButton:vi.fn(host=>{const button=document.createElement('button');button.type='button';button.textContent='Google account';button.onclick=()=>credentialCallback({credential:'test-google-credential'});host.append(button);}),
  }}});
  api.mockImplementation(async path=>path==='/config'?{googleClientId:'test-client'}:{nonce:'test-challenge'});
  renderAccount();
  fireEvent.click(screen.getByRole('button',{name:'Sign in with Google'}));
  fireEvent.click(await screen.findByRole('button',{name:'Google account'}));
  await waitFor(()=>expect(post).toHaveBeenCalledWith('/auth/google',{credential:'test-google-credential'}));
  expect(post).not.toHaveBeenCalledWith('/auth/login',expect.anything());
});
