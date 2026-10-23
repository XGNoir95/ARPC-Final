import { useId } from 'react';
import { FiGithub, FiLinkedin, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminImageField from './AdminImageField';
import { memberProfileUrl } from '../../utils/memberProfiles';
import { adminDanger, adminInput, adminQuiet } from './AdminUI.styles.js';

function ProfileField({ service, member, update, disabled }) {
  const id = useId();
  const label = service === 'linkedin' ? 'LinkedIn' : 'GitHub';
  const Icon = service === 'linkedin' ? FiLinkedin : FiGithub;
  return <div className="min-w-0"><label htmlFor={`${id}-input`} className="flex items-center gap-2 text-base font-semibold"><Icon aria-hidden="true"/>{label} profile</label>
    <input id={`${id}-input`} value={member[service] || ''} disabled={disabled} maxLength={2000} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={service === 'linkedin' ? 'Username or https://www.linkedin.com/in/…' : 'Username or https://github.com/…'} aria-describedby={id} onChange={event => {
      const value = event.target.value;
      event.target.setCustomValidity(memberProfileUrl(service, value) === null ? `Enter a ${label} username or a valid HTTPS ${label} profile URL.` : '');
      update({ [service]: value });
    }} className={`${adminInput} mt-2`}/>
    <span id={id} className="mt-2 block text-sm leading-6 font-normal text-muted">{service === 'linkedin' ? 'Personal profile at linkedin.com/in/username.' : 'Profile at github.com/username.'} Leave blank if unavailable.</span>
  </div>;
}

export default function AdminTeamMembers({ members, onChange, busy, onBusyChange }) {
  const update = (index, changes) => onChange(list => list.map((member, at) => at === index ? { ...member, ...changes } : member));
  return <fieldset disabled={busy}><legend className="mb-4 font-garamond text-2xl font-semibold">Team members</legend><div className="space-y-5">{members.map((member, index) => <section key={member.id} aria-label={`Member ${index + 1} details`} className="rounded-xl border border-ink/20 p-4 sm:p-5">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-ink/12 pb-4"><h4 className="font-garamond text-2xl font-semibold">{member.name || `Member ${index + 1}`}</h4><button type="button" disabled={busy} aria-label={`Remove ${member.name || `member ${index + 1}`}`} className={adminDanger} onClick={() => onChange(list => list.filter((_, at) => at !== index))}><FiTrash2 aria-hidden="true"/>Remove member</button></div>
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <AdminImageField label={`Photo for ${member.name || `member ${index + 1}`}`} value={member.image} onChange={image => update(index, { image })} disabled={busy} onBusyChange={onBusyChange}/>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2"><label className="block min-w-0 text-base font-semibold sm:col-span-2">Name<input value={member.name || ''} required maxLength={200} onChange={event => update(index, { name: event.target.value })} className={`${adminInput} mt-2`}/></label>
        {['role', 'department'].map(key => <label key={key} className="block min-w-0 text-base font-semibold capitalize">{key}<input value={member[key] || ''} maxLength={2000} onChange={event => update(index, { [key]: event.target.value })} className={`${adminInput} mt-2`}/></label>)}
        {['linkedin', 'github'].map(service => <ProfileField key={service} service={service} member={member} update={changes => update(index, changes)} disabled={busy}/>)}
      </div>
    </div>
  </section>)}</div><button type="button" disabled={busy || members.length >= 100} className={`${adminQuiet} mt-5`} onClick={() => onChange(list => [...list, { id: crypto.randomUUID(), name: '', department: '', role: '', linkedin: '', github: '', image: '/images/team/member-placeholder.svg' }])}><FiPlus aria-hidden="true"/>Add member</button></fieldset>;
}
