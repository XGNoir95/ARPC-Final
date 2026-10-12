import { useCallback, useEffect, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiPause, FiPlay } from "react-icons/fi";
import { publicAsset } from "../utils/publicAsset";
import { journalOffset, journalPosition } from "../data/gallery";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";
const control = `inline-flex size-11 shrink-0 cursor-pointer sm:size-12 items-center justify-center rounded-full bg-transparent text-[#173d2e] transition-colors duration-200 hover:bg-[#E9AD5E] motion-reduce:transition-none ${focus}`;

function PhotoCaption({ photo }) {
  return <>
    <h3 className="font-garamond text-2xl leading-tight font-semibold sm:text-3xl">{photo.title}</h3>
    <p className="mt-2 text-xs leading-relaxed text-[#547366]">{photo.category} <span aria-hidden="true" className="mx-1.5">{"\u00b7"}</span> {photo.placeholder ? "Illustrative photo" : "Club artwork"}</p>
  </>;
}

function PhotoPage({ item, current, offset, reducedMotion, instant }) {
  const transition = { duration: reducedMotion || instant ? 0 : current ? 0.4 : 0.48, ease: [0.33, 0, 0.67, 1] };
  return <span role="img" aria-label={item.alt} className="relative block size-full [transform-style:preserve-3d]">
    {["left", "right"].map((side) => {
      const left = side === "left";
      // The reference turns a single leaf: left neighbours retain the left
      // face; right neighbours retain the right face. A selected page opens both.
      const angle = left ? (offset > 0 ? 168 : 12) : (offset < 0 ? -168 : -12);
      return <Motion.span key={side} aria-hidden="true" data-page-half={side} initial={false} animate={{ rotateY: angle }} transition={transition}
        className={`absolute inset-y-0 w-1/2 [backface-visibility:hidden] [transform-style:preserve-3d] ${left ? "left-0 origin-right" : "right-0 origin-left"}`}>
        <span className={`absolute inset-y-0 block overflow-hidden shadow-[0_12px_24px_-15px_rgba(23,61,46,0.55)] ${item.poster ? "bg-[#f6f8f3]" : "bg-transparent"} ${left ? "left-0 -right-px rounded-l-[1rem] border-y-2 border-l-2 border-white sm:rounded-l-[1.25rem]" : "-left-px right-0 rounded-r-[1rem] border-y-2 border-r-2 border-white sm:rounded-r-[1.25rem]"}`}>
          <img src={publicAsset(item.image)} alt="" aria-hidden="true" width="1200" height="960" decoding="async" draggable={false}
            className={`absolute top-0 h-full w-[calc(200%_-_2px)] max-w-none ${left ? "left-0" : "right-0"} ${item.poster ? "object-contain p-2 sm:p-5" : "object-cover"}`} />
          <span className={`pointer-events-none absolute inset-0 opacity-25 ${left ? "bg-linear-to-l from-black/35 via-transparent to-white/5" : "bg-linear-to-r from-black/35 via-transparent to-white/5"}`} />
          {current && !left && <span className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm sm:right-4 sm:bottom-4"><FiMaximize2 className="size-4" /></span>}
        </span>
      </Motion.span>;
    })}
  </span>;
}

export default function GalleryJournal({ photos, onOpen, viewerOpen = false }) {
  const [{ active, cursor, turn }, setJournal] = useState({ active: 0, cursor: 0, turn: null });
  const reducedMotion = useReducedMotion();
  const gesture = useRef(null);
  const suppressClickUntil = useRef(0);
  const journalRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");
  const [visible, setVisible] = useState(() => !document.hidden);
  const photo = photos[active];
  const select = (index, step) => setJournal((current) => {
    if (index === current.active) return current;
    const nextCursor = photos.length === 2 ? current.cursor + (step ?? 1) : index;
    return {
      active: index, cursor: nextCursor,
      turn: reducedMotion ? null : { from: current.active, to: index, fromCursor: current.cursor, toCursor: nextCursor, phase: "fold", token: {} },
    };
  });
  const move = useCallback((direction) => setJournal((current) => {
    const next = (current.active + direction + photos.length) % photos.length;
    const nextCursor = photos.length === 2 ? current.cursor + direction : next;
    return next === current.active ? current : { active: next, cursor: nextCursor, turn: reducedMotion ? null : { from: current.active, to: next, fromCursor: current.cursor, toCursor: nextCursor, phase: "fold", token: {} } };
  }), [photos.length, reducedMotion]);
  const transition = { duration: reducedMotion ? 0 : 0.48, ease: [0.33, 0, 0.67, 1] };
  const turnToken = turn?.token;
  useEffect(() => {
    if (!turnToken) return;
    const midpoint = window.setTimeout(() => setJournal((current) => {
      if (current.turn?.token !== turnToken) return current;
      return { ...current, turn: { ...current.turn, phase: "unfold" } };
    }), reducedMotion ? 0 : 240);
    const completion = window.setTimeout(() => setJournal((current) => current.turn?.token === turnToken ? { ...current, turn: null } : current), reducedMotion ? 0 : 480);
    return () => { window.clearTimeout(midpoint); window.clearTimeout(completion); };
  }, [turnToken, reducedMotion]);

  useEffect(() => {
    const refreshVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", refreshVisibility);
    let observer;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35), { threshold: 0.35 });
      observer.observe(journalRef.current);
    }
    return () => { document.removeEventListener("visibilitychange", refreshVisibility); observer?.disconnect(); };
  }, []);

  const playing = !paused && !hovered && !focused && !viewerOpen && !reducedMotion && inView && visible && photos.length > 1;
  useEffect(() => {
    if (!playing || turnToken) return;
    const timer = window.setTimeout(() => move(1), 6000);
    return () => window.clearTimeout(timer);
  }, [playing, turnToken, active, cursor, move]);

  // Two-photo albums need a decorative copy on each side so repeated Next
  // still opens from the right. Only one instance per photo is exposed to AT.
  const pages = photos.length === 2 ? [-1, 0, 1].map((side) => {
    const pageCursor = cursor + side;
    const index = ((pageCursor % 2) + 2) % 2;
    return { item: photos[index], index, pageCursor, duplicate: side === -1 };
  }) : photos.map((item, index) => ({ item, index }));

  return <div ref={journalRef} role="region" aria-roledescription="carousel" aria-label="Club photo journal"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={(event) => setFocused(event.target.matches(":focus-visible"))} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    className="min-w-0">
    <div tabIndex={0} aria-label="Photo pages. Use left and right arrow keys to browse." onKeyDown={(event) => {
      suppressClickUntil.current = 0;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
        event.currentTarget.focus({ preventScroll: true });
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault(); select(event.key === "Home" ? 0 : photos.length - 1);
        event.currentTarget.focus({ preventScroll: true });
      } else if (event.key === "Enter" && event.target === event.currentTarget) {
        event.preventDefault(); event.currentTarget.querySelector('[aria-current="true"]')?.click();
      }
    }}
      onPointerDown={(event) => {
        suppressClickUntil.current = 0;
        if (event.pointerType === "mouse" || !event.isPrimary) return;
        gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      }}
      onPointerUp={(event) => {
        const start = gesture.current;
        gesture.current = null;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          suppressClickUntil.current = performance.now() + 350;
          move(dx < 0 ? 1 : -1);
        }
      }}
      onPointerCancel={() => { gesture.current = null; }}
      data-turn-phase={turn?.phase}
      className={`relative isolate h-[clamp(18rem,82vw,34rem)] touch-pan-y overflow-hidden rounded-[1.5rem] bg-[#eef4ef] sm:rounded-[2rem] sm:h-[clamp(24rem,56vw,46rem)] ${focus}`}>
      {pages.map(({ item, index, pageCursor, duplicate }) => {
        const offset = pageCursor === undefined ? journalOffset(index, active, photos.length) : pageCursor - cursor;
        const depth = Math.abs(offset);
        const current = offset === 0;
        const hidden = depth > 3;
        const departing = pageCursor === undefined ? turn?.from === index : turn?.fromCursor === pageCursor;
        const arriving = pageCursor === undefined ? turn?.to === index : turn?.toCursor === pageCursor;
        const turning = !reducedMotion && !!turn && (departing || arriving);
        const position = journalPosition(offset);
        const previousOffset = turn ? journalOffset(index, turn.from, photos.length) : offset;
        const wrapped = pageCursor === undefined && !turning && turn && Math.abs(previousOffset - offset) > photos.length / 2;
        const layer = current ? 20 : Math.max(1, 10 - depth);
        return <div key={pageCursor === undefined ? item.id : `${item.id}-${pageCursor}`} aria-hidden={hidden || duplicate || undefined} data-folding={turning || undefined}
          style={{ "--page-layer": turning && departing && turn.phase === "fold" ? 24 : layer }}
          className="pointer-events-none absolute top-1/2 left-1/2 z-[var(--page-layer)] w-[78%] max-w-[46rem] -translate-x-1/2 -translate-y-1/2 [perspective:1400px] sm:w-[64%]">
          <Motion.button type="button" tabIndex={current ? 0 : -1}
            aria-label={`${current ? "View image" : "Show photo"}: ${item.title}`} aria-haspopup={current ? "dialog" : undefined}
            aria-current={current ? "true" : undefined}
            onClick={(event) => {
              if (performance.now() < suppressClickUntil.current) { suppressClickUntil.current = 0; return; }
              if (current) onOpen(index, event.currentTarget);
              else select(index, offset < 0 ? -1 : 1);
            }}
            initial={false} animate={{ x: `${position}%`, y: depth * 3, scale: 1 - Math.min(depth, 4) * 0.045, opacity: hidden ? 0 : 1 }} transition={wrapped ? { duration: 0 } : transition}
            className={`relative block aspect-[5/4] w-full rounded-[1rem] bg-transparent [backface-visibility:hidden] [transform-style:preserve-3d] sm:rounded-[1.25rem] ${hidden ? "pointer-events-none" : "pointer-events-auto"} ${current ? "cursor-zoom-in" : "cursor-pointer"} ${focus}`}>
            <PhotoPage item={item} current={current} offset={offset} reducedMotion={reducedMotion} instant={wrapped} />
          </Motion.button>
        </div>;
      })}
    </div>
    <div className="relative z-30 -mt-3 flex justify-center sm:-mt-4">
      <div role="group" aria-label="Album playback" className="flex items-center gap-1 rounded-full border border-[#173d2e]/10 bg-white p-2 shadow-[0_8px_24px_-12px_rgba(23,61,46,0.25)] sm:gap-2">
        {photos.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="Previous journal photo" className={control}><FiChevronLeft aria-hidden="true" className="size-5" /></button>}
        <div className="flex min-w-16 flex-col items-center gap-2 px-2">
          <p className="text-sm tabular-nums text-[#173d2e]">{String(active + 1).padStart(2, "0")} <span className="mx-1 text-[#547366]/60">/</span> {String(photos.length).padStart(2, "0")}</p>
          {photos.length > 1 && !reducedMotion && <div aria-hidden="true" className="h-0.5 w-14 overflow-hidden rounded-full bg-[#173d2e]/10">
            {playing && !turnToken && <Motion.span key={`${active}-${cursor}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6, ease: "linear" }} className="block size-full origin-left rounded-full bg-[#E9AD5E]" />}
          </div>}
        </div>
        {photos.length > 1 && <button type="button" onClick={() => move(1)} aria-label="Next journal photo" className={control}><FiChevronRight aria-hidden="true" className="size-5" /></button>}
        {photos.length > 1 && !reducedMotion && <>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#173d2e]/15" />
          <button type="button" aria-label={paused ? "Play slideshow" : "Pause slideshow"} title={paused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => { setPaused((value) => !value); if (paused) setFocused(false); }} className={control}>
            {paused ? <FiPlay aria-hidden="true" className="size-4" /> : <FiPause aria-hidden="true" className="size-4" />}
          </button>
        </>}
      </div>
    </div>
    <div role="status" aria-live={playing ? "off" : "polite"} aria-atomic="true" className="mx-auto grid max-w-3xl pt-5 text-center sm:pt-6">
      {/* Reserve only the compact caption's height to keep page turns steady. */}
      {photos.map((item) => <div key={item.id} aria-hidden="true" className="pointer-events-none invisible [grid-area:1/1]"><PhotoCaption photo={item} /></div>)}
      <div key={photo.id} className="[grid-area:1/1] [animation:gallery-photo-enter_220ms_ease-out_both] motion-reduce:[animation:none]">
        <PhotoCaption photo={photo} />
      </div>
    </div>
  </div>;
}
