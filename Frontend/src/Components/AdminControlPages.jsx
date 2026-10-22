import { Notice } from './StateView';
import { useRef, useState } from 'react';
import { FiTrash2, FiMail, FiShield, FiCheck, FiLock, FiUser, FiArrowUpRight } from 'react-icons/fi';
import { api, post } from '../utils/api';
import AdminSessions from './AdminSessions';
import GoogleSignIn from './GoogleSignIn';
import { AdminAvatar, AdminBadge, AdminEmpty, AdminSearch, AdminSegments, AdminDialog } from './AdminUI';
import { adminAction, adminQuiet, adminDanger, adminFocus, adminInput, adminPanel } from './AdminUI.styles';

function AdminAccessCard({user,busy,actions,onChange,onDelete}) {
  const guidance=user.status==='active'
    ?user.emailVerified?'This account is approved. The administrator can access the club workspace.':'This account is approved. Workspace access remains locked until the email is verified.'
    :user.status==='pending'
      ?user.emailVerified?'This email is verified. Review the request to approve or reject administrator access.':'You can approve this account now. Workspace access will remain locked until the email is verified.'
      :user.status==='suspended'?'Workspace access is suspended. Restore access when this administrator can return.'
        :user.status==='rejected'?'This request was not approved. Reopen the review if it needs to be reconsidered.'
          :'Review this account before changing its administrator access.';
  return <li aria-label={`${user.fullName} administrator account`} className={`${adminPanel} flex flex-col gap-4 p-5 sm:p-6 xl:row-span-4 xl:grid xl:grid-rows-subgrid`}>
    <div className="@container/admin-account flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 basis-full items-center gap-3 @min-[25rem]/admin-account:basis-0"><AdminAvatar name={user.fullName} size="size-12"/><div className="min-w-0"><h3 className="wrap-anywhere font-garamond text-2xl font-semibold">{user.fullName}</h3><p className="mt-1 wrap-anywhere text-sm text-muted">{user.email}</p></div></div>
      <span className="order-first ml-auto shrink-0 @min-[25rem]/admin-account:order-none @min-[25rem]/admin-account:ml-0"><AdminBadge value={user.status==='active'&&!user.emailVerified?'approved':user.status}/></span>
    </div>
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted"><span className="inline-flex items-center gap-1.5">{user.emailVerified?<FiCheck aria-hidden="true" className="shrink-0"/>:<FiMail aria-hidden="true" className="shrink-0"/>}{user.emailVerified?'Email verified':'Awaiting email verification'}</span><span className="inline-flex items-center gap-1.5"><FiShield aria-hidden="true" className="shrink-0"/>{user.role==='superadmin'?'Superadmin':'Administrator'}</span></div>
    <p className="text-sm leading-relaxed text-muted">{guidance}</p>
    <div className="mt-auto border-t border-ink/10 pt-4 xl:mt-0">{user.role==='superadmin'?<p className="flex min-h-12 items-center text-sm leading-relaxed text-muted">The main administrator account is protected.</p>:<div role="group" aria-label={`Manage access for ${user.fullName}`} className="flex min-h-12 flex-wrap items-center gap-2">{actions.map(([status,label])=><button type="button" key={status} disabled={busy} className={`${status==='active'?adminAction:adminQuiet} min-h-12`} onClick={()=>onChange(user,status)}>{label}</button>)}<button type="button" disabled={busy} className={`${adminDanger} min-h-12`} onClick={()=>onDelete(user)}><FiTrash2 aria-hidden="true"/>Delete account</button></div>}</div>
  </li>;
}

export function AdminAccess({profile,users,run,busy}) {
  const [filter,setFilter]=useState('all');const [query,setQuery]=useState('');const main=profile.role==='superadmin';
  const [deleteTarget,setDeleteTarget]=useState(null);const [deleting,setDeleting]=useState(false);const [deleteError,setDeleteError]=useState('');
  const requestLock=useRef(false);
  const actions={pending:[['active','Approve'],['rejected','Reject']],active:[['suspended','Suspend']],suspended:[['active','Restore access']],rejected:[['pending','Reopen review']]};
  const updateAccess=async(user,status)=>{
    if(busy||requestLock.current||!main||user.role==='superadmin'||user.status===status||!actions[user.status]?.some(([next])=>next===status))return;
    requestLock.current=true;
    const message=status==='active'?(user.emailVerified?'Administrator access approved.':'Account approved. Workspace access starts after email verification.'):status==='pending'?'Account reopened for review.':status==='suspended'?'Administrator access suspended.':'Administrator application rejected.';
    try{await run(()=>api(`/admin/users/${user.id}`,{method:'PATCH',body:{status,expectedStatus:user.status,...(user.accessRevision!==undefined?{revision:user.accessRevision}:{})}}),message);}finally{requestLock.current=false;}
  };
  const requestDelete=user=>{
    if(busy||requestLock.current||!main||user.role==='superadmin')return;
    setDeleteError('');setDeleteTarget(user);
  };
  const closeDelete=event=>{if(busy||deleting){event?.preventDefault?.();return;}setDeleteTarget(null);setDeleteError('');};
  const deleteAccount=async()=>{
    const user=deleteTarget;
    if(!user||busy||requestLock.current||!main||user.role==='superadmin')return;
    requestLock.current=true;setDeleting(true);setDeleteError('');
    try{
      const removed=await run(()=>api(`/admin/users/${user.id}`,{method:'DELETE',body:{expectedStatus:user.status,revision:user.accessRevision??1}}),'Administrator account deleted. They can sign up again.');
      if(removed)setDeleteTarget(null);else setDeleteError('We could not confirm the account deletion. Close this dialog and refresh the workspace before trying again.');
    }catch{setDeleteError('We could not confirm the account deletion. Close this dialog and refresh the workspace before trying again.');}
    finally{requestLock.current=false;setDeleting(false);}
  };
  const items=users.filter(u=>(filter==='all'||u.status===filter)&&`${u.fullName} ${u.email}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="mb-7 grid gap-5 xl:grid-cols-[1.35fr_1fr]"><section className={`${adminPanel} p-6 sm:p-8`}><span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-soft"><FiMail aria-hidden="true" className="size-5 text-muted"/></span><h2 className="break-words font-garamond text-3xl font-semibold">Invite an administrator</h2><p className="mt-3 max-w-[50ch] text-base leading-relaxed text-muted">Bring another trusted person into the club workspace. Every new account needs email verification and superadmin approval before entering.</p><form onSubmit={e=>{e.preventDefault();if(busy)return;const email=new FormData(e.currentTarget).get('email');run(()=>post('/admin/invitations',{email}),'Invitation email queued.');}} className="mt-6 flex flex-col gap-3 sm:flex-row"><input aria-label="Invitation email" name="email" type="email" required className={adminInput} placeholder="admin@example.com"/><button disabled={busy} className={`${adminAction} shrink-0`}>Send invitation<FiArrowUpRight aria-hidden="true"/></button></form></section><section className="rounded-3xl bg-raised p-6 sm:p-8"><FiShield aria-hidden="true" className="mb-5 size-7 text-muted"/><h2 className="break-words font-garamond text-3xl font-semibold">Access with accountability.</h2><ul className="mt-5 space-y-4 text-base leading-relaxed text-copy">{['Applicants verify ownership of their email.','The superadmin can approve accounts before email verification.','Workspace access starts only when both checks are complete.'].map(text=><li key={text} className="flex gap-3"><FiCheck aria-hidden="true" className="mt-1 shrink-0"/>{text}</li>)}</ul></section></div>
    {main?<><div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><AdminSegments label="Admin account filters" value={filter} onChange={setFilter} options={['all','pending','active','suspended','rejected'].map(s=>[s,s==='all'?'Everyone':s==='active'?'Approved':s[0].toUpperCase()+s.slice(1),s==='all'?users.length:users.filter(u=>u.status===s).length])}/><div className="w-full sm:max-w-xs"><AdminSearch value={query} onChange={setQuery} label="Search administrators" placeholder="Name or email"/></div></div><ul className="grid items-stretch gap-4 xl:grid-cols-2">{items.map(u=><AdminAccessCard key={u.id} user={u} busy={busy} actions={actions[u.status]||[]} onChange={updateAccess} onDelete={requestDelete}/>)}</ul>{!items.length&&<AdminEmpty icon={FiUser} title="No accounts match." description="Try another status or search by name or email."><button className={adminQuiet} onClick={()=>{setFilter('all');setQuery('');}}>Clear filters</button></AdminEmpty>}</>:<AdminEmpty icon={FiShield} title="Invitations are open. Approvals stay with the superadmin." description="Only the superadmin can approve, reject, suspend or restore accounts. You can invite another administrator using the form above."/>}
    {main&&deleteTarget&&<AdminDialog title="Delete administrator account?" onClose={closeDelete}><div className="space-y-5 p-5 sm:p-6"><div className="rounded-2xl border border-ink/12 bg-soft p-4"><p className="wrap-anywhere text-base font-semibold">{deleteTarget.fullName}</p><p className="mt-1 wrap-anywhere text-sm text-muted">{deleteTarget.email}</p></div><p className="text-base leading-relaxed">Permanently remove this administrator account and sign out all of its sessions. This cannot be undone.</p><p className="text-sm leading-relaxed text-muted">They can sign up again with this email address. The new account will need email verification and superadmin approval.</p><p className="text-sm leading-relaxed text-muted">Published club content and membership or programme applications will remain.</p>{deleteError&&<Notice title="Deletion not confirmed.">{deleteError}</Notice>}<div className="flex flex-wrap justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" disabled={busy||deleting} className={adminQuiet} onClick={closeDelete}>Cancel</button><button type="button" disabled={busy||deleting} className={`${adminDanger} min-h-12 border border-danger/25 bg-danger-soft px-5`} onClick={deleteAccount}><FiTrash2 aria-hidden="true"/>{deleting?'Deleting account...':'Delete account permanently'}</button></div></div></AdminDialog>}
  </>;
}

export function AdminAccount({profile,run,busy}) {
  const [fullName,setFullName]=useState(profile.fullName || '');
  const [department,setDepartment]=useState(profile.department || '');
  const changed=fullName.trim()!==(profile.fullName || '').trim() || department.trim()!==(profile.department || '').trim();
  const approved=profile.status==='active';
  const accessReady=approved && profile.emailVerified;
  const save=event=>{
    event.preventDefault();
    if(busy || !changed || !fullName.trim())return;
    run(()=>api('/admin/account',{method:'PATCH',body:{fullName:fullName.trim(),department:department.trim()}}),'Account details saved.');
  };
  return <div className="flex min-w-0 flex-col gap-6">
    <section aria-label="Account settings" className={`${adminPanel} overflow-hidden`}>
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-ink/12 bg-soft/65 p-5 sm:p-7">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5"><AdminAvatar name={profile.fullName} size="size-16 sm:size-20"/><div className="min-w-0"><h2 className="wrap-anywhere font-garamond text-3xl leading-tight font-semibold sm:text-4xl">{profile.fullName}</h2><p className="mt-2 wrap-anywhere text-base text-muted">{profile.email}</p></div></div>
        <div className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted xl:flex-col xl:items-end"><AdminBadge value={accessReady?'active':'pending'}>{profile.role==='superadmin'?'Superadmin':'Administrator'}</AdminBadge><span className="inline-flex items-center gap-2"><FiCheck aria-hidden="true" className="shrink-0"/>{profile.emailVerified?'Email verified':'Email verification pending'}</span><span className="inline-flex items-center gap-2"><FiShield aria-hidden="true" className="shrink-0"/>{accessReady?'Workspace access active':'Workspace access pending'}</span></div>
      </header>
      <div className="grid divide-y divide-ink/12 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
        <section aria-labelledby="account-profile-heading" className="flex min-w-0 flex-col p-5 sm:p-7">
          <h2 id="account-profile-heading" className="font-garamond text-3xl font-semibold">Your profile</h2><p className="mt-2 max-w-[48ch] text-base leading-relaxed text-muted">Keep the details your fellow administrators see up to date.</p>
          <form onSubmit={save} className="mt-6 flex flex-1 flex-col gap-5">
            <label className="block text-base font-semibold" htmlFor="account-full-name">Full name<input id="account-full-name" name="fullName" autoComplete="name" required maxLength={100} value={fullName} onChange={event=>setFullName(event.target.value)} className={`${adminInput} mt-2`}/></label>
            <label className="block text-base font-semibold" htmlFor="account-department">Department<input id="account-department" name="department" autoComplete="organization" maxLength={150} value={department} onChange={event=>setDepartment(event.target.value)} placeholder="Add your department" className={`${adminInput} mt-2`}/></label>
            <div><label className="block text-base font-semibold" htmlFor="account-email">Email address</label><div className="relative mt-2"><FiLock aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"/><input id="account-email" type="email" readOnly value={profile.email} aria-describedby="account-email-help" className={`${adminInput} bg-soft pl-11 text-muted`}/></div><p id="account-email-help" className="mt-2 text-sm leading-relaxed text-muted">This is your sign-in address and cannot be edited here.</p></div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/12 pt-5"><p role="status" className="text-sm text-muted">{changed?'You have unsaved changes.':'Your profile is up to date.'}</p><div className="flex flex-wrap gap-2">{changed&&<button type="button" disabled={busy} className={adminQuiet} onClick={()=>{setFullName(profile.fullName || '');setDepartment(profile.department || '');}}>Discard changes</button>}<button type="submit" disabled={busy || !changed || !fullName.trim()} className={adminAction}>Save account</button></div></div>
          </form>
        </section>
        <section aria-labelledby="account-security-heading" className="min-w-0 p-5 sm:p-7">
          <h2 id="account-security-heading" className="font-garamond text-3xl font-semibold">Sign-in &amp; security</h2><p className="mt-2 text-base leading-relaxed text-muted">Manage how you sign in to the club workspace.</p>
          <div className="mt-6 divide-y divide-ink/12">
            <section aria-labelledby="account-password-heading" className="pb-6"><div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft text-muted"><FiLock aria-hidden="true" className="size-5"/></span><h3 id="account-password-heading" className="font-garamond text-2xl font-semibold">Password</h3></div><p className="mt-3 text-base leading-relaxed text-muted">Request a private reset link at your account email to choose a new password.</p><button type="button" disabled={busy} onClick={()=>run(()=>post('/auth/forgot-password',{email:profile.email}),'Password reset email queued.')} className={`mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-ink/25 bg-surface px-4 py-2.5 text-center text-base font-medium transition-colors hover:bg-field disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${adminFocus}`}><FiMail aria-hidden="true" className="shrink-0"/>Email password reset link</button></section>
            <section aria-labelledby="account-google-heading" className="pt-6"><h3 id="account-google-heading" className="font-garamond text-2xl font-semibold">Google sign-in</h3><p className="mt-3 text-base leading-relaxed text-muted">Link the Google account that uses this same email address for another way to sign in.</p><GoogleSignIn fullWidth compact linkAccount disabled={busy} onCredential={credential=>run(()=>post('/auth/link-google',{credential}),'Google sign-in linked.')}/><p className="mt-3 text-sm leading-relaxed text-muted">Your existing sign-in method stays available.</p></section>
          </div>
        </section>
      </div>
    </section>
    <AdminSessions/>
  </div>;
}
