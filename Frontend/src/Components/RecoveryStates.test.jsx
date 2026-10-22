import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AccountStatus from './AccountStatus';
import PageErrorBoundary from './PageErrorBoundary';
import SafeImage from './SafeImage';
import MemberRoster from './MemberRoster';
import { api, post } from '../utils/api';

vi.mock('../utils/api',()=>({api:vi.fn(),post:vi.fn()}));
beforeEach(()=>{
  const status={required:true,expiresAt:new Date(Date.now()+600000).toISOString(),resendAvailableAt:null,lockedUntil:null};
  api.mockResolvedValue(status);post.mockResolvedValue(status);
});
afterEach(()=>vi.restoreAllMocks());
const account={fullName:'An admin',email:'admin@example.test',role:'admin',status:'pending',emailVerified:false};
const showAccount=(profile=account,extra={})=>render(<MemoryRouter><AccountStatus profile={profile} busy={false} notice={null} onRefresh={vi.fn()} onVerified={vi.fn()} onSignOut={vi.fn()} {...extra}/></MemoryRouter>);
it('shows verification and approval as separate, accurate account steps',async()=>{
  showAccount();
  expect(screen.getByRole('heading',{name:'Your account is awaiting access.'})).toBeVisible();
  expect(screen.getByRole('heading',{name:'Email verification'})).toBeVisible();
  expect(screen.getByRole('heading',{name:'Club approval'})).toBeVisible();
  expect(screen.getAllByText('Pending')).toHaveLength(2);
  await waitFor(()=>expect(screen.getByRole('button',{name:'Resend code'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Resend code'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/auth/resend-verification'));
});
it('does not ask verified accounts to verify their email again',()=>{
  showAccount({...account,emailVerified:true});
  expect(screen.getAllByText('Complete')).toHaveLength(1);
  expect(screen.queryByLabelText('Verification code')).not.toBeInTheDocument();
});
it('asks approved accounts only for the remaining email verification step',async()=>{
  showAccount({...account,status:'active'});
  expect(screen.getByRole('heading',{name:'Verify your email to continue.'})).toBeVisible();
  expect(screen.getByText('Your account is approved. Verify your email address to open the admin workspace.')).toBeVisible();
  expect(screen.getByText('Your administrator access is approved.')).toBeVisible();
  expect(screen.getAllByText('Complete')).toHaveLength(1);
  expect(screen.getAllByText('Pending')).toHaveLength(1);
  expect(screen.queryByText(/club will review your request/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('heading',{name:'Your account is awaiting access.'})).not.toBeInTheDocument();
  await waitFor(()=>expect(screen.getByRole('button',{name:'Resend code'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Resend code'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/auth/resend-verification'));
});
it.each([['suspended','Your account access is paused.'],['rejected','Your access request wasn’t approved.']])('gives a blocked account the correct next step', (status,title)=>{
  showAccount({...account,status});
  expect(screen.getByRole('heading',{name:title})).toBeVisible();
  expect(screen.getByRole('link',{name:'Contact the club'})).toHaveAttribute('href','mailto:info@arpc.club');
  expect(screen.queryByLabelText('Verification code')).not.toBeInTheDocument();
});
it('keeps workspace failures distinct from pending approval',()=>{
  showAccount({...account,status:'active',emailVerified:true},{error:'Please try again.'});
  expect(screen.getByRole('heading',{name:'Your workspace could not be loaded.'})).toBeVisible();
  expect(screen.queryByText('Pending')).not.toBeInTheDocument();
});
it('contains a rendering error without leaking details and can retry the page',()=>{
  vi.spyOn(console,'error').mockImplementation(()=>{});let fail=true;
  function Broken(){if(fail)throw new Error('secret database query and token');return <h1>Recovered page</h1>;}
  render(<MemoryRouter><PageErrorBoundary><Broken/></PageErrorBoundary></MemoryRouter>);
  expect(screen.getByRole('heading',{name:'This page couldn’t be displayed.'})).toBeVisible();
  expect(screen.queryByText(/secret database/)).not.toBeInTheDocument();
  fail=false;fireEvent.click(screen.getByRole('button',{name:'Try again'}));expect(screen.getByRole('heading',{name:'Recovered page'})).toBeVisible();
});
it('recovers from a failed section when navigating within the mounted workspace',()=>{
  vi.spyOn(console,'error').mockImplementation(()=>{});
  let fail=true;
  function Section(){if(fail)throw new Error('Section unavailable');return <h1>Another section</h1>;}
  const page=path=><MemoryRouter><PageErrorBoundary resetKey={path}><Section/></PageErrorBoundary></MemoryRouter>;
  const {rerender}=render(page('/admin/home'));
  fail=false;
  rerender(page('/admin/home'));
  expect(screen.queryByRole('heading',{name:'Another section'})).not.toBeInTheDocument();
  rerender(page('/admin/sponsors'));
  expect(screen.getByRole('heading',{name:'Another section'})).toBeVisible();
});
it('replaces a failed photo and retries when its source changes',()=>{
  const {rerender}=render(<SafeImage src="/missing.jpg" alt="Club gathering" className="size-40"/>);
  fireEvent.error(screen.getByRole('img',{name:'Club gathering'}));
  expect(screen.getByRole('img',{name:'Image unavailable: Club gathering'})).toBeVisible();
  rerender(<SafeImage src="/working.jpg" alt="Club gathering" className="size-40"/>);
  expect(screen.getByRole('img',{name:'Club gathering'})).toHaveAttribute('src','/working.jpg');
});
it('hides a broken decorative hero rather than showing broken-image text',()=>{
  const {container}=render(<SafeImage src="/missing.jpg" fallback="hide" alt=""/>);
  act(()=>fireEvent.error(container.querySelector('img')));
  expect(container).toBeEmptyDOMElement();
});
it('explains why an expanded team has no member profiles',()=>{
  render(<MemoryRouter><MemberRoster team={{id:'team',label:'A team',members:[]}}/></MemoryRouter>);
  expect(screen.getByRole('heading',{name:'No member profiles available yet.'})).toBeVisible();
});
