import { useId, useState } from 'react';
import { FiCalendar, FiClock, FiEdit2, FiEye, FiEyeOff, FiLayers, FiMapPin, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import { getCourseCover } from '../utils/courseCovers';
import { kindNames, shortDate } from '../utils/adminPresentation';
import { publicAsset } from '../utils/publicAsset';
import { AdminBadge, AdminSearch, AdminSegments } from './AdminUI';
import AdminWebsitePreview from './AdminWebsitePreview';
import SafeImage from './SafeImage';
import { adminAction, adminFocus, adminPanel, adminPreviewCardGrid, adminPreviewSection, adminQuiet, adminTypography } from './AdminUI.styles';

const descriptions = {
  events: 'Gatherings on campus and beyond. Prepare the date, artwork and invitation together.',
  webinars: 'Conversations that bring people together online. Set the schedule and details before publishing.',
  courses: 'Prepare the course introduction, cover and enrollment details, then build its lessons and materials.',
};
const cardAction = `inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-1.5 text-sm font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40 ${adminFocus}`;

export default function AdminProgrammeSection({ kind, entries, content, onNew, onEdit, onPublish, onDelete, onLessons, busy = false }) {
  const headingId = useId();
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('library');
  const label = kindNames[kind];
  const title = `${label}s`;
  const scoped = entries.filter(entry => entry.kind === kind);
  const selected = scoped.find(entry => entry.id === selectedId) || scoped.find(entry => entry.live) || scoped[0];
  const filtered = scoped.filter(entry => (status === 'all' || (status === 'published' ? entry.live : !entry.live)) && `${entry.title} ${entry.description || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const items = sort === 'title' ? [...filtered].sort((a, b) => a.title.localeCompare(b.title)) : sort === 'date' ? [...filtered].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999')) : filtered;
  const reset = () => { setQuery(''); setStatus('all'); };
  const cards = <section aria-label={`Manage ${title.toLowerCase()}`} className={adminPreviewSection}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-semibold">{label} cards</h3><p className="text-sm text-muted">{items.length} of {scoped.length} {title.toLowerCase()}</p></div>
    {scoped.length > 0 && <div className="flex flex-col gap-3 rounded-xl border border-ink/12 bg-soft p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="w-full sm:max-w-sm"><AdminSearch label={`Search ${title.toLowerCase()}`} placeholder={`Find ${title.toLowerCase()}`} value={query} onChange={setQuery}/></div><label className="flex items-center gap-3 text-sm font-medium">Sort<select aria-label={`Sort ${title.toLowerCase()}`} value={sort} onChange={event => setSort(event.target.value)} className="min-h-11 min-w-0 rounded-lg border border-ink/15 bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-ink"><option value="library">Library order</option>{kind !== 'courses' && <option value="date">Date, earliest first</option>}<option value="title">Title A–Z</option></select></label></div>
      <AdminSegments label={`${title} publication status`} value={status} onChange={setStatus} options={[
        ['all', 'All', scoped.length], ['published', 'Published', scoped.filter(entry => entry.live).length], ['draft', 'Drafts', scoped.filter(entry => !entry.live).length],
      ]}/>
    </div>}
    {items.length ? <ul className={adminPreviewCardGrid}>{items.map(entry => {
      const published = entry.live && !entry.hasChanges;
      const active = selected?.id === entry.id;
      const image = kind === 'courses' ? getCourseCover(entry).cover : publicAsset(entry.image || '/logo.jpg');
      return <li key={entry._id || entry.id} className={`@container/programme flex min-w-0 flex-col overflow-hidden rounded-xl border ${active ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface'}`}>
        <button type="button" disabled={busy} aria-label={`Preview ${entry.title}`} aria-pressed={active} onClick={() => setSelectedId(entry.id)} className={`relative block aspect-[16/8] w-full cursor-pointer overflow-hidden bg-soft disabled:opacity-50 ${adminFocus}`}>
          <SafeImage src={image} alt="" className={`size-full ${kind === 'courses' ? 'object-contain p-5' : entry.poster || entry.isPoster ? 'object-contain p-3' : 'object-cover'}`}/>
          <span className="absolute top-3 left-3"><AdminBadge value={entry.live ? 'published' : 'draft'}>{entry.live && entry.hasChanges ? 'Unpublished changes' : undefined}</AdminBadge></span>
          <span className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full border border-ink/15 bg-surface text-ink"><FiEye aria-hidden="true" className="size-4"/></span>
        </button>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h4 title={entry.title} className="min-h-14 line-clamp-2 break-words font-garamond text-2xl leading-7 font-semibold">{entry.title}</h4>
          <p className="mt-2 min-h-12 line-clamp-2 text-sm leading-6 text-muted">{entry.description || 'Add an introduction to this draft.'}</p>
          <dl className="mt-4 grid gap-2 border-t border-ink/12 pt-4 text-sm leading-6 text-muted">
            <div className="flex min-w-0 items-start gap-2"><dt className="mt-1 shrink-0"><FiCalendar aria-hidden="true"/><span className="sr-only">{kind === 'courses' ? 'Duration' : 'Date'}</span></dt><dd className="min-w-0 break-words">{kind === 'courses' ? entry.duration || 'Duration to be confirmed' : shortDate(entry.date)}</dd></div>
            <div className="flex min-w-0 items-start gap-2"><dt className="mt-1 shrink-0">{kind === 'courses' ? <FiLayers aria-hidden="true"/> : <FiClock aria-hidden="true"/>}<span className="sr-only">{kind === 'courses' ? 'Fee' : 'Time'}</span></dt><dd className="min-w-0 break-words">{kind === 'courses' ? Number(entry.fee) > 0 ? `BDT ${Number(entry.fee).toLocaleString('en-BD')}` : 'Free course' : entry.time || 'Time to be confirmed'}</dd></div>
            <div className="flex min-w-0 items-start gap-2"><dt className="mt-1 shrink-0"><FiMapPin aria-hidden="true"/><span className="sr-only">Location</span></dt><dd className="min-w-0 break-words">{entry.location || entry.format || 'Location to be confirmed'}</dd></div>
          </dl>
          <p className="mt-3 text-sm font-medium">{entry.registrationOpen === false ? 'Enrollments closed' : 'Accepting enrollments when published'}</p>
          <footer className="mt-auto pt-4">
            <div role="group" aria-label={`Actions for ${entry.title}`} className="grid grid-cols-4 gap-1 border-t border-ink/12 pt-3 @min-[18rem]/programme:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] @min-[26rem]/programme:grid-cols-4">
              <button type="button" disabled={busy} onClick={() => onEdit(entry)} aria-label={`Edit ${entry.title}`} title={`Edit ${entry.title}`} className={`${cardAction} border border-ink/15 bg-surface hover:bg-soft`}><FiEdit2 aria-hidden="true"/><span className="sr-only @min-[26rem]/programme:not-sr-only">Edit</span></button>
              <button type="button" disabled={busy || published} onClick={() => onPublish(entry)} aria-label={published ? 'Published' : entry.live ? 'Publish changes' : 'Publish'} title={published ? 'Published' : entry.live ? 'Publish changes' : 'Publish'} className={`${cardAction} bg-action text-on-action enabled:hover:bg-gold enabled:hover:text-brand`}><FiUpload aria-hidden="true" className="shrink-0 @min-[18rem]/programme:hidden"/><span className="sr-only @min-[18rem]/programme:not-sr-only">{published ? 'Published' : 'Publish'}</span></button>
              <button type="button" disabled={busy || !entry.live} onClick={() => onPublish(entry, true)} aria-label="Unpublish" title="Unpublish" className={`${cardAction} border border-ink/15 bg-surface hover:bg-soft`}><FiEyeOff aria-hidden="true" className="shrink-0 @min-[18rem]/programme:hidden"/><span className="sr-only @min-[18rem]/programme:not-sr-only">Unpublish</span></button>
              <button type="button" disabled={busy} onClick={() => onDelete(entry)} aria-label={`Delete ${entry.title}`} title={`Delete ${entry.title}`} className={`${cardAction} text-danger enabled:hover:bg-danger-soft`}><FiTrash2 aria-hidden="true"/><span className="sr-only @min-[26rem]/programme:not-sr-only">Delete</span></button>
            </div>
            {onLessons && <button type="button" disabled={busy} onClick={() => onLessons(entry)} aria-label={`Manage lessons for ${entry.title}`} className={`${adminQuiet} mt-3 w-full`}><FiLayers aria-hidden="true"/>Lessons & materials</button>}
          </footer>
        </div>
      </li>;
    })}</ul> : <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/15 bg-soft p-5"><div><h4 className="font-garamond text-2xl font-semibold">{scoped.length ? `No ${title.toLowerCase()} match these filters.` : `Create your first ${label.toLowerCase()}.`}</h4><p className="mt-2 text-sm leading-6 text-muted">{scoped.length ? 'Clear the search and publication filter to see all cards.' : 'Add the details, check the website preview and publish when ready.'}</p></div><button type="button" disabled={busy} onClick={scoped.length ? reset : () => onNew(kind)} className={adminQuiet}>{scoped.length ? 'Reset filters' : `Create ${label.toLowerCase()}`}</button></div>}
  </section>;

  return <section id={`manage-${kind}`} aria-labelledby={headingId} className={`${adminPanel} scroll-mt-6 overflow-hidden`}>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/12 p-5 sm:p-6"><div className="min-w-0"><h2 id={headingId} className={adminTypography.sectionTitle}>{title}</h2><p className="mt-2 max-w-[70ch] text-base leading-7 text-muted">{descriptions[kind]}</p></div><button type="button" onClick={() => onNew(kind)} disabled={busy} className={adminAction}><FiPlus aria-hidden="true"/>Add {label.toLowerCase()}</button></header>
    <div className="p-5 sm:p-6"><AdminWebsitePreview resource="programmes" programmeKind={kind} entry={selected} content={{ ...content, programmes: scoped }} disabled={busy} showCards={false} cardSection={cards}/></div>
  </section>;
}
