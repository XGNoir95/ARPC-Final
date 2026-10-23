import { userMessage } from '../../utils/userMessages';
import { useState } from 'react';
import { api } from '../../utils/api';
import AdminWebsitePreview from './AdminWebsitePreview';
import { courseCoverPresets } from '../../utils/courseCovers';
import { AdminDialog, AdminBadge } from './AdminUI';
import { kindNames, resourceNames } from '../../utils/adminPresentation';
import { comparableFields, contentFields, sameValues } from '../../utils/adminChanges';
import AdminImageField from './AdminImageField';
import AdminHomepageEditor from './AdminHomepageEditor';
import AdminSponsorEditor from './AdminSponsorEditor';
import AdminTeamMembers from './AdminTeamMembers';
import { memberProfileUrl } from '../../utils/memberProfiles';
const input='mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-ink/20 bg-field p-3 text-base font-normal focus:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-ink';
const button='min-h-11 cursor-pointer rounded-full bg-action px-5 py-3 text-base font-semibold text-on-action hover:bg-[#E9AD5E] hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-50';
function Field({label,name,value='',multiline=false,children,...props}) {return <label className="block min-w-0 text-base font-semibold">{label}{children?<select name={name} defaultValue={value} className={input} {...props}>{children}</select>:multiline?<textarea name={name} defaultValue={value} className={`${input} resize-y`} rows={5} {...props}/>:<input name={name} defaultValue={value} className={input} {...props}/>}</label>;}
export default function AdminContentEditor(props) {
  if(props.resource==='home')return <AdminHomepageEditor {...props}/>;
  if(props.resource==='sponsors')return <AdminSponsorEditor {...props}/>;
  return <ContentEditor {...props}/>;
}
function ContentEditor({resource,item,content,programmeKind,onClose,onSaved}) {
  const [kind,setKind]=useState(item?.kind || programmeKind || 'events');const [cover,setCover]=useState(item?.coverTheme || 'learning');const [members,setMembers]=useState(item?.members || []);const [image,setImage]=useState(item?.image || item?.src || '');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [fields,setFields]=useState(()=>contentFields(resource,item || {}));
  const changed=!item || !sameValues(comparableFields(fields),comparableFields(contentFields(resource,item))) || !sameValues(image,item.image || item.src || '') || !sameValues(members,item.members || []) || resource==='programmes' && cover!==(item.coverTheme || 'learning');
  const save=async e=>{e.preventDefault();if(busy || !changed)return;if(resource==='gallery'&&!image.trim()){setError('Choose an image before saving this draft.');return;}setBusy(true);setError('');try{
    const v=Object.fromEntries(new FormData(e.currentTarget));const data={...item,...v,id:item?.id || crypto.randomUUID()};
    if(resource==='programmes')Object.assign(data,{kind,fee:Number(v.fee || 0),image,coverTheme:cover,takeaways:v.takeaways.split('\n').map(s=>s.trim()).filter(Boolean),registrationOpen:v.registrationOpen==='on'});
    if(resource==='gallery')Object.assign(data,{image,alt:v.alt,placeholder:v.placeholder==='on',poster:v.poster==='on'});
    if(resource==='teams')data.members=members.map(member=>{
      const linkedin=memberProfileUrl('linkedin',member.linkedin);const github=memberProfileUrl('github',member.github);
      if(linkedin===null || github===null)throw new Error('Enter a valid LinkedIn or GitHub profile for each member.');
      return {...member,linkedin,github};
    });
    await api(`/admin/content/${resource}${item?`/${item._id}`:''}`,{method:item?'PATCH':'POST',body:{data,revision:item?.revision}});await onSaved('Draft saved. Publish it when ready.');onClose();
  }catch(err){setError(userMessage(err));}finally{setBusy(false);}};
  return <AdminDialog title={`${item?'Edit':'New'} ${(resource==='programmes'?kindNames[kind]:resourceNames[resource])?.toLowerCase()} draft`} onClose={onClose} wide="preview"><form onSubmit={save} onChange={e=>{if(Object.hasOwn(fields,e.target.name))setFields(current=>({...current,[e.target.name]:e.target.type==='checkbox'?e.target.checked:e.target.value}));}}><div><div className="border-b border-ink/12 bg-soft p-5 sm:px-8 sm:py-6"><AdminWebsitePreview resource={resource} showCards={false} content={content} entry={{...item,...fields,id:item?.id || 'draft',kind,coverTheme:cover,image,members,fee:Number(fields.fee || 0),takeaways:(fields.takeaways || '').split('\n').map(point=>point.trim()).filter(Boolean)}} disabled={busy}/></div><div className="space-y-5 p-5 sm:p-8"><div className="flex items-center gap-3"><AdminBadge value="draft"/><p className="text-sm leading-relaxed text-muted">Changes stay private until you publish.</p></div>
    {resource==='programmes'&&<Field label="Programme type" name="kind" value={kind} disabled={Boolean(item || programmeKind)} onChange={e=>setKind(e.target.value)}>{(programmeKind || item?.kind ? [kind] : ['events','webinars','courses']).map(type=><option key={type} value={type}>{kindNames[type]}</option>)}</Field>}
    <Field label={resource==='teams'?'Team name':'Title'} name={resource==='teams'?'label':'title'} value={item?.label || item?.name || item?.title} required maxLength={200}/>
    {<Field label="Description" name="description" value={item?.description} multiline required maxLength={5000}/>}
    {resource==='programmes'&&<><Field label="Full programme details" name="details" value={item?.details} multiline maxLength={20000}/><div className="grid gap-5 sm:grid-cols-2"><Field label="Location" name="location" value={item?.location}/><Field label="Format" name="format" value={item?.format}/>{kind==='courses'?<><Field label="Duration" name="duration" value={item?.duration}/><Field label="Learning pace" name="pace" value={item?.pace}/><Field label="Course fee (BDT)" name="fee" value={item?.fee || 0} type="number" min={0}/></>:<><Field label="Date" name="date" value={item?.date} type="date" required/><Field label="Time" name="time" value={item?.time} required/></>}</div><Field label="Takeaways (one per line)" name="takeaways" value={item?.takeaways?.join('\n')} multiline/><label className="flex min-h-11 items-center gap-3 text-base"><input name="registrationOpen" type="checkbox" defaultChecked={item?.registrationOpen!==false} className="size-5 accent-action"/>Accept enrollments when published</label>{kind==='courses'&&<fieldset><legend className="mb-3 text-base font-semibold">Folder cover</legend><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{courseCoverPresets.map(p=><label key={p.id} className={`cursor-pointer rounded-xl border p-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${cover===p.id?'border-ink bg-soft':'border-ink/15 bg-surface'}`}><img src={p.cover} alt="" className="h-20 w-full object-contain"/><span className="mt-2 flex items-center gap-2 text-sm"><input type="radio" name="coverTheme" value={p.id} checked={cover===p.id} onChange={()=>setCover(p.id)}/>{p.label}</span></label>)}</div></fieldset>}</>}
    {resource==='gallery'&&<><Field label="Category" name="category" value={item?.category || 'Campus'} required/><Field label="Image description (alt text)" name="alt" value={item?.alt} required maxLength={300}/><div className="flex flex-wrap gap-5"><label className="flex min-h-11 items-center gap-2 text-base"><input name="placeholder" type="checkbox" defaultChecked={item?.placeholder}/>Illustrative photo</label><label className="flex min-h-11 items-center gap-2 text-base"><input name="poster" type="checkbox" defaultChecked={item?.poster}/>Poster artwork</label></div></>}
    {resource!=='teams'&&<AdminImageField label="Image" value={image} onChange={setImage} disabled={busy} onBusyChange={setBusy}/>}
    {resource==='teams'&&<AdminTeamMembers members={members} onChange={setMembers} busy={busy} onBusyChange={setBusy}/>}
    </div></div><footer className="sticky bottom-0 border-t border-ink/15 bg-surface/95 p-5 backdrop-blur-sm sm:px-8">{error&&<p role="alert" className="mb-4 rounded-lg bg-danger-soft p-4 text-base text-danger">{error}</p>}<div className="flex flex-wrap items-center justify-between gap-3"><p id="content-draft-save-state" className="text-sm text-muted">{!changed?'This draft is up to date. Make a change before saving.':item?.live?'The current published entry stays visible.':'This draft is not visible on the website.'}</p><div className="flex gap-3"><button type="button" className="min-h-11 cursor-pointer rounded-full border border-ink/20 px-4 text-base focus-visible:outline-2 focus-visible:outline-ink" onClick={onClose}>Cancel</button><button type="submit" disabled={busy || !changed} aria-describedby="content-draft-save-state" className={button}>{busy?'Saving...':'Save draft'}</button></div></div></footer></form></AdminDialog>;
}
