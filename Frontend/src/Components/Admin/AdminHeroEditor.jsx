import { useState } from 'react';
import { FiArrowUp, FiArrowDown, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { homepageDraft, heroSlides } from '../../utils/homeContent';
import { publicAsset } from '../../utils/publicAsset';
import AdminPageDraft, { DraftField } from './AdminPageDraft';
import AdminHeroPreview from './AdminHeroPreview';
import AdminPreviewToolbar from './AdminPreviewToolbar';
import AdminImageField from './AdminImageField';
import SafeImage from '../SafeImage';
import { adminDanger, adminFocus, adminPreviewCardGrid, adminPreviewSection, adminQuiet } from './AdminUI.styles.js';

export default function AdminHeroEditor({ item, onClose, onSaved }) {
  const [initial] = useState(() => homepageDraft('hero', item));
  const [value, setValue] = useState(initial);
  const [selected, setSelected] = useState(initial.slides[0].id);
  const [device, setDevice] = useState('desktop');
  const index = Math.max(0, value.slides.findIndex(slide => slide.id === selected));
  const photo = value.slides[index];
  const resolved = heroSlides(value)[index];
  const custom = Boolean(photo.title?.trim() || photo.description?.trim());
  const update = (key, next) => setValue(current => ({ ...current, [key]: next }));
  const updatePhoto = changes => setValue(current => ({ ...current, slides: current.slides.map(slide => slide.id === photo.id ? { ...slide, ...changes } : slide) }));
  const reorder = direction => {
    const next = index + direction;
    if (next < 0 || next >= value.slides.length) return;
    const slides = [...value.slides];
    [slides[index], slides[next]] = [slides[next], slides[index]];
    update('slides', slides);
  };
  const add = () => {
    if (value.slides.length >= 8) return;
    const slide = { id: crypto.randomUUID(), name: '', image: '', title: '', description: '' };
    update('slides', [...value.slides, slide]); setSelected(slide.id);
  };
  const remove = () => {
    if (value.slides.length === 1) return;
    const slides = value.slides.filter(slide => slide.id !== photo.id);
    update('slides', slides); setSelected(slides[Math.min(index, slides.length - 1)].id);
  };
  const preview = ({ disabled }) => <div className="@container/preview">
    <div className="min-w-0">
    <div className="mb-4"><AdminPreviewToolbar device={device} onChange={setDevice} disabled={disabled} description={custom ? 'Custom caption for this image' : 'Using the shared caption'}/></div>
    <AdminHeroPreview hero={value} index={index} device={device} onSelect={next => setSelected(value.slides[next].id)} disabled={disabled}/>
    </div>
    <section aria-label="Hero image cards" className={adminPreviewSection}><h3 className="text-base font-semibold">Image sequence</h3>
    <div role="group" aria-label="Select hero image to edit" className={adminPreviewCardGrid}>
      {value.slides.map((slide, at) => <button key={slide.id} type="button" aria-label={`Preview hero image ${at + 1}`} aria-pressed={at === index} disabled={disabled} onClick={() => setSelected(slide.id)} className={`flex min-h-22 min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 text-left ${adminFocus} disabled:cursor-not-allowed disabled:opacity-50 ${at === index ? 'border-ink/55 bg-raised' : 'border-ink/20 bg-surface hover:border-ink/40'}`}>
        {slide.image ? <SafeImage src={publicAsset(slide.image)} alt="" className="h-11 w-14 shrink-0 rounded-md object-cover"/> : <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-md bg-raised text-muted"><FiImage aria-hidden="true"/></span>}
        <span className="min-w-0"><span className="block text-xs font-semibold tabular-nums text-muted">{String(at + 1).padStart(2, '0')}</span><span className="mt-0.5 block truncate text-sm font-semibold">{slide.name || `Image ${at + 1}`}</span></span>
      </button>)}
    </div>
    <div className="mt-4 flex justify-end border-t border-ink/12 pt-4"><button type="button" disabled={disabled || value.slides.length >= 8} onClick={add} className={adminQuiet}><FiPlus aria-hidden="true"/>Add hero image</button></div>
    </section>
  </div>;
  return <AdminPageDraft title="Edit homepage hero" resource="home" item={item} initial={initial} value={value} onClose={onClose} onSaved={onSaved} layout="canvas" preview={preview} validate={draft => draft.slides.some(slide => !slide.image.trim()) ? 'Choose an image for every hero slide before saving.' : null}>
    {({ disabled, onUploadBusy }) => <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-5">
        <div><h3 className="font-garamond text-2xl font-semibold">Image {index + 1}{photo.name ? ` · ${photo.name}` : ''}</h3><p className="mt-1 text-sm leading-6 text-muted">Choose the artwork and wording for this position.</p></div>
        <div role="group" aria-label="Selected image actions" className="flex flex-wrap gap-2">
          <button type="button" aria-label={`Move photo ${index + 1} up`} disabled={index === 0} onClick={() => reorder(-1)} className={`${adminQuiet} size-11 px-0`} title="Move earlier"><FiArrowUp aria-hidden="true"/></button>
          <button type="button" aria-label={`Move photo ${index + 1} down`} disabled={index === value.slides.length - 1} onClick={() => reorder(1)} className={`${adminQuiet} size-11 px-0`} title="Move later"><FiArrowDown aria-hidden="true"/></button>
          <button type="button" aria-label={`Remove photo ${index + 1}`} disabled={value.slides.length === 1} onClick={remove} className={`${adminDanger} border border-danger/20`}><FiTrash2 aria-hidden="true"/>Remove</button>
        </div>
      </div>
      <div className="grid min-w-0 items-stretch gap-7 md:grid-cols-2">
        <div role="group" aria-label="Hero image controls" className="flex min-w-0 flex-col gap-5">
          <DraftField label={`Photo ${index + 1} name`} value={photo.name} onChange={name => updatePhoto({ name })} maxLength={80} help="Optional. Leave blank to use the image number."/>
          <AdminImageField key={photo.id} label={`Hero image ${index + 1}`} value={photo.image} onChange={image => updatePhoto({ image })} disabled={disabled} onBusyChange={onUploadBusy} fill/>
        </div>
        <div role="group" aria-label="Hero wording" className="flex min-w-0 flex-col gap-5 [&>div]:flex [&>div]:flex-1 [&>div]:flex-col [&_textarea]:flex-1">
          <DraftField label={`Photo ${index + 1} headline`} value={photo.title} onChange={title => updatePhoto({ title })} placeholder={resolved.title} multiline rows={3} maxLength={200}/>
          <DraftField label="Arabic greeting" value={value.arabicGreeting} onChange={next => update('arabicGreeting', next)} lang="ar" dir="rtl" multiline rows={2} maxLength={300} help="Used on every hero image."/>
          <DraftField label={`Photo ${index + 1} introduction`} value={photo.description} onChange={description => updatePhoto({ description })} placeholder={resolved.description} multiline rows={3} maxLength={1000}/>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-ink/10 pt-5">
        <p className="min-w-0 max-w-[65ch] text-sm leading-6 text-muted">Blank fields reuse the first completed image caption, then the saved default wording.</p>
        <button type="button" disabled={!custom} onClick={() => updatePhoto({ title: '', description: '' })} className={`min-h-11 cursor-pointer rounded text-sm font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted disabled:no-underline ${adminFocus}`}>Use shared caption</button>
      </div>
    </>}
  </AdminPageDraft>;
}
