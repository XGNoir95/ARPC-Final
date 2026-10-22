import SafeImage from '../SafeImage';
import ApplicationLink from "../../Components/ApplicationLink";
import { useContent } from "../../ContentContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { featuredEvents as sampleEvents } from "../../data/featuredEvents";
import { enrollmentPath } from "../../utils/enrollment";
import { publicAsset } from "../../utils/publicAsset";
import StateView from '../StateView';
import { ContentUnavailable } from '../ContentFeedback';
import { publicPageFrame } from '../PublicLayout.styles';
import { featuredItems } from '../../utils/homeContent';
import { kindNames, shortDate } from '../../utils/adminPresentation';
import { enrollmentFacts } from '../../utils/enrollment';
import { Link } from 'react-router-dom';


const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";

function FeaturedAction({ event, content, ...props }) {
  if (event.registrationOpen === false) return <Link to="/catalogue" {...props}/>;
  return <ApplicationLink to={event.kind === 'membership' ? '/join' : enrollmentPath(event.kind || 'events', content ? event.id : `featured-${event.id}`)} {...props}/>;
}

const EventIcon = ({ type, className = "size-5 shrink-0" }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {type === "date" ? (
      <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 3h2" /></>
    ) : type === "time" ? (
      <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>
    ) : type === "place" ? (
      <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>
    ) : (
      <path d={type === "previous" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} />
    )}
  </svg>
);

const FeaturedEvents = ({ autoPlay = true, activeIndex, onItemChange, preview = false }) => {
  const content = useContent();
  const settings = content?.home?.find(item => item.id === 'featured');
  const events = content ? featuredItems(content.programmes, settings).map(p => ({...p, subtitle:p.format || kindNames[p.kind], exploration:p.description, dateTime:p.date, date:shortDate(p.date), place:p.location})) : sampleEvents;
  const wrap = useCallback(index => (index + events.length) % events.length, [events.length]);
  const [storedIndex, setCurrentIndex] = useState(0);
  const currentIndex = (activeIndex ?? storedIndex) % Math.max(1, events.length);
  const select = useCallback(next => {
    const index = wrap(typeof next === 'function' ? next(currentIndex) : next);
    if (activeIndex === undefined) setCurrentIndex(index);
    onItemChange?.(index);
  }, [activeIndex, currentIndex, onItemChange, wrap]);
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
    if (!playing || events.length < 2) return;
    const timer = window.setTimeout(() => select(currentIndex + 1), 6000);
    return () => window.clearTimeout(timer);
  }, [currentIndex, playing, select, events.length]);

  useEffect(() => {
    if (!focusSelection.current) return;
    buttons.current[currentIndex]?.focus({ preventScroll: true });
    buttons.current[currentIndex]?.scrollIntoView?.({ block:'nearest', inline:'nearest' });
    focusSelection.current = false;
  }, [currentIndex]);

  const selectWithKeyboard = (event) => {
    let next;
    if (event.key === "ArrowRight") next = wrap(currentIndex + 1);
    else if (event.key === "ArrowLeft") next = wrap(currentIndex - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = events.length - 1;
    else return;
    event.preventDefault();
    focusSelection.current = true;
    select(next);
  };

  const releaseTouch = () => {
    touchStart.current = null;
    setHeld(false);
  };

  if (!events.length) return <section id="featured-events" aria-labelledby="featured-events-heading" className={`bg-surface py-12 text-ink md:py-16 ${preview ? 'max-lg:flex max-lg:flex-col max-lg:pb-20' : ''}`}><div className={`${publicPageFrame} ${preview ? 'max-lg:flex max-lg:flex-1 max-lg:flex-col' : ''}`}><h2 id="featured-events-heading" className="mb-8 font-garamond text-[clamp(2rem,8vw,2.4rem)] leading-none font-bold text-ink md:mb-10 md:text-[3rem]">{settings?.title || 'Featured at ARPC'}</h2>{content?.loading || content?.error&&!content?.hasData ? <ContentUnavailable content={content} resource="the featured programmes"/> : <StateView fill={preview} headingLevel={3} kind="programmes" title="There’s more to come." description="There are no featured opportunities right now. Explore the catalogue for other ways to take part in the club." actions={[{label:'Explore programmes',to:'/catalogue'}]}/>}</div></section>;
  return (
    <section id="featured-events" aria-labelledby="featured-events-heading" className="bg-surface py-12 text-ink md:py-16">
      <div className={publicPageFrame}>
        <h2 id="featured-events-heading" className="font-garamond text-[clamp(2rem,8vw,2.4rem)] leading-none font-bold text-ink md:text-[3rem]">
          {settings?.title || 'Featured at ARPC'}
        </h2>
        {settings?.description && <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{settings.description}</p>}

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured carousel"
          className="mt-8 md:mt-10"
          onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
          onPointerLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
        >
          <div
            id="featured-events-slider"
            className="@container touch-pan-y overflow-clip rounded-2xl border border-ink/20 bg-soft shadow-[0_20px_50px_-40px_rgba(14,41,30,0.45)]"
            onPointerDown={(event) => {
              if (event.pointerType !== "touch") return;
              touchStart.current = { x: event.clientX, y: event.clientY };
              setHeld(true);
              event.currentTarget.setPointerCapture?.(event.pointerId);
            }}
            onPointerUp={(event) => {
              if (touchStart.current) {
                const x = event.clientX - touchStart.current.x;
                const y = event.clientY - touchStart.current.y;
                if (Math.abs(x) > 40 && Math.abs(x) > Math.abs(y)) {
                  select((index) => wrap(index + (x < 0 ? 1 : -1)));
                }
              }
              releaseTouch();
            }}
            onPointerCancel={releaseTouch}
            onLostPointerCapture={releaseTouch}
          >
            <div className="flex items-start [transform:translateX(var(--event-offset))] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ "--event-offset": `-${currentIndex * 100}%` }}>
              {events.map((event, index) => (
                <article
                  key={event.id}
                  aria-labelledby={`featured-event-${event.id}`}
                  aria-hidden={index !== currentIndex}
                  inert={index !== currentIndex}
                  className={`flex w-full min-w-0 shrink-0 flex-col p-3 sm:p-4 @min-[64rem]:grid @min-[64rem]:grid-cols-2 ${index !== currentIndex ? "h-0 overflow-hidden" : ""}`}
                >
                  <div className="overflow-hidden rounded-lg bg-brand-deep p-2 sm:p-3 @min-[64rem]:self-start">
                    <SafeImage src={publicAsset(event.image || '/logo.jpg')} alt={event.imageAlt || `${event.title} artwork`} loading="lazy" decoding="async" width="5334" height="5335" draggable="false" className={`block h-auto w-full rounded-md ${event.kind==='membership'?'max-h-120 bg-white object-contain p-10':''}`} />
                  </div>
                  <div className="@container flex min-w-0 flex-col justify-between gap-4 p-3 [--event-exploration-display:block] sm:p-8 @min-[64rem]:ml-4 @min-[75rem]:p-6 @min-[64rem]:[--event-exploration-display:none] @min-[75rem]:[--event-exploration-display:block]">
                    <div>
                      <h3 id={`featured-event-${event.id}`} className="font-garamond text-[clamp(1.8rem,6.5cqi,2.5rem)] leading-[1.08] font-semibold tracking-[-0.02em] text-ink">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/70 sm:text-base">{event.subtitle}</p>
                    </div>
                    <p className="text-justify text-base leading-relaxed text-ink/85 @min-[28rem]:text-lg @min-[38rem]:text-[1.375rem]">{event.description}</p>
                    <dl className="grid gap-4 border-y border-ink/20 py-4 @min-[24rem]:grid-cols-3 @min-[24rem]:gap-5">
                      {(content ? (event.kind==='membership' ? [['Applications','Open'],['Community','AUST students'],['Membership fee','৳100']] : enrollmentFacts({kind:event.kind,item:{...event,date:event.dateTime,fee:event.fee || 0}})).filter(([,value])=>value).map(([label,value], index)=>({type:['date','time','place'][index%3],label,value})) : [
                        { type: "date", label: "Date", value: <time dateTime={event.dateTime}>{event.date}</time> },
                        { type: "time", label: "Time", value: event.time },
                        { type: "place", label: "Place", value: event.place },
                      ]).map(({ type, label, value }) => (
                        <div key={type} className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] content-start gap-x-3 gap-y-1 @min-[24rem]:gap-y-2">
                          <span className="row-span-2 flex size-8 items-center justify-center rounded-full bg-action text-on-action @min-[24rem]:row-span-1">
                            <EventIcon type={type} className="size-[1.125rem]" />
                          </span>
                          <dt className="self-center text-sm leading-5 font-medium text-ink/80">{label}</dt>
                          <dd className="col-start-2 text-base leading-snug font-semibold text-ink @min-[24rem]:col-span-2 @min-[24rem]:col-start-1 @min-[28rem]:text-lg">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="event-exploration [display:var(--event-exploration-display)]">
                      <h4 className="font-garamond text-2xl leading-tight font-semibold">{event.kind==='membership'?'Be part of the club':event.kind==='courses'?'What you’ll learn':'What we’ll explore'}</h4>
                      <p className="mt-2 text-justify text-base leading-relaxed text-ink/80 @min-[38rem]:text-lg">{event.exploration}</p>
                    </div>
                    <div>
                      <FeaturedAction event={event} content={content} className={`group flex min-h-15 w-full items-center justify-between gap-4 rounded-full bg-action px-6 py-3 text-lg leading-tight font-semibold text-on-action transition-colors duration-200 hover:bg-[#E9AD5E] hover:text-brand motion-reduce:transition-none sm:text-xl ${focusStyle}`}>
                        {event.kind==='membership'?'Apply for membership':event.registrationOpen===false?'Explore programmes':'Register now'}
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 transition-[transform,background-color,border-color] duration-200 group-hover:translate-x-0.5 group-hover:border-ink/30 group-hover:bg-ink/10 motion-reduce:transition-none"><EventIcon type="next" className="size-5" /></span>
                      </FeaturedAction>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center sm:mt-8">
            <div role="group" aria-label="Featured navigation" className="flex max-w-full items-center gap-1 rounded-full border border-ink/25 bg-soft p-1 shadow-[0_4px_12px_rgba(14,41,30,0.06)] sm:gap-2">
              <button type="button" aria-label="Previous featured item" aria-controls="featured-events-slider" onClick={() => select((index) => wrap(index - 1))} className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-action hover:text-on-action motion-reduce:transition-none ${focusStyle}`}>
                <EventIcon type="previous" />
              </button>
              <div className="flex min-w-0 gap-1 overflow-x-auto border-x border-ink/15 px-1 sm:gap-2 sm:px-2" onKeyDown={selectWithKeyboard}>
                {events.map((event, index) => (
                  <button key={event.id} ref={(node) => { buttons.current[index] = node; }} type="button" aria-label={`Go to featured item ${index + 1}`} aria-pressed={index === currentIndex} aria-controls="featured-events-slider" tabIndex={index === currentIndex ? 0 : -1} onClick={() => select(index)} className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors motion-reduce:transition-none ${index === currentIndex ? "bg-action text-on-action" : "text-ink/65 hover:bg-ink/10 hover:text-ink"} ${focusStyle}`}>
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Next featured item" aria-controls="featured-events-slider" onClick={() => select((index) => wrap(index + 1))} className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-action hover:text-on-action motion-reduce:transition-none ${focusStyle}`}>
                <EventIcon type="next" />
              </button>
            </div>
          </div>
          <p role="status" aria-live={focused ? "polite" : "off"} className="sr-only">Featured item {currentIndex + 1} of {events.length}: {events[currentIndex].title}</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
