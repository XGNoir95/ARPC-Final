import { affiliations as sampleAffiliations } from "../../data/sponsors";
import { useContent } from "../../contexts/ContentContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { publicAsset } from "../../utils/publicAsset";
import { publicPageFrame } from "../PublicLayout.styles";

const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
const nameFocusStyle = "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink";

const Sponsors = ({ autoPlay = true, initialId } = {}) => {
  const content = useContent();
  const affiliations = content ? content.sponsors : sampleAffiliations;
  const wrap = useCallback(index => (index + affiliations.length) % affiliations.length, [affiliations.length]);
  const midpoint = Math.floor(affiliations.length / 2);
  const distanceFrom = (index, active) => wrap(index - active + midpoint) - midpoint;
  const [storedActive, setActive] = useState(() => Math.max(0, affiliations.findIndex(item => item.id === initialId)));
  const active = storedActive % Math.max(1, affiliations.length);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [held, setHeld] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef(null);
  const buttons = useRef([]);
  const focusSelection = useRef(false);
  const playing = autoPlay && !hovered && !focused && !held && !reducedMotion;

  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference?.matches ?? false);
    updatePreference();
    preference?.addEventListener("change", updatePreference);
    return () => preference?.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!playing || affiliations.length < 2) return;
    const timer = window.setTimeout(() => setActive((index) => wrap(index + 1)), 3600);
    return () => window.clearTimeout(timer);
  }, [active, playing, wrap, affiliations.length]);

  useEffect(() => {
    if (!focusSelection.current) return;
    buttons.current[active]?.focus({ preventScroll: true });
    focusSelection.current = false;
  }, [active]);

  const selectWithKeyboard = (event) => {
    let next;
    if (event.key === "ArrowDown") next = wrap(active + 1);
    else if (event.key === "ArrowUp") next = wrap(active - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = affiliations.length - 1;
    else return;
    event.preventDefault();
    focusSelection.current = true;
    setActive(next);
  };

  const releaseTouch = () => {
    touchStart.current = null;
    setHeld(false);
  };

  if (!affiliations.length) return null;
  return (
    <section aria-labelledby="affiliations-heading" lang="en" className="bg-surface py-12 text-justify md:py-16">
      <div className={`${publicPageFrame} grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:grid-rows-[auto_auto_auto_auto] lg:gap-x-8 lg:gap-y-0 xl:gap-x-10 2xl:gap-x-28`}>
        <div className="@container flex min-w-0 flex-col lg:row-start-2 lg:h-full">
          <h2 id="affiliations-heading" className="mb-5 font-garamond text-[clamp(2rem,10cqi,3rem)] leading-none font-bold text-ink lg:-translate-y-[0.15em]">
            Our Affiliations
          </h2>
          <div className="grid grid-cols-[minmax(0,1fr)_clamp(3.5rem,14cqi,5.5rem)] items-center gap-3 rounded-[0.35rem_1.75rem_0.35rem_0.35rem] bg-brand p-5 sm:gap-4 sm:p-7">
            <p className="font-garamond text-[clamp(1.375rem,7.2cqi,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white">
              <span className="block">Read together.</span>
              <span className="block">Reach further.</span>
            </p>
            <svg aria-hidden="true" viewBox="0 0 88 88" fill="none" className="w-full text-[#eef4ef]">
              <path d="M8 27v38l35 12 37-13V25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 18c11-2 21 1 31 8v43c-10-7-20-10-31-8V18Z" fill="var(--color-brand-leaf)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M43 26c10-7 21-10 33-8v43c-12-2-23 1-33 8V26Z" fill="var(--color-brand-leaf-light)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M59 18v26l5-4 5 2V17" fill="#E9AD5E" />
              <path d="m19 30 16 6m-16 4 16 6m-16 4 11 4m20-2 17-6m-17 16 17-6" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M43 27v48" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="mt-6 space-y-4 text-[clamp(1rem,3.7cqi,1.2rem)] leading-relaxed text-ink/80">
            <p>
              Meet the publishers, foundations and community organisations that share ARPC’s interest
              in learning and service.
            </p>
            <p>
              A shared idea can spark a conversation, open a new perspective or inspire an act of kindness.
              Together, we give those ideas room to grow.
            </p>
          </div>
          <div className="pt-7 lg:mt-auto">
            <a
              href="mailto:info@arpc.club?subject=An%20affiliation%20with%20ARPC"
              className={`group flex min-h-14 w-full items-center justify-between gap-3 rounded-full border border-ink/30 bg-soft px-5 py-2.5 font-semibold text-ink transition-colors duration-200 hover:border-ink hover:bg-action hover:text-on-action motion-reduce:transition-none sm:text-lg ${focusStyle}`}
            >
              Let’s work together
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-action text-on-action transition-colors duration-200 group-hover:bg-surface group-hover:text-ink motion-reduce:transition-none">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Affiliations carousel"
          className="relative w-full min-w-0 [--screen-height:clamp(18rem,66.666cqi,38rem)] [--screen-bleed:1.5rem] [--stage-height:calc(var(--screen-height)+2*var(--screen-bleed))] lg:[--screen-height:clamp(30rem,66.666cqi,38rem)] xl:[--screen-height:clamp(33rem,66.666cqi,38rem)] lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:grid lg:grid-rows-subgrid"
          onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
          onPointerLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
        >
          {/* Shared rows align the introduction with the screen, excluding the logo rail's bleed. */}
          <div aria-hidden="true" className="@container hidden lg:row-start-1 lg:block">
            <div className="h-[var(--screen-bleed)]" />
          </div>
          <div aria-hidden="true" className="@container hidden lg:row-start-2 lg:block">
            <div className="h-[var(--screen-height)]" />
          </div>
          <div aria-hidden="true" className="@container hidden lg:row-start-3 lg:block">
            <div className="h-[var(--screen-bleed)]" />
          </div>
          <div className="@container lg:pointer-events-none lg:absolute lg:inset-0">
            <div
              id="affiliations-slider"
              onPointerDown={(event) => {
                if (event.pointerType !== "touch") return;
                touchStart.current = event.clientY;
                setHeld(true);
                event.currentTarget.setPointerCapture?.(event.pointerId);
              }}
              onPointerUp={(event) => {
                if (touchStart.current !== null) {
                  const swipe = event.clientY - touchStart.current;
                  if (Math.abs(swipe) > 40) setActive((index) => wrap(index + (swipe < 0 ? 1 : -1)));
                }
                releaseTouch();
              }}
              onPointerCancel={releaseTouch}
              onLostPointerCapture={releaseTouch}
              className="@container pointer-events-auto relative grid h-[var(--stage-height)] touch-pan-x grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] overflow-clip [--logo-step:9rem] [--name-step:5rem] @sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @sm:[--logo-step:11.5rem] @sm:[--name-step:5.75rem] @lg:[--logo-step:15rem] @lg:[--name-step:6.5rem]"
            >
              {/* The landscape screen stays centred while the logo rail passes beyond its edges. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-[var(--screen-height)] -translate-y-1/2 overflow-hidden rounded-[1.5rem] border-[3px] border-ink bg-field shadow-[inset_0_0_0_3px_white,0_12px_30px_-24px_rgba(14,41,30,0.4)] @sm:rounded-[1.75rem]">
                <div className="absolute inset-y-0 left-0 flex w-8 flex-col items-center justify-around border-r border-ink/20 bg-raised py-8 shadow-[inset_-3px_0_0_rgba(255,255,255,0.5)] @sm:w-11 @sm:py-10">
                  <span className="absolute top-3 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-brand/70 ring-2 ring-white/60 @sm:top-4" />
                  {["Learning", "Community", "Service"].map((value) => (
                    <span key={value} className="rotate-180 text-[9px] font-medium leading-none text-ink/80 [writing-mode:vertical-rl] @sm:text-[11px]">
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              <ul
                aria-label="Affiliated organisations"
                aria-describedby="affiliations-keyboard-help"
                onKeyDown={selectWithKeyboard}
                className="relative z-10 my-auto ml-11 h-[var(--screen-height)] min-w-0 overflow-clip [mask-image:linear-gradient(to_bottom,transparent,black_23%,black_77%,transparent)] @sm:ml-16"
              >
                {affiliations.map((affiliation, index) => {
                  const distance = distanceFrom(index, active);
                  const selected = distance === 0;
                  const outside = Math.abs(distance) > 2;
                  return (
                    <li
                      key={affiliation.src}
                      aria-hidden={outside}
                      aria-posinset={index + 1}
                      aria-setsize={affiliations.length}
                      style={{
                        "--name-transform": `translateY(calc(-50% + ${distance} * var(--name-step)))`,
                        "--name-opacity": selected ? 1 : Math.abs(distance) === 1 ? 0.55 : outside ? 0 : 0.25,
                      }}
                      className={`absolute inset-x-0 top-1/2 pr-1 [transform:var(--name-transform)] opacity-[var(--name-opacity)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none @sm:pr-3 ${outside ? "pointer-events-none invisible" : ""}`}
                    >
                      <button
                        ref={(node) => { buttons.current[index] = node; }}
                        type="button"
                        aria-pressed={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setActive(index)}
                        className={`relative min-h-11 w-full cursor-pointer rounded-sm py-1 text-left font-garamond leading-[1.15] wrap-break-word text-ink transition-[font-size,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-ink motion-reduce:transition-none ${selected ? "text-[clamp(1.125rem,5.2cqi,2.25rem)] font-semibold" : "text-[clamp(0.9375rem,3.6cqi,1.5rem)] font-medium"} ${nameFocusStyle}`}
                      >
                        {affiliation.name}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div aria-hidden="true" className="relative h-full min-w-0 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
                {affiliations.map((affiliation, index) => {
                  const distance = distanceFrom(index, active);
                  const selected = distance === 0;
                  const outside = Math.abs(distance) > 2;
                  return (
                    <div
                      key={affiliation.src}
                      style={{
                        "--logo-transform": `translate(-50%, calc(-50% + ${distance} * var(--logo-step))) scale(${selected ? 1 : 0.9})`,
                        "--logo-opacity": selected ? 1 : outside ? 0 : 0.55,
                      }}
                      className={`absolute top-1/2 left-1/2 flex h-32 w-[90%] max-w-xs items-center justify-center rounded-xl border bg-white p-2 [transform:var(--logo-transform)] opacity-[var(--logo-opacity)] shadow-[0_12px_35px_-20px_rgba(14,41,30,0.25)] transition-[transform,opacity,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none @sm:h-40 @sm:w-[86%] @sm:p-5 @lg:h-52 @lg:p-7 ${selected ? "border-ink/30" : "border-ink/8"} ${outside ? "invisible" : ""}`}
                    >
                      <img
                        src={publicAsset(affiliation.src)}
                        alt=""
                        draggable="false"
                        decoding="async"
                        className={affiliation.wide ? "max-h-full w-full object-contain" : "size-20 max-w-full object-contain @sm:size-28 @lg:size-36"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p id="affiliations-keyboard-help" className="sr-only">
            Use the up and down arrow keys to browse affiliations. Home selects the first; End selects the last.
          </p>
        </div>

        <div className="flex justify-center lg:col-span-2 lg:row-start-4 lg:mt-6">
          <div
            role="group"
            aria-label="Carousel navigation"
            onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
            onPointerLeave={() => setHovered(false)}
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
            }}
            className="flex items-center gap-2 rounded-full border border-ink/25 bg-soft p-1 pl-4 shadow-[0_4px_12px_rgba(14,41,30,0.08)]"
          >
            <p role="status" aria-live={focused ? "polite" : "off"} aria-label={`Affiliation ${active + 1} of ${affiliations.length}`} className="border-r border-ink/20 pr-3 text-sm text-ink/80 tabular-nums">
              <span className="font-semibold text-ink">{String(active + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="mx-2 text-ink/30">/</span>
              {String(affiliations.length).padStart(2, "0")}
            </p>
            <div className="flex">
              {[{ label: "Previous affiliation", step: -1 }, { label: "Next affiliation", step: 1 }].map(({ label, step }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  aria-controls="affiliations-slider"
                  onClick={() => setActive((index) => wrap(index + step))}
                  className={`flex size-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-action hover:text-on-action motion-reduce:transition-none ${focusStyle}`}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <path d={step === 1 ? "M12 5v14m-5-5 5 5 5-5" : "M12 19V5m-5 5 5-5 5 5"} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
