import { useState } from 'react';
import { FiPlus, FiEdit2, FiUpload, FiTrash2, FiEyeOff, FiAward } from 'react-icons/fi';
import { publicAsset } from '../utils/publicAsset';
import { AdminBadge, AdminSearch, AdminSegments } from './AdminUI';
import { adminAction, adminFocus, adminPanel, adminPreviewCardGrid, adminPreviewSection } from './AdminUI.styles';
import SafeImage from './SafeImage';
import AdminWebsitePreview from './AdminWebsitePreview';

const action = 'inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-1.5 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none @min-[28rem]/sponsor:px-3';

export default function AdminSponsors({ entries, content, onNew, onEdit, onPublish, onDelete, busy }) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const filtered = entries.filter(entry => (state === 'all' || (state === 'published' ? entry.live : !entry.live)) && entry.name.toLowerCase().includes(query.toLowerCase()));
  const selected = filtered.find(entry => entry.id === selectedId) || filtered.find(entry => entry.live) || filtered[0];
  const clearFilters = () => { setQuery(''); setState('all'); };
  const cardSection = <section aria-label="Manage sponsors" className={adminPreviewSection}>
    <h3 className="self-start text-base font-semibold">Sponsor cards</h3>
    {filtered.length ? <ul className={adminPreviewCardGrid}>{filtered.map(entry => {
      const published = entry.live && !entry.hasChanges;
      return <li key={entry._id || entry.id} onClick={event => { if (!busy && !event.target.closest('button')) setSelectedId(entry.id); }} className={`@container/sponsor flex min-w-0 flex-col rounded-xl border p-4 ${busy ? 'cursor-wait' : 'cursor-pointer'} ${selected?.id === entry.id ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface'}`}>
        <button type="button" disabled={busy} onClick={() => setSelectedId(entry.id)} aria-label={`Preview ${entry.name}`} aria-pressed={selected?.id === entry.id} className={`flex min-h-14 w-full cursor-pointer items-start gap-3 rounded-lg text-left disabled:cursor-wait ${adminFocus}`}>
          <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-white p-1"><SafeImage src={publicAsset(entry.src)} alt={`${entry.name} logo`} className="size-full object-contain"/></span>
          <span className="min-w-0 flex-1"><span role="heading" aria-level={4} title={entry.name} className="min-h-14 line-clamp-2 break-words font-garamond text-2xl leading-7 font-semibold">{entry.name}</span><span className="mt-2 block"><AdminBadge value={entry.live ? 'published' : 'draft'}>{entry.live && entry.hasChanges ? 'Unpublished changes' : undefined}</AdminBadge></span></span>
        </button>
        <footer className="mt-auto pt-4">
          <div role="group" aria-label={`Actions for ${entry.name}`} className="grid grid-cols-4 items-center gap-1 border-t border-ink/12 pt-3 @min-[18rem]/sponsor:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] @min-[28rem]/sponsor:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.3fr)_minmax(0,1fr)] @min-[28rem]/sponsor:gap-2">
            <button type="button" className={`${action} border-ink/15 bg-surface text-ink hover:bg-soft`} title={`Edit ${entry.name}`} aria-label={`Edit ${entry.name}`} onClick={() => onEdit(entry)} disabled={busy}><FiEdit2 aria-hidden="true" className="size-4 shrink-0"/><span className="sr-only @min-[28rem]/sponsor:not-sr-only">Edit</span></button>
            <button type="button" className={`${action} border-transparent bg-action text-on-action enabled:hover:bg-[#E9AD5E] enabled:hover:text-brand`} onClick={() => onPublish(entry)} disabled={busy || published} aria-label={published ? 'Published' : 'Publish'} title={published ? 'Published' : 'Publish'} aria-describedby={`sponsor-state-${entry._id}`}><FiUpload aria-hidden="true" className="size-4 shrink-0 @min-[18rem]/sponsor:hidden @min-[28rem]/sponsor:block"/><span className="sr-only @min-[18rem]/sponsor:not-sr-only">{published ? 'Published' : 'Publish'}</span></button>
            <button type="button" className={`${action} border-ink/15 bg-surface text-ink hover:bg-soft`} onClick={() => onPublish(entry, true)} disabled={busy || !entry.live} aria-label="Unpublish" title="Unpublish"><FiEyeOff aria-hidden="true" className="size-4 shrink-0 @min-[18rem]/sponsor:hidden"/><span className="sr-only @min-[18rem]/sponsor:not-sr-only">Unpublish</span></button>
            <button type="button" className={`${action} border-transparent text-danger enabled:hover:bg-danger-soft`} title={`Delete ${entry.name}`} aria-label={`Delete ${entry.name}`} onClick={() => onDelete(entry)} disabled={busy}><FiTrash2 aria-hidden="true" className="size-4 shrink-0"/><span className="sr-only @min-[28rem]/sponsor:not-sr-only">Delete</span></button>
          </div>
          <p id={`sponsor-state-${entry._id}`} className="mt-2 text-sm leading-6 text-muted">{published ? 'The website already shows this version.' : entry.live ? 'Publish changes to update the website.' : 'Private draft. Publish when ready.'}</p>
        </footer>
      </li>;
    })}</ul> : <div className="flex flex-col overflow-hidden rounded-xl border border-ink/15 bg-soft">
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-6 text-center"><span className="mb-3 flex size-11 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-warning"><FiAward aria-hidden="true" className="size-5"/></span><h4 className="font-garamond text-2xl font-semibold">{entries.length ? 'No sponsors match these filters.' : 'Introduce your first partner.'}</h4><p className="mt-2 max-w-[38ch] text-sm leading-6 text-muted">{entries.length ? 'Clear the filters to review your sponsors.' : 'Add a name and logo, review the preview, then publish when ready.'}</p></div>
      <footer className="mt-auto flex justify-end border-t border-ink/12 bg-surface p-3"><button type="button" disabled={busy} className={adminAction} onClick={entries.length ? clearFilters : onNew}>{entries.length ? 'Clear filters' : 'Add first sponsor'}</button></footer>
    </div>}
    <p className="text-sm leading-6 text-muted">Showing {filtered.length} of {entries.length} sponsors</p>
  </section>;

  return <div className="@container/sponsors">
    <div className="mb-6 flex flex-col gap-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="w-full sm:max-w-sm"><AdminSearch id="admin-search" label="Search sponsors" placeholder="Find an organisation" value={query} onChange={setQuery}/></div><button type="button" onClick={onNew} disabled={busy} className={adminAction}><FiPlus aria-hidden="true"/>Add sponsor</button></div><div className="max-w-full self-start"><AdminSegments label="Sponsor status" value={state} onChange={setState} options={[[ 'all','All sponsors',entries.length],['published','Published',entries.filter(entry => entry.live).length],['draft','Drafts',entries.filter(entry => !entry.live).length]]}/></div></div>
    <section aria-label="Sponsor website preview" className={`${adminPanel} p-5 sm:p-6`}><AdminWebsitePreview resource="sponsors" entry={selected} content={{ ...content, sponsors: entries }} disabled={busy} showCards={false} cardSection={cardSection}/></section>
  </div>;
}
