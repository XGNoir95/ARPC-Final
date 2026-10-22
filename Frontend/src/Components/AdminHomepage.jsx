import { useState } from 'react';
import { FiEdit2, FiUpload, FiCalendar, FiEye } from 'react-icons/fi';
import { homepageDraft, defaultFeatured, publishedProgrammes, featuredItems } from '../utils/homeContent';
import { kindNames } from '../utils/adminPresentation';
import { publicAsset } from '../utils/publicAsset';
import { AdminBadge } from './AdminUI';
import AdminHeroSection from './AdminHeroSection';
import AdminWebsitePreview from './AdminWebsitePreview';
import SafeImage from './SafeImage';
import { adminAction, adminQuiet, adminPanel, adminTypography, adminFocus, adminPreviewCardGrid, adminPreviewSection } from './AdminUI.styles';

function SectionActions({ entry, label, onEdit, onPublish, busy, alignEnd = false, compact = false }) {
  const published = entry?._id && entry.live && !entry.hasChanges;
  const quiet = compact ? `inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface px-2.5 py-2 text-sm font-medium text-ink hover:bg-soft disabled:opacity-40 ${adminFocus}` : adminQuiet;
  const primary = compact ? `inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-action px-2.5 py-2 text-sm font-semibold text-on-action hover:bg-gold hover:text-brand disabled:opacity-40 ${adminFocus}` : adminAction;
  return <div role="group" aria-label={`${entry.title || label} actions`} className={`flex flex-wrap items-center gap-2 ${alignEnd ? 'justify-end' : ''}`}><button type="button" disabled={busy} aria-label={label === 'card' ? `Edit ${entry.title}` : undefined} onClick={() => onEdit(entry)} className={`${quiet} ${alignEnd ? 'order-last' : ''}`}><FiEdit2 aria-hidden="true"/>Edit {label}</button>{entry?._id && <><button type="button" disabled={busy || published} aria-label={compact && entry.live && !published ? 'Publish changes' : undefined} onClick={() => onPublish(entry)} className={primary}>{!(compact && published) && <FiUpload aria-hidden="true"/>}{published ? 'Published' : entry.live && !compact ? 'Publish changes' : 'Publish'}</button>{entry.live && <button type="button" disabled={busy} onClick={() => onPublish(entry, true)} className={quiet}>Unpublish</button>}</>}</div>;
}

export default function AdminHomepage({ entries, programmes, onEdit, onPublish, busy }) {
  const [selectedAbout, setSelectedAbout] = useState('about-us');
  const [selectedFeatured, setSelectedFeatured] = useState(0);
  const entry = id => homepageDraft(id, entries.find(item => item.id === id));
  const hero = entry('hero');
  const featured = entry('featured');
  const content = { home: entries, programmes: publishedProgrammes(programmes) };
  const featuredCards = featuredItems(content.programmes, featured);
  const featuredIndex = selectedFeatured % Math.max(1, featuredCards.length);
  return <div className="space-y-8">
    <nav aria-label="Homepage sections" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/12 pb-4">{[['hero','Hero'],['about','About us'],['featured','Featured']].map(([id,label]) => <a key={id} href={`#homepage-${id}`} onClick={event => { event.preventDefault(); document.getElementById(`homepage-${id}`)?.scrollIntoView?.({ block: 'start' }); }} className="inline-flex min-h-11 items-center rounded text-base font-semibold text-ink underline decoration-ink/20 underline-offset-8 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">{label}</a>)}</nav>
    <AdminHeroSection hero={hero} disabled={Boolean(busy)} actions={<SectionActions entry={hero} label="hero" onEdit={onEdit} onPublish={onPublish} busy={busy}/>}/>
    <section id="homepage-about" aria-labelledby="homepage-about-heading" className={`${adminPanel} scroll-mt-6 overflow-hidden`}>
      <header className="border-b border-ink/10 p-5 sm:p-6"><h2 id="homepage-about-heading" className={adminTypography.sectionTitle}>About us</h2><p className="mt-2 text-base leading-7 text-muted">Images, short introductions and expanded wording for the three homepage cards.</p></header>
      <div className="@container/preview p-5 sm:p-6">
        <AdminWebsitePreview resource="home" entry={entry(selectedAbout)} content={content} disabled={busy} showCards={false}/>
        <section className={adminPreviewSection}><h3 className="text-base font-semibold">About cards</h3><div aria-label="About cards" className={adminPreviewCardGrid}>{['about-us','our-mission','our-vision'].map(id => {
        const card = entry(id);
        return <article key={id} className={`flex min-w-0 flex-col rounded-xl border p-4 ${selectedAbout === id ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface'}`}>
          <div className="flex items-start gap-3 pb-4"><SafeImage src={publicAsset(card.image)} alt="" className="size-14 shrink-0 rounded-lg object-cover"/><div className="min-w-0 flex-1"><h4 className="break-words font-garamond text-2xl font-semibold">{card.title}</h4><p className="mt-1 text-sm leading-6 text-muted">{card.summary}</p></div><button type="button" disabled={busy} aria-label={`Preview ${card.title}`} aria-pressed={selectedAbout === id} onClick={() => setSelectedAbout(id)} className={`${adminQuiet} size-11 shrink-0 px-0`}><FiEye aria-hidden="true"/></button></div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/12 pt-3"><AdminBadge value={card.live ? 'published' : 'draft'}>{card._id ? card.live && card.hasChanges ? 'Unpublished changes' : undefined : 'Using default content'}</AdminBadge><SectionActions entry={card} label="card" onEdit={onEdit} onPublish={onPublish} busy={busy}/></div>
        </article>;
      })}</div></section></div>
    </section>
    <section id="homepage-featured" aria-labelledby="homepage-featured-heading" className={`${adminPanel} scroll-mt-6 overflow-hidden`}>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 p-5 sm:p-6"><div><h2 id="homepage-featured-heading" className={adminTypography.sectionTitle}>Featured</h2><p className="mt-2 text-base leading-7 text-muted">A place for events, webinars, courses and membership applications.</p></div><AdminBadge value={featured.live ? 'published' : 'draft'}>{featured._id ? featured.live && featured.hasChanges ? 'Unpublished changes' : undefined : 'Automatic selection'}</AdminBadge></header>
      <div className="p-5 sm:p-6"><AdminWebsitePreview resource="home" entry={featured} content={content} disabled={busy} showCards={false} index={featuredIndex} onSelect={setSelectedFeatured} cardSection={
        <section aria-label="Featured management" className={adminPreviewSection}>
          <h3 className="self-start text-base font-semibold">Featured items</h3>
          <div data-featured-panel className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink/15 bg-soft">
            <div className="flex items-start gap-3 border-b border-ink/12 px-4 py-3"><FiCalendar aria-hidden="true" className="mt-1 size-5 shrink-0 text-muted"/><div className="min-w-0"><h4 className="text-base font-semibold">{featured.selections?.length ? `${featured.selections.length} items selected` : 'Selected automatically'}</h4>{featuredCards.length > 0 && <p className="mt-1 text-sm leading-6 text-muted">{featured.selections?.length ? 'Your chosen order appears on the homepage.' : 'Upcoming dates first, with a mix of programme types.'}</p>}</div></div>
            {featuredCards.length > 0 ? <ol aria-label="Featured items" className={`${adminPreviewCardGrid} p-3`}>{featuredCards.map((card, index) => <li key={`${card.kind}:${card.id}`} className="flex min-w-0"><button type="button" disabled={busy} aria-label={`Preview featured item ${index + 1}: ${card.title}`} aria-pressed={featuredIndex === index} onClick={() => setSelectedFeatured(index)} className={`flex min-h-20 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left ${adminFocus} disabled:cursor-not-allowed disabled:opacity-50 ${featuredIndex === index ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface hover:border-ink/40 hover:bg-soft/60'}`}><span className="shrink-0 text-sm font-semibold tabular-nums text-muted">{String(index + 1).padStart(2, '0')}</span><SafeImage src={publicAsset(card.image || '/logo.jpg')} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover"/><span className="min-w-0"><span className="line-clamp-2 text-base leading-6 font-semibold">{card.title}</span><span className="mt-1 block text-sm leading-5 text-muted">{card.kind === 'membership' ? 'Membership' : kindNames[card.kind]}</span></span></button></li>)}</ol> : <div className="flex flex-1 flex-col justify-center px-4 py-4 text-center"><h4 className="font-garamond text-2xl leading-tight font-semibold">No featured items yet.</h4><p className="mx-auto mt-2 max-w-[38ch] text-sm leading-6 text-muted">Publish a programme, or add a membership announcement.</p></div>}
            <footer className="mt-auto flex justify-end border-t border-ink/12 bg-surface px-3 py-3"><SectionActions entry={{...defaultFeatured,...featured}} label="featured" onEdit={onEdit} onPublish={onPublish} busy={busy} alignEnd compact/></footer>
          </div>
          <p className="text-sm leading-6 text-muted">Only published programmes appear on the website.</p>
        </section>
      }/></div>
    </section>
  </div>;
}
