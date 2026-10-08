import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { publicAsset } from "../../utils/publicAsset";

const events = [
  {
    id: 1,
    title: "Islamic Quiz Competition – Ma'ariful Islamiyyah",
    subtitle: "Season 3 · Book: Riyad as-Salihin",
    description:
      "Test your knowledge and deepen your understanding through a friendly and engaging quiz competition based on selected chapters from Riyad as-Salihin. Participants will answer questions on hadith, key lessons, and practical implementations in daily life, making it both a fun and spiritually uplifting experience.",
    date: "30 September 2025",
    dateTime: "2025-09-30",
    time: "3:00 PM",
    place: "Online",
    image: "/event1.png",
    exploration: "Connect the hadith with everyday choices and put your understanding to the test with other students.",
  },
  {
    id: 2,
    title: "Tafsir & Reflection Circle",
    subtitle: "Exploring selected ayat together",
    description:
      "Join us for a calm and reflective circle where we read, translate, and discuss selected ayat from the Qur’an together. The session will focus on drawing practical lessons, asking questions, and sharing personal reflections in a warm and welcoming environment.",
    date: "15 October 2025",
    dateTime: "2025-10-15",
    time: "4:30 PM",
    place: "AUST Campus",
    image: "/event1.png",
    exploration: "Bring your questions and consider how the ayat can guide the way we learn, care and live together.",
  },
  {
    id: 3,
    title: "Seerah Storytelling Evening",
    subtitle: "Lessons from the life of the Prophet ﷺ",
    description:
      "Spend an evening listening to beautifully narrated stories from the Seerah of the Prophet ﷺ, highlighting defining moments from his blessed life. Each story will be followed by short reflections and takeaways to help us apply these lessons in our studies, families, and community work.",
    date: "28 October 2025",
    dateTime: "2025-10-28",
    time: "5:00 PM",
    place: "AUST Auditorium",
    image: "/event1.png",
    exploration: "Discover how the character and compassion in these stories can guide our campus and community life.",
  },
];

const wrap = (index) => (index + events.length) % events.length;
const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700";

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

const FeaturedEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [held, setHeld] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef(null);
  const buttons = useRef([]);
  const focusSelection = useRef(false);
  const playing = !hovered && !focused && !held && !reducedMotion;

  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference?.matches ?? false);
    updatePreference();
    preference?.addEventListener("change", updatePreference);
    return () => preference?.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setCurrentIndex((index) => wrap(index + 1)), 6000);
    return () => window.clearTimeout(timer);
  }, [currentIndex, playing]);

  useEffect(() => {
    if (!focusSelection.current) return;
    buttons.current[currentIndex]?.focus({ preventScroll: true });
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
    setCurrentIndex(next);
  };

  const releaseTouch = () => {
    touchStart.current = null;
    setHeld(false);
  };

  return (
    <section id="featured-events" aria-labelledby="featured-events-heading" className="bg-white py-12 text-[#173d2e] md:py-16">
      <div className="mx-auto w-full max-w-[112rem] px-6 lg:w-[calc(100%_-_10rem)] 2xl:px-24">
        <h2 id="featured-events-heading" className="font-garamond text-[clamp(2rem,8vw,2.4rem)] leading-none font-bold text-[#173d2e] md:text-[3rem]">
          Featured Events:
        </h2>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured events carousel"
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
            className="@container touch-pan-y overflow-clip rounded-2xl border border-[#173d2e]/20 bg-[#eef4ef] shadow-[0_20px_50px_-40px_rgba(14,41,30,0.45)]"
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
                  setCurrentIndex((index) => wrap(index + (x < 0 ? 1 : -1)));
                }
              }
              releaseTouch();
            }}
            onPointerCancel={releaseTouch}
            onLostPointerCapture={releaseTouch}
          >
            <div className="flex items-start transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {events.map((event, index) => (
                <article
                  key={event.id}
                  aria-labelledby={`featured-event-${event.id}`}
                  aria-hidden={index !== currentIndex}
                  inert={index !== currentIndex}
                  className={`flex w-full min-w-0 shrink-0 flex-col p-3 sm:p-4 @min-[64rem]:grid @min-[64rem]:grid-cols-2 ${index !== currentIndex ? "h-0 overflow-hidden" : ""}`}
                >
                  <div className="overflow-hidden rounded-lg bg-[#0e291e] p-2 sm:p-3 @min-[64rem]:self-start">
                    <img src={publicAsset(event.image)} alt={`${event.title} event poster`} loading="lazy" decoding="async" width="5334" height="5335" draggable="false" className="block h-auto w-full rounded-md" />
                  </div>
                  <div className="@container flex min-w-0 flex-col justify-between gap-4 p-3 [--event-exploration-display:block] sm:p-8 @min-[64rem]:ml-4 @min-[75rem]:p-6 @min-[64rem]:[--event-exploration-display:none] @min-[75rem]:[--event-exploration-display:block]">
                    <div>
                      <h3 id={`featured-event-${event.id}`} className="font-garamond text-[clamp(1.8rem,6.5cqi,2.5rem)] leading-[1.08] font-semibold tracking-[-0.02em] text-[#173d2e]">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#173d2e]/70 sm:text-base">{event.subtitle}</p>
                    </div>
                    <p className="text-justify text-base leading-relaxed text-[#173d2e]/85 @min-[28rem]:text-lg @min-[38rem]:text-[1.375rem]">{event.description}</p>
                    <dl className="grid gap-4 border-y border-[#173d2e]/20 py-4 @min-[24rem]:grid-cols-3 @min-[24rem]:gap-5">
                      {[
                        { type: "date", label: "Date", value: <time dateTime={event.dateTime}>{event.date}</time> },
                        { type: "time", label: "Time", value: event.time },
                        { type: "place", label: "Place", value: event.place },
                      ].map(({ type, label, value }) => (
                        <div key={type} className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] content-start gap-x-3 gap-y-1 @min-[24rem]:gap-y-2">
                          <span className="row-span-2 flex size-8 items-center justify-center rounded-full bg-[#173d2e] text-white @min-[24rem]:row-span-1">
                            <EventIcon type={type} className="size-[1.125rem]" />
                          </span>
                          <dt className="self-center text-sm leading-5 font-medium text-[#173d2e]/80">{label}</dt>
                          <dd className="col-start-2 text-base leading-snug font-semibold text-[#173d2e] @min-[24rem]:col-span-2 @min-[24rem]:col-start-1 @min-[28rem]:text-lg">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="event-exploration [display:var(--event-exploration-display)]">
                      <h4 className="font-garamond text-2xl leading-tight font-semibold">What we’ll explore</h4>
                      <p className="mt-2 text-justify text-base leading-relaxed text-[#173d2e]/80 @min-[38rem]:text-lg">{event.exploration}</p>
                    </div>
                    <div>
                      <Link to="/register" className={`group flex min-h-15 w-full items-center justify-between gap-4 rounded-full bg-[#173d2e] px-6 py-3 text-lg leading-tight font-semibold text-white transition-colors hover:bg-green-700 motion-reduce:transition-none sm:text-xl ${focusStyle}`}>
                        Register now
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"><EventIcon type="next" className="size-5" /></span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center sm:mt-8">
            <div role="group" aria-label="Event navigation" className="flex items-center gap-1 rounded-full border border-[#173d2e]/25 bg-[#eef4ef] p-1 shadow-[0_4px_12px_rgba(14,41,30,0.06)] sm:gap-2">
              <button type="button" aria-label="Previous event" aria-controls="featured-events-slider" onClick={() => setCurrentIndex((index) => wrap(index - 1))} className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#173d2e] hover:text-white motion-reduce:transition-none ${focusStyle}`}>
                <EventIcon type="previous" />
              </button>
              <div className="flex gap-1 border-x border-[#173d2e]/15 px-1 sm:gap-2 sm:px-2" onKeyDown={selectWithKeyboard}>
                {events.map((event, index) => (
                  <button key={event.id} ref={(node) => { buttons.current[index] = node; }} type="button" aria-label={`Go to event ${index + 1}`} aria-pressed={index === currentIndex} aria-controls="featured-events-slider" tabIndex={index === currentIndex ? 0 : -1} onClick={() => setCurrentIndex(index)} className={`flex size-11 cursor-pointer items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors motion-reduce:transition-none ${index === currentIndex ? "bg-[#173d2e] text-white" : "text-[#173d2e]/65 hover:bg-[#173d2e]/10 hover:text-[#173d2e]"} ${focusStyle}`}>
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Next event" aria-controls="featured-events-slider" onClick={() => setCurrentIndex((index) => wrap(index + 1))} className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#173d2e] hover:text-white motion-reduce:transition-none ${focusStyle}`}>
                <EventIcon type="next" />
              </button>
            </div>
          </div>
          <p role="status" aria-live={focused ? "polite" : "off"} className="sr-only">Event {currentIndex + 1} of {events.length}: {events[currentIndex].title}</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
