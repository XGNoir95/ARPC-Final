import { useId, useState } from 'react';
import { FiEdit2, FiEye, FiEyeOff, FiPlus, FiTrash2, FiUpload, FiUsers } from 'react-icons/fi';
import { publicAsset } from '../utils/publicAsset';
import { titleOf } from '../utils/adminPresentation';
import { AdminAvatar, AdminBadge, AdminSearch, AdminSegments } from './AdminUI';
import AdminWebsitePreview from './AdminWebsitePreview';
import SafeImage from './SafeImage';
import { adminAction, adminFocus, adminPanel, adminPreviewCardGrid, adminPreviewSection, adminQuiet, adminTypography } from './AdminUI.styles';

const cardAction = `inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-1.5 text-sm font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40 ${adminFocus}`;
const actionGrid = 'grid grid-cols-4 gap-1 border-t border-ink/12 pt-3 @min-[18rem]/content-card:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] @min-[26rem]/content-card:grid-cols-4';

function EntryActions({ entry, onEdit, onPublish, onDelete, busy }) {
  const published = entry.live && !entry.hasChanges;
  const descriptionId = useId();
  const title = titleOf(entry);
  return <footer className="mt-auto pt-4">
    <div role="group" aria-label={`Actions for ${title}`} className={actionGrid}>
      <button type="button" disabled={busy} onClick={() => onEdit(entry)} aria-label={`Edit ${title}`} title={`Edit ${title}`} className={`${cardAction} border border-ink/15 bg-surface hover:bg-soft`}><FiEdit2 aria-hidden="true"/><span className="sr-only @min-[26rem]/content-card:not-sr-only">Edit</span></button>
      <button type="button" disabled={busy || published} onClick={() => onPublish(entry)} aria-label={published ? 'Published' : entry.live ? 'Publish changes' : 'Publish'} aria-describedby={descriptionId} title={published ? 'Published' : entry.live ? 'Publish changes' : 'Publish'} className={`${cardAction} bg-action text-on-action enabled:hover:bg-gold enabled:hover:text-brand`}><FiUpload aria-hidden="true" className="shrink-0 @min-[18rem]/content-card:hidden"/><span className="sr-only @min-[18rem]/content-card:not-sr-only">{published ? 'Published' : 'Publish'}</span></button>
      <button type="button" disabled={busy || !entry.live} onClick={() => onPublish(entry, true)} aria-label="Unpublish" title="Unpublish" className={`${cardAction} border border-ink/15 bg-surface hover:bg-soft`}><FiEyeOff aria-hidden="true" className="shrink-0 @min-[18rem]/content-card:hidden"/><span className="sr-only @min-[18rem]/content-card:not-sr-only">Unpublish</span></button>
      <button type="button" disabled={busy} onClick={() => onDelete(entry)} aria-label={`Delete ${title}`} title={`Delete ${title}`} className={`${cardAction} text-danger enabled:hover:bg-danger-soft`}><FiTrash2 aria-hidden="true"/><span className="sr-only @min-[26rem]/content-card:not-sr-only">Delete</span></button>
    </div>
    <p id={descriptionId} className="mt-2 min-h-12 text-sm leading-6 text-muted">{published ? 'The website already shows this version.' : entry.live ? 'Publish changes to update the website.' : 'Private draft. Publish when ready.'}</p>
  </footer>;
}

function TeamSummary({ entry, active, onPreview, busy }) {
  const members = Array.isArray(entry.members) ? entry.members : [];
  const title = titleOf(entry);
  return <>
    <div className="flex min-h-14 items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-medium text-muted"><FiUsers aria-hidden="true" className="size-5"/>{members.length} {members.length === 1 ? 'member' : 'members'}</span><button type="button" disabled={busy} onClick={onPreview} aria-label={`Preview ${title}`} aria-pressed={active} className={`${adminQuiet} size-11 shrink-0 px-0`}><FiEye aria-hidden="true"/></button></div>
    <h4 title={title} className="mt-4 min-h-14 line-clamp-2 break-words font-garamond text-2xl leading-7 font-semibold">{title}</h4>
    <p className="mt-2 min-h-12 line-clamp-2 text-sm leading-6 text-muted">{entry.description || 'Add a short introduction to this team.'}</p>
    <div className="mt-4 border-t border-ink/12 pt-4"><h5 className="mb-2 text-sm font-semibold">Team roster</h5>{members.length ? <ul className="min-h-42 space-y-2">{members.slice(0, 3).map((member, index) => <li key={member.id || index} className="flex min-h-12 items-center gap-3"><AdminAvatar name={member.name} image={member.image} size="size-10"/><div className="min-w-0"><p className="truncate text-sm font-semibold">{member.name || 'Name to be added'}</p><p className="mt-0.5 line-clamp-1 text-sm text-muted">{member.role || member.department || 'Role to be added'}</p></div></li>)}</ul> : <div className="flex min-h-42 items-center rounded-lg border border-dashed border-ink/20 bg-soft p-4 text-sm leading-6 text-muted">Add the people serving on this team in its draft.</div>}</div>
    <div className="mt-3 flex min-h-12 flex-wrap items-start justify-between gap-2"><AdminBadge value={entry.live ? 'published' : 'draft'}>{entry.live && entry.hasChanges ? 'Unpublished changes' : undefined}</AdminBadge><span className="text-sm leading-6 text-muted">{members.length > 3 ? `${members.length - 3} more in the preview` : members.length ? 'Full roster shown' : 'No members added'}</span></div>
  </>;
}

function GallerySummary({ entry, active, onPreview, busy }) {
  const title = titleOf(entry);
  return <>
    <button type="button" disabled={busy} aria-label={`Preview ${title}`} aria-pressed={active} onClick={onPreview} className={`relative block aspect-[16/10] w-full cursor-pointer overflow-hidden border-b border-ink/12 bg-soft disabled:opacity-50 ${adminFocus}`}>
      <SafeImage src={publicAsset(entry.image)} alt={entry.alt || ''} loading="lazy" className={`size-full ${entry.poster || entry.isPoster ? 'object-contain p-3' : 'object-cover'}`}/>
      <span className="absolute top-3 left-3"><AdminBadge value={entry.live ? 'published' : 'draft'}>{entry.live && entry.hasChanges ? 'Unpublished changes' : undefined}</AdminBadge></span><span className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full border border-ink/15 bg-surface text-ink"><FiEye aria-hidden="true" className="size-4"/></span>
    </button>
    <div className="px-4 pt-4 sm:px-5 sm:pt-5"><div className="flex min-h-6 items-center justify-between gap-2 text-sm text-muted"><span title={entry.category || 'Uncategorised'} className="min-w-0 flex-1 truncate font-medium">{entry.category || 'Uncategorised'}</span><span className="shrink-0">{entry.poster || entry.isPoster ? 'Poster' : 'Photo'}{entry.placeholder ? ' / Illustrative' : ''}</span></div><h4 title={title} className="mt-3 min-h-14 line-clamp-2 break-words font-garamond text-2xl leading-7 font-semibold">{title}</h4><p className="mt-2 min-h-12 line-clamp-2 text-sm leading-6 text-muted">{entry.description || 'Add a caption to tell the story behind this image.'}</p></div>
  </>;
}

export default function AdminContentLibrary({ resource, entries, content, onEdit, onNew, onPublish, onDelete, busy = false }) {
  const headingId = useId();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('library');
  const [selectedId, setSelectedId] = useState(null);
  const gallery = resource === 'gallery';
  const title = gallery ? 'Gallery images' : 'Panel teams';
  const noun = gallery ? 'images' : 'teams';
  const addLabel = gallery ? 'Add image' : 'Add team';
  const selected = entries.find(entry => entry.id === selectedId) || entries.find(entry => entry.live) || entries[0];
  const categories = [...new Set(entries.map(entry => entry.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const needle = query.trim().toLowerCase();
  const filtered = entries.filter(entry => (status === 'all' || (status === 'published' ? entry.live : !entry.live)) && (!gallery || category === 'all' || entry.category === category) && [titleOf(entry), entry.description, entry.category, ...(!gallery && Array.isArray(entry.members) ? entry.members.flatMap(member => [member.name, member.role, member.department]) : [])].filter(Boolean).join(' ').toLowerCase().includes(needle));
  const items = sort === 'title' ? [...filtered].sort((a, b) => titleOf(a).localeCompare(titleOf(b))) : filtered;
  const reset = () => { setQuery(''); setStatus('all'); setCategory('all'); };
  const cards = <section aria-label={gallery ? 'Manage gallery' : 'Manage panel teams'} className={adminPreviewSection}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-semibold">{gallery ? 'Image library' : 'Team cards'}</h3><p className="text-sm text-muted">{items.length} of {entries.length} {noun}</p></div>
    {entries.length > 0 && <div className="grid gap-3 rounded-xl border border-ink/12 bg-soft p-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="w-full xl:max-w-sm"><AdminSearch id="admin-search" label={gallery ? 'Search gallery' : 'Search panel teams'} placeholder={gallery ? 'Find an image or caption' : 'Find a team, member or role'} value={query} onChange={setQuery}/></div><div className="flex min-w-0 flex-wrap items-center gap-3">
        {gallery && <label className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium">Category<select aria-label="Gallery category" value={category} onChange={event => setCategory(event.target.value)} className="min-h-11 min-w-0 max-w-full rounded-lg border border-ink/15 bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-ink"><option value="all">All categories</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
        <label className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium">Sort<select aria-label={`Sort ${noun}`} value={sort} onChange={event => setSort(event.target.value)} className="min-h-11 min-w-0 max-w-full rounded-lg border border-ink/15 bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-ink"><option value="library">Library order</option><option value="title">{gallery ? 'Title A–Z' : 'Team name A–Z'}</option></select></label>
      </div></div>
      <AdminSegments label={`${title} publication status`} value={status} onChange={setStatus} options={[
        ['all', 'All', entries.length], ['published', 'Published', entries.filter(entry => entry.live).length], ['draft', 'Drafts', entries.filter(entry => !entry.live).length],
      ]}/>
    </div>}
    {items.length ? <ul className={adminPreviewCardGrid}>{items.map(entry => {
      const active = selected?.id === entry.id;
      const actions = <EntryActions entry={entry} onEdit={onEdit} onPublish={onPublish} onDelete={onDelete} busy={busy}/>;
      return <li key={entry._id || entry.id} className={`@container/content-card flex min-w-0 flex-col overflow-hidden rounded-xl border ${active ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface'}`}>
        {gallery ? <><GallerySummary entry={entry} active={active} onPreview={() => setSelectedId(entry.id)} busy={busy}/><div className="mt-auto px-4 pb-4 sm:px-5 sm:pb-5">{actions}</div></> : <div className="flex flex-1 flex-col p-4 sm:p-5"><TeamSummary entry={entry} active={active} onPreview={() => setSelectedId(entry.id)} busy={busy}/>{actions}</div>}
      </li>;
    })}</ul> : <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/15 bg-soft p-5"><div><h4 className="font-garamond text-2xl font-semibold">{entries.length ? `No ${noun} match these filters.` : gallery ? 'Start your club album.' : 'Introduce your first team.'}</h4><p className="mt-2 max-w-[65ch] text-sm leading-6 text-muted">{entries.length ? 'Clear the search and filters to review your collection.' : gallery ? 'Add an image and caption, check the preview and publish when ready.' : 'Add a team introduction and its members, then review the website preview.'}</p></div><button type="button" disabled={busy} onClick={entries.length ? reset : onNew} className={adminQuiet}>{entries.length ? 'Reset filters' : gallery ? 'Add first image' : 'Add first team'}</button></div>}
  </section>;

  return <section id={`manage-${resource}`} aria-labelledby={headingId} className={`${adminPanel} overflow-hidden`}>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/12 p-5 sm:p-6"><div className="min-w-0"><h2 id={headingId} className={adminTypography.sectionTitle}>{title}</h2><p className="mt-2 max-w-[70ch] text-base leading-7 text-muted">{gallery ? 'Choose the moments and artwork that tell the club’s story. Keep images, captions and categories together.' : 'Prepare each team’s introduction and roster. Review member names, roles and portraits before publishing.'}</p></div><button type="button" onClick={onNew} disabled={busy} className={adminAction}><FiPlus aria-hidden="true"/>{addLabel}</button></header>
    <div className="p-5 sm:p-6"><AdminWebsitePreview resource={resource} entry={selected} content={{ ...content, [resource]: entries }} disabled={busy} showCards={false} cardSection={cards}/></div>
  </section>;
}
