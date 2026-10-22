import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiHome, FiBookOpen, FiImage, FiUsers, FiInbox, FiLayers, FiAward, FiLayout, FiShield, FiUser, FiBell, FiArrowUpRight, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { api, post } from '../utils/api';
import { publicAsset } from '../utils/publicAsset';
import { titleOf } from '../utils/adminPresentation';
import AdminContentEditor from '../Components/AdminContentEditor';
import AdminCourses from '../Components/AdminCourses';
import AdminProgrammes from '../Components/AdminProgrammes';
import AdminAnalytics from '../Components/AdminAnalytics';
import AdminContentLibrary from '../Components/AdminContentLibrary';
import AdminHomepage from '../Components/AdminHomepage';
import AdminSponsors from '../Components/AdminSponsors';
import AdminApplications from '../Components/AdminApplications';
import { AdminAccess, AdminAccount } from '../Components/AdminControlPages';
import { AdminIcon, AdminAvatar, AdminBadge, AdminDialog, AdminEmpty, AdminSearch } from '../Components/AdminUI';
import { adminQuiet, adminFocus, adminTypography, adminLayout } from '../Components/AdminUI.styles';
import AccountStatus from '../Components/AccountStatus';
import StateView, { StatePage } from '../Components/StateView';
import { userMessage } from '../utils/userMessages';
const views={
 overview:['Overview',FiHome,'A clear view of your club, its people and what comes next.'],
 programmes:['Programmes',FiBookOpen,'Prepare events and webinars, with website previews, artwork, schedules and enrollment details.'],
 courses:['Courses',FiLayers,'Manage course listings, website previews, lessons and private learning materials in one place.'],
 gallery:['Gallery',FiImage,'Collect the moments that tell your club’s story. Curate photos and posters before they go live.'],
 members:['Membership',FiUsers,'Welcome the next members. Review their details and verify the registration payment.'],
 enrollments:['Enrollments',FiInbox,'Review requests for your events, webinars and courses, then confirm each learner’s place.'],
 teams:['Panel teams',FiUsers,'Put faces to the people carrying the club forward. Keep roles and rosters up to date.'],
 sponsors:['Sponsors',FiAward,'Give your partners a clear place on the website, with carefully prepared logos.'],
 home:['Homepage',FiLayout,'Manage the page in order: hero, About us cards and featured opportunities.'],
 access:['Admin access',FiShield,'Invite your colleagues and manage who can help run the club.'],
 account:['Account',FiUser,'Keep your profile current and your sign-in options ready.'],
};
const groups=[['Workspace',['overview','members','enrollments']],['Content',['home','sponsors','programmes','courses','gallery','teams']],['Settings',['access','account']]];
const route=id=>id==='overview'?'/admin':`/admin/${id}`;
function WorkspaceSearch({workspace,onClose,onEdit}) {
 const [query,setQuery]=useState('');const needle=query.trim().toLowerCase();
 const destinations=Object.entries(views).filter(([,v])=>v[0].toLowerCase().includes(needle));
 const entries=['programmes','gallery','teams','sponsors','home'].flatMap(resource=>workspace[resource].map(item=>({resource,item}))).filter(({item})=>needle&&`${titleOf(item)} ${item.description || ''}`.toLowerCase().includes(needle)).slice(0,8);
 return <AdminDialog title="Find your next task" onClose={onClose}><div className="p-5 sm:p-6"><AdminSearch label="Search workspace" placeholder="Find a page, programme or photo" value={query} onChange={setQuery}/><p className="mt-5 mb-2 text-sm text-muted">Workspace pages</p><ul>{destinations.map(([id,[label,Icon]])=><li key={id}><Link to={route(id)} onClick={onClose} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-base hover:bg-soft ${adminFocus}`}><AdminIcon icon={Icon} aria-hidden="true" className="text-muted"/>{label}<FiArrowUpRight aria-hidden="true" className="ml-auto"/></Link></li>)}</ul>{entries.length>0&&<><p className="mt-5 mb-2 text-sm text-muted">Drafts and published entries</p><ul>{entries.map(({resource,item})=><li key={item._id}><button onClick={()=>{onClose();onEdit({resource,item});}} className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-base hover:bg-soft ${adminFocus}`}><span className="min-w-0"><span className="block font-semibold">{titleOf(item)}</span><span className="mt-1 block text-sm text-muted">{resource==='programmes'&&item.kind==='courses'?'Courses':views[resource][0]}</span></span><AdminBadge value={item.live?'published':'draft'}/></button></li>)}</ul></>}{!destinations.length&&!entries.length&&<div className="mt-5"><StateView compact kind="search" title="No results found." description="Try another programme title or page name." actions={[{label:'Clear search',onClick:()=>setQuery('')}]}/></div>}</div></AdminDialog>;
}
export default function AdminWorkspace() {
 const menuButton=useRef(null);
 const operationLock=useRef(false);
 const {signOut:logoutSession,acceptSession}=useAuth();
 const location=useLocation();const navigate=useNavigate();const view=location.pathname.split('/')[2] || 'overview';
 const [workspace,setWorkspace]=useState(null);const [profile,setProfile]=useState(null);const [denied,setDenied]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState(null);const [menu,setMenu]=useState(false);const [search,setSearch]=useState(false);const [activity,setActivity]=useState(false);const [editing,setEditing]=useState(null);const [applications,setApplications]=useState([]);const [users,setUsers]=useState([]);const [files,setFiles]=useState([]);const [analytics,setAnalytics]=useState(null);const [busy,setBusy]=useState(false);
 useEffect(()=>{const expired=()=>setDenied(true);window.addEventListener('arpc:auth-expired',expired);return()=>window.removeEventListener('arpc:auth-expired',expired);},[]);
 const reloadFiles=()=>api('/admin/files').then(setFiles);
 const fetchWorkspace=async account=>{const [w,a,f,stats,u]=await Promise.all([api('/admin/workspace'),api('/admin/applications'),api('/admin/files'),api('/admin/analytics'),account.role==='superadmin'?api('/admin/users'):Promise.resolve([])]);return {w,a,f,stats,u};};
 const applyWorkspace=({w,a,f,stats,u})=>{setWorkspace(w);setApplications(a);setFiles(f);setAnalytics(stats);setUsers(u);};
 const load=async()=>{const p=await api('/auth/me');setProfile(p.profile);if(p.profile.status==='active'&&p.profile.emailVerified)applyWorkspace(await fetchWorkspace(p.profile));else setWorkspace(null);setError('');};
 useEffect(()=>{let active=true;api('/auth/me').then(async p=>{if(!active)return;setProfile(p.profile);if(p.profile.status==='active'&&p.profile.emailVerified){const result=await fetchWorkspace(p.profile);if(active)applyWorkspace(result);}}).catch(e=>{if(active){if(e.status===401){window.dispatchEvent(new Event('arpc:auth-expired'));setDenied(true);}else setError(userMessage(e,'We could not load your workspace. Please try again.'));}});return()=>{active=false;};},[]);
 useLayoutEffect(()=>{const handler=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&workspace){e.preventDefault();if(!document.querySelector('dialog[open]'))setSearch(true);}};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler);},[workspace]);
 useEffect(()=>{
  if(!menu)return;
  const dismiss=event=>{if(event.key==='Escape'){setMenu(false);menuButton.current?.focus();}};
  const desktop=window.matchMedia?.('(min-width: 1024px)');
  const resize=()=>{if(desktop?.matches)setMenu(false);};
  document.addEventListener('keydown',dismiss);desktop?.addEventListener?.('change',resize);
  return()=>{document.removeEventListener('keydown',dismiss);desktop?.removeEventListener?.('change',resize);};
 },[menu]);
 const run=async(operation,message='Saved.',refreshOnly=false)=>{
  if(operationLock.current)return false;
  operationLock.current=true;
  setBusy(true);
  try{const result=await operation();try{await load();}catch(error){if(error.status===401)setDenied(true);setNotice({message:refreshOnly?'We could not refresh the workspace. Please try again.':'Your change was saved, but we could not refresh the workspace. Refresh before making another change.',error:true});return false;}setNotice({message:typeof message==='function'?message(result):message,error:false});return true;}
  catch(error){setNotice({message:userMessage(error,'We could not confirm this change. Refresh the page before trying again.'),error:true});if(error.status===401)setDenied(true);return false;}
  finally{operationLock.current=false;setBusy(false);}
 };
 const signout=async()=>{try{await logoutSession();navigate('/login',{replace:true});}catch(e){setNotice({message:userMessage(e,'We could not sign you out. Please try again.'),error:true});}};
 const verified=async account=>{
  if(!account || !account.emailVerified)throw new Error('Invalid verification response');
  acceptSession(account);setProfile(account);setNotice({message:'Your email address is verified.',error:false});
  try{await load();}catch(failure){if(failure.status===401)setDenied(true);setError(userMessage(failure,'Your email is verified, but we could not refresh your workspace. Please try again.'));}
 };
 if(view==='learning'||view==='files')return <Navigate to="/admin/courses" replace/>;
 if(denied)return <Navigate to="/login" replace/>;
 if(!Object.hasOwn(views,view))return <StatePage standalone kind="missing" title="Workspace page not found." description="This page may have moved. Return to your workspace to choose what to work on." actions={[{label:'Open workspace',to:'/admin'}]}/>;
 if(!profile||!workspace)return <AccountStatus profile={profile} error={error} busy={busy} notice={notice} onRefresh={()=>run(async()=>{},'Access status refreshed.',true)} onVerified={verified} onSignOut={signout}/>;
 const pending=applications.filter(a=>a.status==='pending');const pendingAdmins=users.filter(u=>u.status==='pending');const drafts=['programmes','gallery','teams','sponsors','home'].reduce((n,key)=>n+workspace[key].filter(e=>!e.live||e.hasChanges).length,0);
 const courseDrafts=workspace.programmes.filter(entry=>entry.kind==='courses'&&(!entry.live||entry.hasChanges)).length;
 const contentResource=view==='courses'?'programmes':view;
 const publish=(entry,withdraw=false)=>run(()=>post(`/admin/content/${contentResource}/${entry._id}/${withdraw?'unpublish':'publish'}`,{revision:entry.revision}),withdraw?'Entry withdrawn from the website.':'Draft published.');
 const remove=entry=>{if(window.confirm(`Delete ${titleOf(entry)}? This removes its public entry too.`))run(()=>api(`/admin/content/${contentResource}/${entry._id}`,{method:'DELETE'}),'Entry deleted.');};
 return <div className={adminLayout.shell}><aside className={adminLayout.sidebar}><div className="flex items-center justify-between gap-3"><Link to="/admin" className={`flex min-w-0 items-center gap-3 rounded sm:gap-4 ${adminFocus}`}><img src={publicAsset('/logo.jpg')} alt="ARPC" width="64" height="64" className="size-14 shrink-0 rounded-full ring-1 ring-ink/15 sm:size-16"/><div className="min-w-0"><p className="font-garamond text-4xl leading-none font-semibold sm:text-[2.5rem]">ARPC</p><p className="mt-1.5 text-sm leading-6 text-muted sm:text-base">Club workspace</p></div></Link><button ref={menuButton} aria-label={menu?'Close admin menu':'Open admin menu'} aria-expanded={menu} aria-controls="admin-navigation" onClick={()=>setMenu(v=>!v)} className={`${adminQuiet} size-11 shrink-0 px-0 lg:hidden`}>{menu?<FiX/>:<FiMenu/>}</button></div><nav id="admin-navigation" aria-label="Admin navigation" className={`mt-7 space-y-6 ${menu?'block':'hidden lg:block'}`}>{groups.map(([label,ids])=><div key={label}><p className="mb-2 px-3 text-sm text-muted">{label}</p><div className="space-y-1">{ids.map(id=>{const [name,Icon]=views[id];const count=id==='members'?pending.filter(a=>a.type==='membership').length:id==='enrollments'?pending.filter(a=>a.type!=='membership').length:id==='access'?pendingAdmins.length:0;return <Link key={id} to={route(id)} aria-current={view===id?'page':undefined} onClick={()=>setMenu(false)} className={`relative flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-base leading-6 transition-colors motion-reduce:transition-none ${adminFocus} ${view===id?'bg-surface font-semibold shadow-sm':'text-muted hover:bg-surface/70 hover:text-ink'}`}><AdminIcon icon={Icon} aria-hidden="true" className={`size-5 shrink-0 ${view===id?'text-ink':'text-muted'}`}/>{name}{view===id&&<span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[#d69c48]"/>}{count>0&&<span className="ml-auto flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-warning-soft px-1.5 text-sm font-semibold text-warning">{count}</span>}</Link>;})}</div></div>)}</nav><div className={`mt-7 border-t border-ink/15 pt-5 lg:mt-auto lg:pt-5 ${menu?'block':'hidden lg:block'}`}><Link to="/admin/account" onClick={()=>setMenu(false)} className={`flex items-center gap-3 rounded-lg py-2 ${adminFocus}`}><AdminAvatar name={profile.fullName} size="size-10"/><div className="min-w-0"><p className="truncate text-base font-semibold">{profile.fullName}</p><p className="mt-1 text-sm text-muted">{profile.role==='superadmin'?'Superadmin':'Administrator'}</p></div></Link><button onClick={signout} className={`mt-2 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-1 text-base text-muted hover:text-ink ${adminFocus}`}><FiLogOut aria-hidden="true"/>Sign out</button></div></aside>
 <div className="flex min-h-dvh min-w-0 flex-col"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-surface px-4 py-3 sm:px-7 xl:px-10"><div className="flex items-center gap-2 text-sm text-muted"><Link to="/admin" className={`hidden rounded sm:inline ${adminFocus}`}>Workspace</Link><span aria-hidden="true" className="hidden sm:inline">/</span><span className="text-ink">{views[view][0]}</span></div><div className="flex items-center gap-2"><button onClick={()=>setSearch(true)} aria-label="Search workspace" className={`${adminQuiet} gap-3 px-3 sm:px-4`}><FiSearch aria-hidden="true"/><span className="hidden sm:inline">Search</span><kbd className="hidden rounded border border-ink/15 px-1.5 py-0.5 text-sm font-normal xl:inline">Ctrl K</kbd></button><button onClick={()=>setActivity(true)} aria-label="Workspace activity" className={`${adminQuiet} relative size-11 px-0`}><FiBell aria-hidden="true"/>{(pending.length+pendingAdmins.length)>0&&<span aria-hidden="true" className="absolute top-2 right-2 size-1.5 rounded-full bg-[#d69c48]"/>}</button><Link to="/" className={`${adminQuiet} px-3 sm:px-4`}><span className="hidden sm:inline">View website</span><FiArrowUpRight aria-hidden="true"/><span className="sr-only sm:hidden">View website</span></Link></div></header>
 <section aria-label="Administration" id="admin-main" className="mx-auto flex w-full min-w-0 max-w-[110rem] flex-1 flex-col p-4 sm:p-7 xl:p-10"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className={adminTypography.pageTitle}>{view==='overview'?'Your club workspace.':views[view][0]}</h1><p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted">{views[view][2]}</p></div>{view==='overview'&&<span className="text-sm text-muted">{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(new Date())}</span>}</div>
 {!workspace.emailConfigured&&<details className="mb-6 rounded-xl border border-[#d69c48]/25 bg-warning-soft px-4 text-base text-warning"><summary className={`min-h-12 cursor-pointer py-3 ${adminFocus}`}>Email delivery needs attention</summary><p className="max-w-[70ch] pb-4 text-sm leading-relaxed">Club emails are not being delivered yet. Contact the site administrator to finish setting up email delivery. Applications and drafts are still saved.</p></details>}
 {notice&&<div role={notice.error?'alert':'status'} className={`mb-6 flex items-start justify-between gap-4 rounded-xl border p-4 text-base ${notice.error?'border-danger/20 bg-danger-soft text-danger':'border-ink/15 bg-raised'}`}><span className="flex items-start gap-2">{!notice.error&&<FiCheckCircle aria-hidden="true" className="mt-0.5 shrink-0"/>}{notice.message}</span><button aria-label="Dismiss notification" className={`shrink-0 rounded ${adminFocus}`} onClick={()=>setNotice(null)}><FiX aria-hidden="true"/></button></div>}
 <div className="flex min-h-0 flex-1 flex-col">{view==='overview'&&<AdminAnalytics workspace={workspace} applications={applications} analytics={analytics}/>}
 {['gallery','teams'].includes(view)&&<AdminContentLibrary key={view} resource={view} content={workspace} entries={workspace[view]} busy={busy} onNew={()=>setEditing({resource:view,item:null})} onEdit={item=>setEditing({resource:view,item})} onPublish={publish} onDelete={remove}/>}
 {view==='programmes'&&<AdminProgrammes entries={workspace.programmes} content={workspace} busy={busy} onNew={kind=>setEditing({resource:'programmes',item:null,kind})} onEdit={item=>setEditing({resource:'programmes',item})} onPublish={publish} onDelete={remove}/>}
 {view==='home'&&<AdminHomepage entries={workspace.home} programmes={workspace.programmes} busy={busy} onEdit={item=>setEditing({resource:'home',item})} onPublish={publish}/>}
 {view==='sponsors'&&<AdminSponsors content={workspace} entries={workspace.sponsors} busy={busy} onNew={()=>setEditing({resource:'sponsors',item:null})} onEdit={item=>setEditing({resource:'sponsors',item})} onPublish={publish} onDelete={remove}/>}
 {view==='courses'&&<AdminCourses entries={workspace.programmes} content={workspace} files={files} run={run} reloadFiles={reloadFiles} busy={busy} onNew={kind=>setEditing({resource:'programmes',item:null,kind})} onEdit={item=>setEditing({resource:'programmes',item})} onPublish={publish} onDelete={remove}/>}
 {['members','enrollments'].includes(view)&&<AdminApplications key={view} view={view} applications={applications} programmes={workspace.programmes} run={run} busy={busy}/>}
 {view==='access'&&<AdminAccess profile={profile} users={users} run={run} busy={busy}/>}{view==='account'&&<AdminAccount profile={profile} run={run} busy={busy}/>}
 </div></section></div>
 {search&&<WorkspaceSearch workspace={workspace} onClose={()=>setSearch(false)} onEdit={entry=>{if(entry.resource==='programmes')navigate(route(entry.item.kind==='courses'?'courses':'programmes'));setEditing(entry);}}/>}
 {activity&&<AdminDialog title="Waiting for your attention" onClose={()=>setActivity(false)}><div className="space-y-4 p-5 sm:p-6">{[[`${pending.length} applications waiting for review`,'Membership and programme requests','members'],[`${drafts-courseDrafts} content drafts and unpublished changes`,'Events, webinars and website content','programmes'],[`${courseDrafts} course drafts and unpublished changes`,'Course listings, lessons and learning materials','courses'],...(profile.role==='superadmin'?[[`${pendingAdmins.length} accounts awaiting approval`,'Review administrator applications and access','access']]:[])].map(([title,description,id])=><Link key={id} to={route(id)} onClick={()=>setActivity(false)} className={`block rounded-2xl border border-ink/12 bg-soft p-5 ${adminFocus}`}><span className="flex items-center justify-between gap-3 text-base font-semibold">{title}<FiArrowUpRight aria-hidden="true"/></span><span className="mt-2 block text-sm leading-relaxed text-muted">{description}</span></Link>)}<div className="rounded-2xl border border-ink/12 p-5"><h3 className="font-garamond text-2xl font-semibold">Club email delivery</h3><p className="mt-3 text-base text-muted">{analytics?.mail?.queued || 0} queued / {analytics?.mail?.failed || 0} failed</p>{profile.role==='superadmin'&&(analytics?.mail?.failed || 0)>0&&<button disabled={busy} className={`${adminQuiet} mt-4`} onClick={()=>run(()=>post('/admin/mail/retry'),result=>result.message)}>Retry failed emails</button>}</div>{!pending.length&&!drafts&&!pendingAdmins.length&&<AdminEmpty title="Your desk is clear." description="New applications, drafts and access requests will appear here."/>}</div></AdminDialog>}
 {editing&&<AdminContentEditor content={workspace} resource={editing.resource} item={editing.item} programmeKind={editing.kind || editing.item?.kind} programmes={workspace.programmes} onClose={()=>setEditing(null)} onSaved={async message=>{
   try{await load();setNotice({message,error:false});}
   catch(failure){if(failure.status===401)setDenied(true);setNotice({message:'Your draft was saved, but we could not refresh the workspace. Refresh before making another change.',error:true});}
 }}/>}
 </div>;
}
