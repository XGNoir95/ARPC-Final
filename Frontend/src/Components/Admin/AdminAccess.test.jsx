import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AdminAccess } from './AdminControlPages';
import { api, post } from '../../utils/api';

vi.mock('../../utils/api',()=>({api:vi.fn(),post:vi.fn(),API_BASE:'/api'}));

const profile={id:'main',fullName:'Main Admin',email:'main@example.com',role:'superadmin',status:'active',emailVerified:true};
const account={id:'applicant',fullName:'New Administrator',email:'new@example.com',role:'admin',status:'pending',emailVerified:false};
let run;

const show=(users=[account],props={})=>render(<AdminAccess profile={profile} users={users} run={run} busy={false} {...props}/>);
const card=name=>within(screen.getByRole('listitem',{name:`${name} administrator account`}));

beforeEach(()=>{
  api.mockReset();api.mockResolvedValue({});post.mockReset();post.mockResolvedValue({});
  run=vi.fn(async operation=>{await operation();return true;});
});
afterEach(cleanup);

it('allows approval before email verification and preserves the separate access requirement',async()=>{
  show();
  const applicant=card(account.fullName);
  expect(applicant.getByText('Awaiting email verification')).toBeVisible();
  expect(applicant.getByText(/Workspace access will remain locked until the email is verified/)).toBeVisible();
  expect(applicant.getByRole('button',{name:'Approve'})).toBeEnabled();
  fireEvent.click(applicant.getByRole('button',{name:'Approve'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/users/applicant',{method:'PATCH',body:{status:'active',expectedStatus:'pending'}}));
  expect(run).toHaveBeenCalledWith(expect.any(Function),'Account approved. Workspace access starts after email verification.');
});

it('offers suspension and deletion for an active account without another approval or rejection',()=>{
  show([{...account,status:'active',emailVerified:true}]);
  const administrator=card(account.fullName);
  expect(administrator.getByText('Active')).toBeVisible();
  expect(administrator.getByRole('button',{name:'Suspend'})).toBeEnabled();
  expect(administrator.queryByRole('button',{name:'Approve'})).not.toBeInTheDocument();
  expect(administrator.queryByRole('button',{name:'Reject'})).not.toBeInTheDocument();
  expect(administrator.getByRole('button',{name:'Delete account'})).toBeEnabled();
  expect(administrator.getAllByRole('button')).toHaveLength(2);
});

it('labels approved but unverified accounts truthfully without suggesting they can enter',()=>{
  show([{...account,status:'active'}]);
  const administrator=card(account.fullName);
  expect(administrator.getByText('Approved')).toBeVisible();
  expect(administrator.queryByText('Active')).not.toBeInTheDocument();
  expect(administrator.getByText(/Workspace access remains locked until the email is verified/)).toBeVisible();
  expect(administrator.queryByRole('button',{name:'Approve'})).not.toBeInTheDocument();
});

it.each([
  ['pending','Reject','rejected'],
  ['active','Suspend','suspended'],
  ['suspended','Restore access','active'],
  ['rejected','Reopen review','pending'],
])('offers a meaningful %s transition through %s',async(status,label,next)=>{
  show([{...account,status,emailVerified:true}]);
  const administrator=card(account.fullName);
  expect(administrator.getAllByRole('button')).toHaveLength(status==='pending'?3:2);
  fireEvent.click(administrator.getByRole('button',{name:label}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/users/applicant',{method:'PATCH',body:{status:next,expectedStatus:status}}));
});

it('protects the superadmin account and keeps account controls unavailable to ordinary administrators',()=>{
  const view=show([profile]);
  const administrator=card(profile.fullName);
  expect(administrator.getByText('The main administrator account is protected.')).toBeVisible();
  expect(administrator.queryByRole('button')).not.toBeInTheDocument();
  view.rerender(<AdminAccess profile={{...profile,role:'admin'}} users={[account]} run={run} busy={false}/>);
  expect(screen.queryByRole('group',{name:`Manage access for ${account.fullName}`})).not.toBeInTheDocument();
  expect(screen.getByText(/Only the superadmin can approve, reject, suspend or restore accounts/)).toBeVisible();
});

it('disables mutations while another workspace request is in progress',()=>{
  show([{...account},{...account,id:'active',fullName:'Active Administrator',status:'active',emailVerified:true}],{busy:true});
  expect(card(account.fullName).getByRole('button',{name:'Approve'})).toBeDisabled();
  expect(card(account.fullName).getByRole('button',{name:'Reject'})).toBeDisabled();
  expect(card('Active Administrator').getByRole('button',{name:'Suspend'})).toBeDisabled();
  expect(card(account.fullName).getByRole('button',{name:'Delete account'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Send invitation'})).toBeDisabled();
  fireEvent.submit(screen.getByRole('textbox',{name:'Invitation email'}).closest('form'));
  expect(run).not.toHaveBeenCalled();
});

it('does not queue a second decision before the first request completes',async()=>{
  let finish;
  const pending=new Promise(resolve=>{finish=resolve;});
  run.mockImplementation(async operation=>{await operation();await pending;});
  show();
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Approve'}));
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Reject'}));
  expect(api).toHaveBeenCalledTimes(1);
  expect(run).toHaveBeenCalledTimes(1);
  finish();
  await pending;
});

it('replaces approval controls after a refreshed approved account is received',()=>{
  const view=show();
  expect(card(account.fullName).getByRole('button',{name:'Approve'})).toBeVisible();
  view.rerender(<AdminAccess profile={profile} users={[{...account,status:'active',emailVerified:true}]} run={run} busy={false}/>);
  expect(card(account.fullName).queryByRole('button',{name:'Approve'})).not.toBeInTheDocument();
  expect(card(account.fullName).getByRole('button',{name:'Suspend'})).toBeVisible();
});

it('includes the access revision so an intervening status change cannot be overwritten',async()=>{
  show([{...account,accessRevision:7}]);
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Approve'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/users/applicant',{method:'PATCH',body:{status:'active',expectedStatus:'pending',revision:7}}));
});

it.each(['pending','active','suspended','rejected'])('offers account deletion for a %s administrator without deleting immediately',status=>{
  show([{...account,status}]);
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Delete account'}));
  const dialog=within(screen.getByRole('dialog',{name:'Delete administrator account?'}));
  expect(dialog.getByText(account.email)).toBeVisible();
  expect(dialog.getByText(/Permanently remove this administrator account and sign out all of its sessions/)).toBeVisible();
  expect(dialog.getByText(/new account will need email verification and superadmin approval/)).toBeVisible();
  expect(dialog.getByText('Published club content and membership or programme applications will remain.')).toBeVisible();
  expect(api).not.toHaveBeenCalled();
});

it('cancels account deletion without a mutation and restores the trigger focus',async()=>{
  show([{...account,status:'suspended'}]);
  const trigger=card(account.fullName).getByRole('button',{name:'Delete account'});
  trigger.focus();fireEvent.click(trigger);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Cancel'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(()=>expect(trigger).toHaveFocus());
  expect(api).not.toHaveBeenCalled();expect(run).not.toHaveBeenCalled();
});

it('deletes only the confirmed account using its captured status and access revision',async()=>{
  const target={...account,status:'suspended',accessRevision:9};
  show([target]);
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Delete account'}));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete account permanently'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/users/applicant',{method:'DELETE',body:{expectedStatus:'suspended',revision:9}}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(run).toHaveBeenCalledWith(expect.any(Function),'Administrator account deleted. They can sign up again.');
});

it('uses the initial revision for legacy accounts and keeps the confirmation bound to its original snapshot',async()=>{
  const view=show();
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Delete account'}));
  view.rerender(<AdminAccess profile={profile} users={[{...account,status:'active',accessRevision:2}]} run={run} busy={false}/>);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete account permanently'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/users/applicant',{method:'DELETE',body:{expectedStatus:'pending',revision:1}}));
});

it('keeps deletion unavailable for protected accounts and ordinary administrators',()=>{
  const view=show([profile,account]);
  expect(card(profile.fullName).queryByRole('button',{name:'Delete account'})).not.toBeInTheDocument();
  view.rerender(<AdminAccess profile={{...profile,role:'admin'}} users={[account]} run={run} busy={false}/>);
  expect(screen.queryByRole('button',{name:'Delete account'})).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('guards duplicate deletion requests and keeps the confirmation controls disabled until completion',async()=>{
  let finish;
  const pending=new Promise(resolve=>{finish=resolve;});
  run.mockImplementation(async operation=>{await operation();await pending;return true;});
  show([{...account,status:'suspended'}]);
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Delete account'}));
  const dialog=within(screen.getByRole('dialog'));
  const confirm=dialog.getByRole('button',{name:'Delete account permanently'});
  fireEvent.click(confirm);fireEvent.click(confirm);
  expect(api).toHaveBeenCalledTimes(1);expect(run).toHaveBeenCalledTimes(1);
  expect(dialog.getByRole('button',{name:'Deleting account...'})).toBeDisabled();
  expect(dialog.getByRole('button',{name:'Cancel'})).toBeDisabled();
  const cancel=new Event('cancel',{cancelable:true,bubbles:false});
  fireEvent(screen.getByRole('dialog'),cancel);
  expect(cancel.defaultPrevented).toBe(true);
  expect(screen.getByRole('dialog')).toBeVisible();
  finish();await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('shows a safe deletion failure without falsely confirming removal or exposing internal errors',async()=>{
  api.mockRejectedValue(new Error('private database details'));
  run.mockImplementation(async operation=>{try{await operation();return true;}catch{return false;}});
  show([{...account,status:'suspended'}]);
  fireEvent.click(card(account.fullName).getByRole('button',{name:'Delete account'}));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete account permanently'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Deletion not confirmed.');
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.queryByText('private database details')).not.toBeInTheDocument();
  expect(within(screen.getByRole('dialog')).getByRole('button',{name:'Cancel'})).toBeEnabled();
});
