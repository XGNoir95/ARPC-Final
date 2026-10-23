import SafeImage from '../Components/SafeImage';
import { useContent } from "../contexts/ContentContext";
import StateView from "../Components/StateView";
import { ContentNotice, ContentUnavailable } from "../Components/ContentFeedback";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowDown, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { galleryHero, galleryPhotos } from "../data/gallery";
import GalleryJournal from "../Components/GalleryJournal";
import { publicAsset } from "../utils/publicAsset";
import { publicPageFrame as frame } from "../Components/PublicLayout.styles";
import HeroShade from "../Components/HeroShade";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";
const viewerControl = `inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-200 hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-brand motion-reduce:transition-none ${focus}`;

function PhotoViewer({ photos, index, trigger, onClose, onStep }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const photo = photos[index];

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    closeRef.current?.focus();
    return () => {
      if (typeof dialog.close === "function") dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [trigger]);

  return createPortal(<dialog ref={dialogRef} aria-labelledby="gallery-photo-title" aria-describedby="gallery-photo-description"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}
    onKeyDown={(event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        onStep(event.key === "ArrowRight" ? 1 : -1);
      }
      // The native dialog's cancel event handles Escape and traps keyboard focus.
    }}
    className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-6xl overflow-y-auto overscroll-contain rounded-2xl border border-ink/20 bg-field p-0 text-ink shadow-2xl [animation:gallery-photo-enter_220ms_ease-out_both] [&::backdrop]:bg-black/75 [&::backdrop]:backdrop-blur-sm motion-reduce:[animation:none]">
    <div className="sticky top-0 z-10 flex h-0 justify-end">
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close image viewer" className={`${viewerControl} mt-4 mr-4 bg-field/95 shadow-sm backdrop-blur-sm`}><FiX aria-hidden="true" className="size-5" /></button>
    </div>
    <div className="flex min-w-0 items-center justify-center bg-raised p-3 sm:p-6">
      <SafeImage key={photo.id} src={publicAsset(photo.image)} alt={photo.alt} className="max-h-[min(62dvh,42rem)] w-auto max-w-full object-contain [animation:gallery-photo-enter_220ms_ease-out_both] motion-reduce:[animation:none]" />
    </div>
    <div className="grid min-w-0 gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10">
      <div className="min-w-0">
        <p className="mb-2 text-xs text-muted sm:text-sm">{photo.category} {"\u00b7"} {photo.placeholder ? "Illustrative photo" : "Club artwork"}</p>
        <h2 id="gallery-photo-title" className="[overflow-wrap:anywhere] font-garamond text-3xl leading-tight font-semibold sm:text-4xl">{photo.title}</h2>
        <p id="gallery-photo-description" className="mt-2 max-w-[68ch] text-sm leading-[1.75] text-copy sm:text-base">{photo.description}</p>
      </div>
      <div className="flex items-center justify-between gap-5 border-t border-ink/15 pt-4 lg:border-0 lg:pt-0">
        <p role="status" aria-live="polite" className="text-sm tabular-nums text-muted">{index + 1} of {photos.length}</p>
        {photos.length > 1 && <div className="flex gap-2">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous image" className={viewerControl}><FiChevronLeft aria-hidden="true" className="size-5" /></button>
          <button type="button" onClick={() => onStep(1)} aria-label="Next image" className={viewerControl}><FiChevronRight aria-hidden="true" className="size-5" /></button>
        </div>}
      </div>
    </div>
  </dialog>, document.body);
}

export default function Gallery({ initialPhotoId, autoPlay = true, sectionOnly = false, preview = false } = {}) {
  const fillPreview = preview && sectionOnly;
  const [selection, setSelection] = useState(null);
  const content = useContent();
  const photos = content ? content.gallery : galleryPhotos;
  const closeViewer = useCallback(() => setSelection(null), []);
  const step = (direction) => setSelection((current) => current ? { ...current, index: (current.index + direction + photos.length) % photos.length } : current);
  const explore = () => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    document.getElementById("gallery-moments")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return <section aria-labelledby={sectionOnly ? 'gallery-moments-heading' : 'gallery-heading'} className={`bg-surface text-ink ${fillPreview ? 'max-lg:flex max-lg:flex-col' : ''}`}>
    {!sectionOnly && <header className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-neutral-900 text-[#eef4ef] sm:min-h-[25rem] lg:min-h-[28rem]">
      <SafeImage fallback="hide" src={publicAsset(galleryHero)} alt="" aria-hidden="true" fetchPriority="high" width="2048" height="1536" className="absolute inset-0 -z-20 size-full object-cover object-[center_58%]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/65" />
      <HeroShade />
      <div className={`${frame} flex flex-col gap-6 pt-32 pb-9 sm:gap-7 sm:pt-36 sm:pb-10 lg:pt-40 lg:pb-12`}>
        <h1 id="gallery-heading" className="font-garamond text-[clamp(2.5rem,9vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.025em] sm:text-[clamp(3.75rem,7vw,6rem)]"><span className="block">Life at</span>{" "}<span className="block text-[#E9AD5E]">ARPC.</span></h1>
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <p className="min-w-0 max-w-[66ch] flex-1 text-base leading-[1.75] lg:text-lg">The conversations, shared ideas and moments between them. Turn through our album and get to know the community.</p>
          <button type="button" onClick={explore} aria-label="Explore the gallery" className={`inline-flex size-14 shrink-0 cursor-pointer items-center justify-center self-end rounded-full border border-[#eef4ef]/50 text-[#eef4ef] transition-colors duration-200 hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-brand motion-reduce:transition-none sm:size-16 ${focus}`}><FiArrowDown aria-hidden="true" className="size-5" /></button>
        </div>
      </div>
    </header>}

    <section id="gallery-moments" aria-labelledby="gallery-moments-heading" className={`${frame} scroll-mt-6 pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pb-20 ${fillPreview ? 'max-lg:flex max-lg:flex-1 max-lg:flex-col max-lg:pb-20' : ''}`}>
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 md:flex-row md:items-end md:justify-between md:gap-8">
        <h2 id="gallery-moments-heading" className="font-garamond text-3xl leading-tight font-semibold sm:text-4xl">Moments we share.</h2>
        {photos.length > 1 && <p className="max-w-[38ch] text-sm leading-relaxed text-muted">Swipe or use the arrows to explore.</p>}
      </div>
      <ContentNotice content={content}/>
      {photos.length > 0 ? <GalleryJournal key={photos.map(p => p.id).join()} photos={photos} initialId={initialPhotoId} autoPlay={autoPlay} fillPreview={fillPreview} viewerOpen={selection !== null} onOpen={(index, trigger) => setSelection({ index, trigger })} /> : content?.loading || content?.error&&!content?.hasData ? <ContentUnavailable content={content} resource="the gallery"/> : <StateView fill={fillPreview} headingLevel={3} kind="gallery" title="No photos to display yet." description="Photos from club activities will appear here when they are available. Explore our programmes in the meantime." actions={[{label:'Explore programmes',to:'/catalogue'}, {label:'Meet the club',to:'/team',secondary:true}]}/>}
    </section>

    {selection !== null && photos[selection.index] && <PhotoViewer photos={photos} index={selection.index} trigger={selection.trigger} onClose={closeViewer} onStep={step} />}
  </section>;
}
