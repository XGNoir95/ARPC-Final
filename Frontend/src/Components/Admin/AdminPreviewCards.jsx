import { FiImage } from 'react-icons/fi';
import { publicAsset } from '../../utils/publicAsset';
import { getCourseCover } from '../../utils/courseCovers';
import { kindNames } from '../../utils/adminPresentation';
import { adminFocus, adminPreviewCardGrid, adminPreviewSection } from './AdminUI.styles.js';
import SafeImage from '../SafeImage';

const headings = { sponsors: 'Sponsor cards', programmes: 'Programme cards', gallery: 'Gallery images', teams: 'Panel teams', lessons: 'Course lessons' };

export default function AdminPreviewCards({ resource, entry, items, selected, onSelect, disabled, hint }) {
  const heading = resource === 'home' ? entry.id === 'featured' ? 'Featured items' : 'About cards' : headings[resource];
  return <section aria-label={heading} className={adminPreviewSection}>
    <h3 className="self-start text-base font-semibold">{heading}</h3>
    {items.length ? <ol className={adminPreviewCardGrid}>{items.map((item, index) => {
      const id = item.id || item._id;
      const title = item.title || item.name || item.label || 'Untitled draft';
      const image = item.kind === 'courses' ? getCourseCover(item).cover : item.image || item.src;
      const description = item.summary || (item.kind === 'membership' ? 'Membership' : kindNames[item.kind]) || item.category || (resource === 'lessons' ? 'Lesson' : resource === 'sponsors' ? 'Club affiliation' : item.description);
      return <li key={`${item.kind || resource}:${id}`} className="flex min-w-0"><button type="button" disabled={disabled} aria-label={`Preview ${title}`} aria-pressed={selected === id} onClick={() => onSelect(id, index)} className={`flex min-h-24 w-full cursor-pointer items-center gap-3 rounded-xl border p-4 text-left ${adminFocus} disabled:cursor-not-allowed disabled:opacity-50 ${selected === id ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface hover:border-ink/40 hover:bg-soft/60'}`}>
        {image ? <SafeImage src={publicAsset(image)} alt="" className={`h-14 w-18 shrink-0 rounded-lg bg-soft ${resource === 'sponsors' || item.kind === 'courses' ? 'object-contain p-1' : 'object-cover'}`}/> : <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-soft text-muted"><FiImage aria-hidden="true" className="size-5"/></span>}
        <span className="min-w-0"><span className="block break-words text-base font-semibold">{title}</span>{description && <span className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{description}</span>}</span>
      </button></li>;
    })}</ol> : <div className="flex items-center justify-center rounded-xl border border-ink/15 bg-soft p-6 text-center text-sm leading-6 text-muted">No items are available for this section yet.</div>}
    <p className="text-sm leading-6 text-muted">{hint || (items.length ? 'Select a card to review it on the website.' : 'Add content to prepare this section.')}</p>
  </section>;
}
