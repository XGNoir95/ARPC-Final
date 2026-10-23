import { Notice } from '../StateView';
import { userMessage } from '../../utils/userMessages';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMonitor, FiLogOut, FiRefreshCw, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { AdminBadge, AdminSection } from './AdminUI';
import { adminQuiet, adminDanger } from './AdminUI.styles.js';
const date=value=>Number.isNaN(new Date(value).getTime())?'recently':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).format(new Date(value));
export default function AdminSessions() {
 const [loading,setLoading]=useState(true);const [attempt,setAttempt]=useState(0);
 const [sessions,setSessions]=useState([]);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const {signOut}=useAuth();const navigate=useNavigate();
 useEffect(()=>{let active=true;api('/auth/sessions').then(rows=>{if(!Array.isArray(rows))throw new Error('Invalid session response');if(active)setSessions(rows);}).catch(e=>{if(active)setError(userMessage(e,'We could not load your signed-in devices. Please try again.'));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[attempt]);
 const retry=()=>{setLoading(true);setError('');setAttempt(value=>value+1);};
 const revoke=async id=>{setBusy(true);setError('');try{await api(`/auth/sessions/${id}`,{method:'DELETE'});setSessions(rows=>rows.filter(r=>r.id!==id));}catch(e){setError(userMessage(e));}finally{setBusy(false);}};
 const logoutAll=async()=>{setBusy(true);setError('');try{await signOut(true);navigate('/login',{replace:true});}catch(e){setError(userMessage(e));}finally{setBusy(false);}};
 return <AdminSection fill={false} title="Signed-in devices" description="See where you are signed in and close sessions you no longer use." aside={<button type="button" disabled={loading||busy} className={adminQuiet} onClick={retry} aria-label="Refresh signed-in devices"><FiRefreshCw aria-hidden="true"/>Refresh</button>}><div className="p-5 sm:p-6">
 {loading?<div role="status" className="flex min-h-24 items-center gap-4"><FiLoader aria-hidden="true" className="size-6 shrink-0 animate-spin text-muted motion-reduce:animate-none"/><div><p className="text-base font-semibold">Checking your devices...</p><p className="mt-1 text-sm text-muted">Loading the sessions using your account.</p></div></div>:error&&!sessions.length?<Notice title="We could not load your devices." action={{label:'Try again',onClick:retry}}>{error}</Notice>:!sessions.length?<div className="flex min-h-24 items-center gap-4"><FiMonitor aria-hidden="true" className="size-7 shrink-0 text-muted"/><div><h3 className="font-garamond text-2xl font-semibold">No devices to display.</h3><p className="mt-2 text-base text-muted">Refresh the list to check your current signed-in devices.</p></div></div>:<>
 {error&&<div className="mb-4"><Notice>{error}</Notice></div>}
 <ul className="divide-y divide-ink/12">{sessions.map(s=><li key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0"><div className="flex min-w-0 items-center gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-soft"><FiMonitor aria-hidden="true" className="size-5 text-muted"/></span><div className="min-w-0"><p className="text-base font-semibold">{s.current?'This device':'Another signed-in device'}</p><p className="mt-1 text-sm leading-relaxed text-muted">Last active {date(s.lastSeenAt)}</p></div></div>{s.current?<AdminBadge value="active">Current session</AdminBadge>:<button type="button" disabled={busy} onClick={()=>revoke(s.id)} className={adminDanger}>Revoke session</button>}</li>)}</ul>
 <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-ink/12 pt-5"><p className="max-w-[56ch] text-sm leading-relaxed text-muted">Signing out everywhere includes this device. You can sign in again whenever you need.</p><button type="button" disabled={busy} onClick={logoutAll} className={adminQuiet}><FiLogOut aria-hidden="true"/>Sign out on all devices</button></div></>}
 </div></AdminSection>;
}
