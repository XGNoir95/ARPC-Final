import { useState } from 'react';
import { FiArrowUp, FiArrowDown, FiTrash2 } from 'react-icons/fi';
import { homepageDraft, publishedProgrammes } from '../utils/homeContent';
import { kindNames, shortDate } from '../utils/adminPresentation';
import AdminPageDraft, { DraftField } from './AdminPageDraft';
import AdminImageField from './AdminImageField';
import AdminHeroEditor from './AdminHeroEditor';
import AdminWebsitePreview from './AdminWebsitePreview';
import AdminPreviewCards from './AdminPreviewCards';
import { sameValues } from '../utils/adminChanges';
import { adminQuiet, adminDanger, adminInput } from './AdminUI.styles';

const move = (items, index, direction) => { const result = [...items]; const target = index + direction; if (target < 0 || target >= result.length) return result; [result[index], result[target]] = [result[target], result[index]]; return result; };

function editorSession(item, content) {
  const ids = item.id === 'featured' ? ['featured'] : ['about-us', 'our-mission', 'our-vision'];
  return { selected: item.id, drafts: ids.map(id => {
    // Editing targets come from admin records, with defaults for cards not saved yet.
    const record = id === item.id ? item : content?.home?.find(entry => entry.id === id && entry._id);
    const initial = homepageDraft(id, record);
    return { record, initial, value: initial };
  }) };
}

export default function AdminHomepageEditor(props) {
  if (!props.item?.id || props.item.id === 'hero') return <AdminHeroEditor {...props}/>;
  return <HomepageSectionEditor {...props}/>;
}

function HomepageSectionEditor({ item, programmes = [], content, onClose, onSaved }) {
  const [session, setSession] = useState(() => editorSession(item, content));
  const active = session.drafts.find(draft => draft.value.id === session.selected);
  const { initial, value, record } = active;
  const [manual, setManual] = useState(Boolean(initial.selections?.length));
  const [query, setQuery] = useState('');
  const update = (key, next) => setSession(current => ({ ...current, drafts: current.drafts.map(draft =>
    draft.value.id === value.id ? { ...draft, value: { ...draft.value, [key]: next } } : draft) }));
  const committed = saved => setSession(current => ({ ...current, drafts: current.drafts.map(draft => {
    if (draft.value.id !== value.id) return draft;
    const next = homepageDraft(value.id, saved?.draft || value);
    return { record: { ...draft.record, ...saved }, initial: next, value: next };
  }) }));
  const otherChanges = session.drafts.some(draft => draft !== active && !sameValues(draft.initial, draft.value));
  const available = publishedProgrammes(programmes);
  const visible = available.filter(programme => programme.title.toLowerCase().includes(query.toLowerCase()));
  const selections = value.selections || [];
  const toggle = selection => update('selections', selections.some(item => item.id === selection.id && item.kind === selection.kind) ? selections.filter(item => item.id !== selection.id || item.kind !== selection.kind) : [...selections, selection]);
  const selectedName = selection => selection.kind === 'membership' ? 'Membership applications' : available.find(programme => programme.id === selection.id && programme.kind === selection.kind)?.title || 'Programme no longer published';
  const membershipChosen = selections.some(selection => selection.kind === 'membership');
  const preview = ({ disabled }) => <AdminWebsitePreview resource="home" entry={value} content={{ ...content, programmes: available }} disabled={disabled} cardSection={value.id !== 'featured' && <AdminPreviewCards resource="home" entry={value} items={session.drafts.map(draft => ({ ...draft.value, summary: sameValues(draft.initial, draft.value) ? draft.value.summary : 'Unsaved changes' }))} selected={value.id} disabled={disabled} onSelect={id => { if (!disabled) setSession(current => ({ ...current, selected: id })); }} hint="Select an About card to preview and edit it. Unsaved changes stay with each card; Save draft saves the selected card."/>}/>;
  return <AdminPageDraft title={value.id === 'featured' ? 'Edit featured section' : `Edit ${initial.title} card`} resource="home" item={record} initial={initial} value={value} onClose={onClose} onSaved={onSaved} onCommitted={committed} closeOnSave={!otherChanges} layout="canvas" preview={preview}>{({ disabled, onUploadBusy }) => <>
    <div><h3 className="font-garamond text-2xl font-semibold">{value.id === 'featured' ? 'Featured on the homepage' : 'Card wording'}</h3><p className="mt-2 text-sm leading-6 text-muted">{value.id === 'featured' ? 'Feature different programme types together. Only published programmes appear on the website.' : 'Set the label, heading and short introduction visitors see before opening this card.'}</p></div>
    <DraftField label={value.id === 'featured' ? 'Section heading' : 'Card heading'} value={value.title} onChange={next => update('title', next)} rows={3} required maxLength={200}/>
    {value.id === 'featured' ? <>
      <DraftField label="Section introduction (optional)" value={value.description} onChange={next => update('description', next)} multiline maxLength={1000}/>
      <fieldset className="space-y-3"><legend className="mb-3 text-base font-semibold">What to display</legend>{[[false, 'Choose automatically', 'Upcoming dates first, with recent programmes and a mix of available types.'], [true, 'Choose specific items', 'Pick and order events, webinars, courses and a membership announcement.']].map(([isManual, label, help]) => <label key={label} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${manual === isManual ? 'border-ink/40 bg-soft' : 'border-ink/15'}`}><input type="radio" name="featured-mode" checked={manual === isManual} onChange={() => { setManual(isManual); if (!isManual) update('selections', []); }} className="mt-1 size-5 shrink-0 accent-action"/><span className="min-w-0"><span className="block text-base font-semibold">{label}</span><span className="mt-1 block text-sm leading-6 text-muted">{help}</span></span></label>)}</fieldset>
      {manual && <section className="space-y-5 border-t border-ink/12 pt-6"><div><h3 className="font-garamond text-2xl font-semibold">Choose featured items</h3><p className="mt-2 text-sm leading-6 text-muted">{selections.length} of 12 selected. An empty selection uses the automatic list.</p></div><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 p-4"><input type="checkbox" checked={membershipChosen} onChange={() => toggle({ id: 'membership', kind: 'membership' })} disabled={!membershipChosen && selections.length >= 12} className="mt-1 size-5 shrink-0 accent-action"/><span><span className="block text-base font-semibold">Membership applications</span><span className="mt-1 block text-sm leading-6 text-muted">Invite students to join the club.</span></span></label><input type="search" aria-label="Find published programmes" placeholder="Find a published programme" value={query} onChange={event => setQuery(event.target.value)} className={adminInput}/><div className="max-h-96 overflow-y-auto rounded-xl border border-ink/15">{visible.map(programme => { const checked = selections.some(selection => selection.id === programme.id && selection.kind === programme.kind); return <label key={programme.id} className="flex cursor-pointer items-start gap-3 border-b border-ink/10 p-4 last:border-b-0"><input type="checkbox" aria-label={`Feature ${programme.title}`} checked={checked} disabled={!checked && selections.length >= 12} onChange={() => toggle({ id: programme.id, kind: programme.kind })} className="mt-1 size-5 shrink-0 accent-action"/><span className="min-w-0"><span className="block break-words text-base font-semibold">{programme.title}</span><span className="mt-1 block text-sm leading-6 text-muted">{kindNames[programme.kind]}{programme.date ? ` · ${shortDate(programme.date)}` : ''}</span></span></label>; })}{!visible.length && <p className="p-5 text-base leading-7 text-muted">{available.length ? 'No published programmes match this search.' : 'Publish a programme before featuring it here. Membership is available now.'}</p>}</div>{selections.length > 0 && <div><h4 className="mb-3 text-base font-semibold">Display order</h4><ol className="divide-y divide-ink/10">{selections.map((selection, index) => <li key={`${selection.kind}:${selection.id}`} className="flex items-center gap-2 py-3"><span className="min-w-0 flex-1 break-words text-sm font-medium">{index + 1}. {selectedName(selection)}</span><button type="button" disabled={index === 0} aria-label={`Move featured item ${index + 1} up`} onClick={() => update('selections', move(selections, index, -1))} className={`${adminQuiet} size-11 shrink-0 px-0`}><FiArrowUp/></button><button type="button" disabled={index === selections.length - 1} aria-label={`Move featured item ${index + 1} down`} onClick={() => update('selections', move(selections, index, 1))} className={`${adminQuiet} size-11 shrink-0 px-0`}><FiArrowDown/></button><button type="button" aria-label={`Remove featured item ${index + 1}`} onClick={() => toggle(selection)} className={`${adminDanger} size-11 shrink-0 px-0`}><FiTrash2/></button></li>)}</ol></div>}</section>}
      {membershipChosen && <section className="space-y-5 border-t border-ink/12 pt-6"><h3 className="font-garamond text-2xl font-semibold">Membership announcement</h3><DraftField label="Membership headline" value={value.membership.title} onChange={next => update('membership', { ...value.membership, title: next })} required maxLength={200}/><DraftField label="Membership introduction" value={value.membership.description} onChange={next => update('membership', { ...value.membership, description: next })} multiline required maxLength={5000}/><AdminImageField label="Membership image" value={value.membership.image} onChange={next => update('membership', { ...value.membership, image: next })} disabled={disabled} onBusyChange={onUploadBusy}/></section>}
    </> : <><DraftField label="Card label" value={value.label} onChange={next => update('label', next)} required maxLength={150}/><DraftField label="Short introduction" value={value.summary} onChange={next => update('summary', next)} multiline rows={3} required maxLength={500}/><AdminImageField key={value.id} label="Card image" value={value.image} onChange={next => update('image', next)} disabled={disabled} onBusyChange={onUploadBusy}/><section className="space-y-5 border-t border-ink/12 pt-6"><h3 className="font-garamond text-2xl font-semibold">When the card opens</h3><DraftField label="Full description" value={value.description} onChange={next => update('description', next)} multiline required maxLength={5000}/><DraftField label="Button text" value={value.linkLabel} onChange={next => update('linkLabel', next)} required maxLength={100}/><DraftField label="Button destination" value={value.link} onChange={next => update('link', next)} required><option value="/join">Membership application</option><option value="/team">Panel teams</option><option value="/catalogue">Catalogue</option><option value="/gallery">Gallery</option></DraftField></section></>}
  </>}</AdminPageDraft>;
}
