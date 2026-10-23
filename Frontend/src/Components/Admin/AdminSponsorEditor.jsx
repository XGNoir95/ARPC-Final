import { useState } from 'react';
import { FiCheck, FiCircle } from 'react-icons/fi';
import AdminPageDraft, { DraftField } from './AdminPageDraft';
import AdminImageField from './AdminImageField';
import AdminWebsitePreview from './AdminWebsitePreview';
import AdminPreviewCards from './AdminPreviewCards';
import { sameValues } from '../../utils/adminChanges';

function sponsorFields(item) {
  return { id: item?.id || item?._id || crypto.randomUUID(), name: item?.name || '', src: item?.src || '', wide: Boolean(item?.wide) };
}

function sponsorDraft(record) {
  const value = sponsorFields(record);
  return { record, initial: value, value };
}

function editorSession(item, content) {
  const first = sponsorDraft(item);
  // Only administrator records can become editing targets; public preview snapshots cannot.
  const drafts = (content?.sponsors || []).filter(record => record._id).map(record =>
    record._id === item?._id || record.id === first.value.id ? first : sponsorDraft(record));
  if (!drafts.includes(first)) drafts.unshift(first);
  return { selected: first.value.id, drafts };
}

function hasChanges(draft) {
  return !sameValues(draft.initial, draft.value) || !draft.record?._id && Boolean(draft.value.name.trim() || draft.value.src.trim());
}

export default function AdminSponsorEditor({ item, content, onClose, onSaved }) {
  const [session, setSession] = useState(() => editorSession(item, content));
  const active = session.drafts.find(draft => draft.value.id === session.selected);
  const { initial, value, record } = active;
  const update = (key, next) => setSession(current => ({ ...current, drafts: current.drafts.map(draft =>
    draft.value.id === value.id ? { ...draft, value: { ...draft.value, [key]: next } } : draft) }));
  const committed = saved => setSession(current => ({ ...current, drafts: current.drafts.map(draft => {
    if (draft.value.id !== value.id) return draft;
    const next = sponsorFields(saved?.draft || value);
    return { record: { ...draft.record, ...saved }, initial: next, value: next };
  }) }));
  const otherChanges = session.drafts.some(draft => draft !== active && hasChanges(draft));
  const ready = Boolean(value.name.trim() && value.src.trim());
  const cards = session.drafts.map(draft => ({ ...draft.value, summary: hasChanges(draft) ? 'Unsaved changes' : draft.record?.live ? 'Club affiliation' : 'Draft' }));
  return <AdminPageDraft title={record?._id ? 'Edit sponsor draft' : 'Add a sponsor'} resource="sponsors" item={record} initial={initial} value={value} onClose={onClose} onSaved={onSaved} onCommitted={committed} closeOnSave={!otherChanges} validate={draft => !draft.src.trim() ? 'Choose a logo before saving this sponsor.' : null} layout="canvas" preview={({ disabled }) => <AdminWebsitePreview resource="sponsors" entry={value} content={content} disabled={disabled} showCards={false} cardSection={<AdminPreviewCards resource="sponsors" items={cards} selected={value.id} disabled={disabled} onSelect={id => { if (!disabled) setSession(current => ({ ...current, selected: id })); }} hint="Select a sponsor to edit its details. Unsaved changes stay with each card; Save draft saves the selected sponsor."/>}/>}>{({ disabled, onUploadBusy }) => <>
    <div><h3 className="font-garamond text-2xl font-semibold">Sponsor details</h3><p className="mt-2 text-sm leading-6 text-muted">Introduce the organisation as it should appear among the club’s affiliations.</p></div>
    <DraftField label="Sponsor name" value={value.name} onChange={next => update('name', next)} required maxLength={200} help="Use the organisation’s official name."/>
    <AdminImageField key={value.id} label="Logo" value={value.src} onChange={next => update('src', next)} disabled={disabled} onBusyChange={onUploadBusy}/>
    <fieldset className="border-t border-ink/12 pt-6"><legend className="mb-3 text-base font-semibold">Logo proportions</legend><div className="grid gap-3 sm:grid-cols-2">{[[false, 'Standard', 'Square or compact artwork.'], [true, 'Wide', 'Horizontal wordmarks and banners.']].map(([wide, label, help]) => <label key={label} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${value.wide === wide ? 'border-ink/40 bg-soft' : 'border-ink/15 bg-surface'}`}><input type="radio" name="logo-proportions" checked={value.wide === wide} onChange={() => update('wide', wide)} className="mt-1 size-5 shrink-0 accent-action"/><span><span className="block text-base font-semibold">{label}</span><span className="mt-1 block text-sm font-normal leading-6 text-muted">{help}</span></span></label>)}</div></fieldset>
    <section className="rounded-xl border border-ink/12 bg-soft p-5"><h3 className="text-base font-semibold">Before publishing</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-muted">{[[Boolean(value.name.trim()), 'Sponsor name added'], [Boolean(value.src.trim()), 'Logo selected']].map(([complete, label]) => <li key={label} className="flex items-center gap-2">{complete ? <FiCheck aria-hidden="true" className="size-4 shrink-0 text-ink"/> : <FiCircle aria-hidden="true" className="size-4 shrink-0"/>}{label}</li>)}</ul><p className="mt-4 border-t border-ink/10 pt-3 text-sm leading-6 text-muted">{ready ? 'Review the preview, then save this draft. Publish it from Sponsors to make it visible.' : 'Add the name and logo to complete this draft.'}</p></section>
  </>}</AdminPageDraft>;
}
