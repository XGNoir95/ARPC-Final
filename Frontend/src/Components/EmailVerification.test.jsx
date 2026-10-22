import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EmailVerification from './EmailVerification';
import { api, post } from '../utils/api';

vi.mock('../utils/api',()=>({api:vi.fn(),post:vi.fn()}));
const metadata=(options={})=>({required:true,expiresAt:new Date(Date.now()+600000).toISOString(),resendAvailableAt:null,lockedUntil:null,...options});
const show=extra=>render(<EmailVerification email="admin@example.test" onVerified={vi.fn()} {...extra}/>);
beforeEach(()=>{api.mockResolvedValue(metadata());post.mockReset();});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});

it('accepts a complete code with its leading zero and prevents duplicate submissions',async()=>{
  const verified=vi.fn();const busy=vi.fn();let resolve;
  post.mockImplementation(()=>new Promise(done=>{resolve=done;}));
  show({onVerified:verified,onBusyChange:busy});
  const input=screen.getByLabelText('Verification code');
  await waitFor(()=>expect(input).toBeEnabled());
  expect(input).toHaveAttribute('autocomplete','one-time-code');
  expect(input).toHaveAttribute('inputmode','numeric');
  fireEvent.change(input,{target:{value:'012345'}});
  const form=input.closest('form');fireEvent.submit(form);fireEvent.submit(form);
  expect(post).toHaveBeenCalledExactlyOnceWith('/auth/verify-code',{code:'012345'});
  expect(screen.getByRole('button',{name:'Verifying…'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Resend code'})).toBeDisabled();
  const profile={id:'admin',emailVerified:true,status:'pending'};
  await act(async()=>resolve({profile}));
  expect(verified).toHaveBeenCalledWith(profile);expect(input).toHaveValue('');
  expect(busy.mock.calls).toEqual([[true],[false]]);
});

it('uses the server resend deadline after reloading and enables resend when it elapses',async()=>{
  vi.useFakeTimers();
  api.mockResolvedValue(metadata({resendAvailableAt:new Date(Date.now()+23000).toISOString()}));
  show();await act(async()=>{});
  expect(screen.getByRole('button',{name:'Resend code in 23s'})).toBeDisabled();
  act(()=>vi.advanceTimersByTime(23000));
  expect(screen.getByRole('button',{name:'Resend code'})).toBeEnabled();
  expect(post).not.toHaveBeenCalled();
});
it('uses the server clock when the device clock is two hours behind',async()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-16T10:00:00Z'));
  api.mockResolvedValue(metadata({serverTime:'2026-10-16T12:00:00Z',expiresAt:'2026-10-16T12:10:00Z',resendAvailableAt:'2026-10-16T12:01:00Z'}));
  show();await act(async()=>{});
  expect(screen.getByText('Code expires in 10:00. Only the latest code will work.')).toBeVisible();
  expect(screen.getByRole('button',{name:'Resend code in 60s'})).toBeDisabled();
  act(()=>vi.advanceTimersByTime(60000));
  expect(screen.getByRole('button',{name:'Resend code'})).toBeEnabled();
  expect(screen.getByText('Code expires in 9:00. Only the latest code will work.')).toBeVisible();
});

it('expires the code without removing the option to request another',async()=>{
  vi.useFakeTimers();api.mockResolvedValue(metadata({expiresAt:new Date(Date.now()+2000).toISOString()}));
  show();await act(async()=>{});
  fireEvent.change(screen.getByLabelText('Verification code'),{target:{value:'123456'}});
  expect(screen.getByRole('button',{name:'Verify email'})).toBeEnabled();
  act(()=>vi.advanceTimersByTime(3000));
  expect(screen.getByText('This code has expired. Request a new code below.')).toBeVisible();
  expect(screen.getByRole('button',{name:'Verify email'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Resend code'})).toBeEnabled();
});

it('clears the old code after resend and honors the returned cooldown',async()=>{
  show();const input=screen.getByLabelText('Verification code');await waitFor(()=>expect(input).toBeEnabled());
  fireEvent.change(input,{target:{value:'123456'}});
  post.mockResolvedValue(metadata({resendAvailableAt:new Date(Date.now()+90000).toISOString()}));
  fireEvent.click(screen.getByRole('button',{name:'Resend code'}));
  expect(await screen.findByText(/A new verification code has been requested/)).toBeVisible();
  expect(input).toHaveValue('');expect(input).toHaveFocus();
  expect(screen.getByRole('button',{name:/Resend code in 90s/})).toBeDisabled();
  expect(post).toHaveBeenCalledExactlyOnceWith('/auth/resend-verification');
});
it('does not let an older status response remove a newer resend cooldown',async()=>{
  show();await waitFor(()=>expect(screen.getByLabelText('Verification code')).toBeEnabled());
  let resolve;
  api.mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
  fireEvent(window,new Event('focus'));
  post.mockResolvedValue(metadata({resendAvailableAt:new Date(Date.now()+90000).toISOString()}));
  fireEvent.click(screen.getByRole('button',{name:'Resend code'}));
  await screen.findByText(/A new verification code has been requested/);
  await act(async()=>resolve(metadata({resendAvailableAt:null})));
  expect(screen.getByRole('button',{name:'Resend code in 90s'})).toBeDisabled();
});

it('shows a failed code clearly and locks both actions using the server attempt limit',async()=>{
  show();const input=screen.getByLabelText('Verification code');await waitFor(()=>expect(input).toBeEnabled());
  post.mockRejectedValue(Object.assign(new Error('Too many attempts. Try again in 15 minutes.'),{status:429,userFacing:true,retryAfterSeconds:900}));
  api.mockResolvedValue(metadata({lockedUntil:new Date(Date.now()+900000).toISOString()}));
  fireEvent.change(input,{target:{value:'123456'}});fireEvent.submit(input.closest('form'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Too many attempts. Try again in 15 minutes.');
  await waitFor(()=>expect(input).toBeDisabled());
  expect(screen.getByRole('button',{name:'Verify email'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Resend code'})).toBeDisabled();
  expect(input).toHaveAttribute('aria-invalid','true');
});

it('recovers from a status request failure before allowing any code request',async()=>{
  api.mockRejectedValueOnce(new Error('private database failure'));show();
  expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t check your verification code. Please try again.');
  expect(screen.queryByText('private database failure')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Send verification code'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Check again'}));
  await waitFor(()=>expect(screen.getByLabelText('Verification code')).toBeEnabled());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('offers a first code for older accounts without an active verification challenge',async()=>{
  api.mockResolvedValue(metadata({expiresAt:null}));show();
  await waitFor(()=>expect(screen.getByRole('button',{name:'Send verification code'})).toBeEnabled());
  expect(screen.getByLabelText('Verification code')).toBeDisabled();
  expect(screen.getByRole('button',{name:'Verify email'})).toBeDisabled();
  expect(screen.queryByText(/code sent to/)).not.toBeInTheDocument();
});
