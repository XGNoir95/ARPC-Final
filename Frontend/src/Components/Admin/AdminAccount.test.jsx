import { fireEvent,render,screen,waitFor,within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach,expect,it,vi } from 'vitest';
import { AdminAccount } from './AdminControlPages';
import { api,post } from '../../utils/api';

vi.mock('../../utils/api',()=>({api:vi.fn(),post:vi.fn(),API_BASE:'/api'}));
vi.mock('../GoogleSignIn',()=>({default:({onCredential,disabled,fullWidth,linkAccount})=><button type="button" disabled={disabled} data-full-width={fullWidth} data-link-account={linkAccount} onClick={()=>onCredential('verified-google-credential')}>Link Google account</button>}));
const profile={id:'owner',fullName:'Club Administrator',email:'owner@example.test',department:'Computer Science',role:'superadmin',status:'active',emailVerified:true};
const devices=[{id:'current',current:true,lastSeenAt:'2026-10-16T06:00:00Z'},{id:'other',current:false,lastSeenAt:'2026-10-15T06:00:00Z'}];
let run;
const show=(props={})=>render(<MemoryRouter><AdminAccount profile={profile} run={run} busy={false} {...props}/></MemoryRouter>);

beforeEach(()=>{
  api.mockReset();post.mockReset();post.mockResolvedValue({});
  api.mockImplementation(async path=>path==='/auth/sessions'?devices:{});
  run=vi.fn(async operation=>{await operation();return true;});
});

it('shows the account identity and actual access state alongside an uneditable sign-in address',async()=>{
  show();
  expect(screen.getByRole('heading',{name:profile.fullName})).toBeVisible();
  expect(screen.getByText('Workspace access active')).toBeVisible();
  expect(screen.getByLabelText('Email address')).toHaveAttribute('readonly');
  expect(screen.getByLabelText('Email address')).toHaveValue(profile.email);
  expect(screen.getByRole('button',{name:'Save account'})).toBeDisabled();
  expect(await screen.findByText('Current session')).toBeVisible();
  expect(post).not.toHaveBeenCalled();
});

it('saves only edited profile fields and disables saving once the refreshed values match',async()=>{
  const view=show();
  fireEvent.change(screen.getByLabelText('Full name'),{target:{value:'  Updated Administrator  '}});
  fireEvent.change(screen.getByLabelText('Department'),{target:{value:'  Architecture  '}});
  expect(screen.getByText('You have unsaved changes.')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Save account'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/account',{method:'PATCH',body:{fullName:'Updated Administrator',department:'Architecture'}}));
  view.rerender(<MemoryRouter><AdminAccount profile={{...profile,fullName:'Updated Administrator',department:'Architecture'}} run={run} busy={false}/></MemoryRouter>);
  expect(screen.getByRole('button',{name:'Save account'})).toBeDisabled();
});

it('discards profile edits and prevents blank-name or unchanged submissions',()=>{
  show();
  fireEvent.change(screen.getByLabelText('Full name'),{target:{value:'   '}});
  const save=screen.getByRole('button',{name:'Save account'});
  expect(save).toBeDisabled();fireEvent.submit(save.closest('form'));
  expect(run).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Discard changes'}));
  expect(screen.getByLabelText('Full name')).toHaveValue(profile.fullName);
  expect(save).toBeDisabled();
});

it('keeps password reset and Google linking bound to the signed-in account',async()=>{
  show();
  fireEvent.click(screen.getByRole('button',{name:'Email password reset link'}));
  await waitFor(()=>expect(post).toHaveBeenCalledWith('/auth/forgot-password',{email:profile.email}));
  const google=screen.getByRole('button',{name:'Link Google account'});
  expect(google).toHaveAttribute('data-link-account','true');expect(google).toHaveAttribute('data-full-width','true');
  fireEvent.click(google);
  await waitFor(()=>expect(post).toHaveBeenCalledWith('/auth/link-google',{credential:'verified-google-credential'}));
});

it('disables account changes while a workspace request is running',()=>{
  show({busy:true});
  fireEvent.change(screen.getByLabelText('Full name'),{target:{value:'Edited name'}});
  expect(screen.getByRole('button',{name:'Save account'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Discard changes'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Email password reset link'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Link Google account'})).toBeDisabled();
  expect(run).not.toHaveBeenCalled();
});

it('revokes another device without offering to revoke the current session from its row',async()=>{
  show();
  await screen.findByText('Current session');
  const current=screen.getByText('This device').closest('li');
  expect(within(current).queryByRole('button',{name:'Revoke session'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Revoke session'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/auth/sessions/other',{method:'DELETE'}));
  await waitFor(()=>expect(screen.queryByText('Another signed-in device')).not.toBeInTheDocument());
  expect(screen.getByText('Current session')).toBeVisible();
});

it('can recover a failed device list without hiding the profile or sign-in settings',async()=>{
  let failed=true;
  api.mockImplementation(async path=>{if(path==='/auth/sessions'){if(failed)throw new Error('private database detail');return devices;}return {};});
  show();
  expect(await screen.findByRole('alert')).toHaveTextContent('We could not load your devices.');
  expect(screen.getByRole('heading',{name:'Your profile'})).toBeVisible();
  expect(screen.getByRole('heading',{name:'Sign-in & security'})).toBeVisible();
  expect(screen.queryByText('private database detail')).not.toBeInTheDocument();
  failed=false;fireEvent.click(screen.getByRole('button',{name:'Try again'}));
  expect(await screen.findByText('Current session')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
