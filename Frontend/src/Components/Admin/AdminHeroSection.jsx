import { useRef, useState } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { heroSlides } from '../../utils/homeContent';
import { publicAsset } from '../../utils/publicAsset';
import { AdminBadge } from './AdminUI';
import { adminFocus, adminPanel, adminPreviewCardGrid, adminPreviewSection, adminQuiet, adminTypography } from './AdminUI.styles.js';
import AdminHeroPreview from './AdminHeroPreview';
import AdminPreviewToolbar from './AdminPreviewToolbar';
import SafeImage from '../SafeImage';

export default function AdminHeroSection({ hero, actions, disabled }) {
  const slides = heroSlides(hero);
  const [device, setDevice] = useState('desktop');
  const [selected, setSelected] = useState(slides[0].id);
  const controls = useRef([]);
  const index = Math.max(0, slides.findIndex(slide => slide.id === selected));
  const rawSlides = hero.slides || [];
  const select = next => setSelected(slides[(next + slides.length) % slides.length].id);
  const navigate = event => {
    const grid = controls.current[index]?.closest('ol');
    const columns = Math.max(1, grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 1);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, ArrowDown: index + columns, ArrowUp: index - columns, Home: 0, End: slides.length - 1 }[event.key];
    if (next === undefined || disabled) return;
    event.preventDefault();
    select(next);
    controls.current[(next + slides.length) % slides.length]?.focus();
  };
  return <section id="homepage-hero" aria-labelledby="homepage-hero-heading" className={`${adminPanel} scroll-mt-6 overflow-hidden`}>
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 p-5 sm:px-6 sm:py-5">
      <div><h2 id="homepage-hero-heading" className={adminTypography.sectionTitle}>Hero</h2><p className="mt-2 text-base leading-7 text-muted">Set the images and words that welcome visitors to ARPC.</p></div>
      <AdminBadge value={hero.live ? 'published' : 'draft'}>{hero._id ? hero.live && hero.hasChanges ? 'Unpublished changes' : undefined : 'Using default content'}</AdminBadge>
    </header>
    <div className="@container/preview p-5 sm:p-6">
      <div className="flex min-w-0 flex-col">
        <div className="mb-4"><AdminPreviewToolbar device={device} onChange={setDevice} disabled={disabled}/></div>
        <AdminHeroPreview hero={hero} device={device} index={index} className="flex-1" onSelect={select} disabled={disabled}/>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="min-w-0 text-sm leading-6 text-muted">Image and caption preview</p>
          <div role="group" aria-label="Hero preview navigation" className="flex shrink-0 gap-2">
            <button type="button" disabled={disabled || slides.length === 1} aria-label="Previous hero image" onClick={() => select(index - 1)} className={`${adminQuiet} size-11 px-0`}><FiArrowLeft aria-hidden="true"/></button>
            <button type="button" disabled={disabled || slides.length === 1} aria-label="Next hero image" onClick={() => select(index + 1)} className={`${adminQuiet} size-11 px-0`}><FiArrowRight aria-hidden="true"/></button>
          </div>
        </div>
      </div>
      <section aria-label="Hero image cards" className={adminPreviewSection}>
        <h3 className="text-base font-semibold">Image sequence</h3>
        <ol aria-label="Hero image sequence" onKeyDown={navigate} className={adminPreviewCardGrid}>
          {slides.map((slide, at) => {
            const raw = rawSlides.find(item => item.id === slide.id);
            const custom = Boolean(raw?.title?.trim() || raw?.description?.trim());
            return <li key={slide.id} className="flex min-h-0"><button ref={element => { controls.current[at] = element; }} type="button" aria-label={`Preview hero image ${at + 1}: ${slide.name}`} aria-pressed={at === index} disabled={disabled} onClick={() => select(at)} className={`flex h-full min-h-22 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left ${adminFocus} disabled:cursor-not-allowed disabled:opacity-50 ${at === index ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface hover:border-ink/40 hover:bg-soft/60'}`}>
              <span aria-hidden="true" className={`shrink-0 text-sm font-semibold tabular-nums ${at === index ? 'text-ink' : 'text-muted'}`}>{String(at + 1).padStart(2, '0')}</span>
              <SafeImage src={publicAsset(slide.image)} alt="" className="h-13 w-18 shrink-0 rounded-md object-cover"/>
              <span className="min-w-0"><span className="block break-words text-base font-semibold">{slide.name}</span><span className="mt-1 block text-sm leading-5 text-muted">{custom ? 'Custom caption' : 'Shared caption'}</span></span>
            </button></li>;
          })}
        </ol>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/12 pt-5">
            <p className="text-sm leading-6 text-muted">{hero.hasChanges || !hero.live ? 'Review your changes before publishing.' : 'This sequence is published on the homepage.'}</p>
            <div className="ml-auto">{actions}</div>
          </div>
      </section>
    </div>
  </section>;
}
