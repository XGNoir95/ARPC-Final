import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowDown, FiArrowUpRight, FiCalendar, FiClock, FiMapPin, FiSearch, FiVideo, FiX, FiBookOpen, FiCheck } from "react-icons/fi";
import { publicAsset } from "../utils/publicAsset";
import { catalogue, filterCatalogue, formatCatalogueDate, getCatalogueDay, isFinished } from "../data/catalogue";
import EventBookshelf from "../Components/EventBookshelf";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";
const frame = "mx-auto w-full max-w-[112rem] px-6 lg:w-[calc(100%_-_10rem)] 2xl:px-24";
const heading = "font-garamond text-[2.25rem] sm:text-[2.75rem] lg:text-[clamp(2.5rem,6vw,3.5rem)] font-semibold leading-none tracking-[-0.02em]";
const sections = [
  { id: "events", title: "Events", filters: ["All", "Upcoming", "Finished"] },
  { id: "webinars", title: "Webinars", filters: ["All", "Upcoming", "Finished"] },
  { id: "courses", title: "Courses", filters: ["All", "Free", "Paid"] },
];

function scrollToSection(id) {
  // Keep the route hash intact on GitHub Pages; these are in-page controls.
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}

function Status({ item, today, dark = false }) {
  const course = item.fee !== undefined;
  const finished = !course && isFinished(item, today);
  return <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold leading-5 ${dark ? "bg-white/10 text-[#eef4ef]" : finished ? "bg-[#173d2e]/8 text-[#173d2e]" : "bg-[#eef4ef] text-[#173d2e]"}`}>
    <span aria-hidden="true" className={`size-1.5 rounded-full ${finished ? "bg-current opacity-45" : "bg-[#E9AD5E]"}`} />
    {course ? item.fee === 0 ? "Free course" : "Paid course" : finished ? "Recently finished" : "Upcoming"}
  </span>;
}

function DetailsButton({ item, onSelect, dark = false }) {
  return <button type="button" onClick={() => onSelect(item)} aria-label={`View details: ${item.title}`} className={`group inline-flex min-h-12 cursor-pointer items-center justify-between gap-6 rounded-full px-5 py-2.5 text-base font-semibold transition-colors duration-200 motion-reduce:transition-none ${focus} ${dark ? "bg-[#eef4ef] text-[#102c21] hover:bg-[#E9AD5E]" : "bg-[#173d2e] text-white hover:bg-[#102c21]"}`}>
    View details <FiArrowUpRight aria-hidden="true" className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
  </button>;
}

function Metadata({ item, dark = false }) {
  return <dl className={`flex flex-wrap gap-x-5 gap-y-3 text-sm leading-relaxed ${dark ? "text-[#eef4ef]/85" : "text-[#173d2e]/80"}`}>
    <div className="flex items-start gap-2"><dt><FiCalendar aria-hidden="true" className="mt-0.5 size-4" /><span className="sr-only">Date</span></dt><dd><time dateTime={item.date}>{formatCatalogueDate(item.date)}</time></dd></div>
    <div className="flex items-start gap-2"><dt><FiClock aria-hidden="true" className="mt-0.5 size-4" /><span className="sr-only">Time in Dhaka</span></dt><dd>{item.time} (Dhaka)</dd></div>
    <div className="flex items-start gap-2"><dt><FiMapPin aria-hidden="true" className="mt-0.5 size-4" /><span className="sr-only">Location</span></dt><dd>{item.location}</dd></div>
  </dl>;
}

function WebinarCard({ item, today, onSelect }) {
  return <article aria-labelledby={`${item.id}-title`} className="grid items-center gap-6 border-t border-white/20 py-7 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)_auto] lg:gap-8 lg:py-8">
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:aspect-square">
      <img src={publicAsset(item.image)} alt={item.imageAlt} width="600" height="600" loading="lazy" className="size-full object-cover" />
      <span aria-hidden="true" className="absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-full bg-[#102c21]/85 text-white"><FiVideo className="size-5" /></span>
    </div>
    <div className="flex min-w-0 flex-col items-start gap-4">
      <Status item={item} today={today} dark />
      <h3 id={`${item.id}-title`} className="font-garamond text-[2rem] font-semibold leading-[1.1] tracking-[-0.015em] lg:text-[2.5rem]">{item.title}</h3>
      <p className="max-w-[65ch] text-justify text-base leading-[1.75] text-[#eef4ef]/85">{item.description}</p>
      <Metadata item={item} dark />
    </div>
    <div className="sm:col-start-2 lg:col-auto"><DetailsButton item={item} onSelect={onSelect} dark /></div>
  </article>;
}

function CourseCard({ item, today, onSelect, featured }) {
  return <article aria-labelledby={`${item.id}-title`} className={`min-w-0 overflow-hidden rounded-2xl border border-[#173d2e]/15 bg-white ${featured ? "col-span-full grid md:grid-cols-2" : "flex flex-col"}`}>
    <div className={`relative overflow-hidden ${featured ? "min-h-64 md:min-h-80" : "aspect-[16/10]"}`}>
      <img src={publicAsset(item.image)} alt={item.imageAlt} width="800" height="500" loading="lazy" className={`size-full object-cover ${featured ? "absolute inset-0" : ""}`} />
      <span className="absolute bottom-4 left-4 rounded-full bg-[#102c21]/90 px-3 py-1.5 text-xs font-medium text-white">{item.format}</span>
    </div>
    <div className="flex flex-1 flex-col items-start gap-5 p-6 sm:p-7">
      <Status item={item} today={today} />
      <h3 id={`${item.id}-title`} className="font-garamond text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em]">{item.title}</h3>
      <p className="w-full text-justify text-base leading-[1.75] text-[#173d2e]/80">{item.description}</p>
      <dl className="mt-auto flex w-full flex-wrap gap-x-5 gap-y-3 text-sm text-[#173d2e]/80">
        <div className="flex items-center gap-2"><dt><FiClock aria-hidden="true" className="size-4" /><span className="sr-only">Duration</span></dt><dd>{item.duration}</dd></div>
        <div className="flex items-center gap-2"><dt><FiBookOpen aria-hidden="true" className="size-4" /><span className="sr-only">Learning format</span></dt><dd>{item.pace}</dd></div>
      </dl>
      <div className="flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#173d2e]/15 pt-5">
        <p className="font-garamond text-[1.8rem] font-semibold leading-none">{item.fee === 0 ? "Free" : <><span className="text-lg">৳</span> {item.fee.toLocaleString("en-BD")}</>}<span className="mt-1 block font-sans text-xs font-normal text-[#173d2e]/65">{item.fee === 0 ? "No course fee" : "Sample course fee"}</span></p>
        <DetailsButton item={item} onSelect={onSelect} />
      </div>
    </div>
  </article>;
}

function ListingDetails({ item, onClose, today }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!item) return;
    const dialog = dialogRef.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, [item]);
  return <dialog ref={dialogRef} aria-labelledby="catalogue-detail-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl bg-[#eef4ef] p-0 text-[#173d2e] shadow-2xl backdrop:bg-[#102c21]/70 backdrop:backdrop-blur-sm">
    {item && <>
      <div className="relative h-48 overflow-hidden sm:h-64"><img src={publicAsset(item.image)} alt={item.imageAlt} className="size-full object-cover" /><button autoFocus type="button" onClick={onClose} aria-label="Close listing details" className={`absolute top-4 right-4 flex size-12 cursor-pointer items-center justify-center rounded-full bg-[#eef4ef] text-[#173d2e] ${focus}`}><FiX className="size-6" /></button></div>
      <div className="space-y-6 p-6 sm:p-9">
        <Status item={item} today={today} />
        <h2 id="catalogue-detail-title" className="font-garamond text-4xl font-semibold leading-[1.1] sm:text-5xl">{item.title}</h2>
        {item.date ? <Metadata item={item} /> : <p className="font-semibold">{item.duration} · {item.pace} · {item.fee === 0 ? "Free" : `৳ ${item.fee.toLocaleString("en-BD")}`}</p>}
        <p className="text-justify text-base leading-[1.8]">{item.details}</p>
        <ul className="space-y-3">{item.takeaways.map((point) => <li key={point} className="flex items-start gap-3 text-base leading-relaxed"><FiCheck aria-hidden="true" className="mt-1 size-5 shrink-0" />{point}</li>)}</ul>
        <p className="rounded-xl bg-white p-4 text-sm leading-relaxed text-[#173d2e]/80">This is a sample programme. Dates, fees and availability are illustrative; registration, recordings and enrolment will appear when confirmed.</p>
        <button type="button" onClick={onClose} className={`min-h-12 cursor-pointer rounded-full bg-[#173d2e] px-6 py-3 font-semibold text-white ${focus}`}>Back to catalogue</button>
      </div>
    </>}
  </dialog>;
}

export default function Catalogue() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ events: "All", webinars: "All", courses: "All" });
  const [selected, setSelected] = useState(null);
  const closeListing = useCallback(() => setSelected(null), []);
  const [today, setToday] = useState(getCatalogueDay);
  useEffect(() => {
    const refresh = () => setToday(getCatalogueDay());
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  return <div lang="en" className="bg-white text-[#173d2e]">
    <header aria-labelledby="catalogue-heading" className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-[#102c21] text-[#eef4ef] sm:min-h-[25rem] lg:min-h-[28rem]">
      <img aria-hidden="true" src={publicAsset("/images/team/meeting-discussion.jpg")} alt="" width="1600" height="1067" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover object-[center_40%] grayscale-[0.5]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-[#102c21]/90 via-[#102c21]/65 to-[#102c21]/40" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-[#102c21]/80 via-transparent to-[#102c21]/50" />
      <div className={`${frame} flex flex-col gap-6 pt-32 pb-9 sm:gap-7 sm:pt-36 sm:pb-10 lg:pt-40 lg:pb-12`}>
        <h1 id="catalogue-heading" className="font-garamond text-[clamp(2.8rem,9vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.025em] sm:text-[clamp(3.75rem,7vw,6rem)]">Come curious.<br />Leave inspired.</h1>
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <p className="max-w-[66ch] flex-1 text-justify text-base leading-[1.75] lg:text-lg">Find your next gathering, join a conversation online or make time to learn. Explore events, webinars and courses from ARPC.</p>
          <button type="button" onClick={() => scrollToSection("catalogue-browse")} className={`group inline-flex min-h-14 shrink-0 cursor-pointer items-center justify-center self-end gap-6 rounded-full bg-[#eef4ef] px-6 py-3 text-base font-semibold text-[#102c21] transition-colors hover:bg-[#E9AD5E] motion-reduce:transition-none sm:text-lg ${focus}`}>Explore the catalogue <FiArrowDown aria-hidden="true" className="size-5" /></button>
        </div>
      </div>
    </header>

    <div id="catalogue-browse" className="scroll-mt-6 border-b border-[#173d2e]/15 bg-[#eef4ef]">
      <div className={`${frame} flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between`}>
        <nav aria-label="Catalogue sections" className="flex flex-wrap gap-x-7 gap-y-2 font-garamond text-2xl font-semibold sm:gap-x-10 sm:text-3xl">{sections.map(({ id, title }) => <button key={id} type="button" onClick={() => scrollToSection(`catalogue-${id}`)} className={`inline-flex min-h-11 cursor-pointer items-center border-b-2 border-transparent transition-colors hover:border-[#173d2e] ${focus}`}>{title}</button>)}</nav>
        <div className="relative w-full lg:max-w-80"><FiSearch aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#173d2e]/65" /><input type="search" aria-label="Search the catalogue" placeholder="Find something to explore" value={search} onChange={(event) => setSearch(event.target.value)} className={`min-h-12 w-full rounded-full border border-[#173d2e]/25 bg-white py-3 pr-4 pl-12 text-base placeholder:text-[#173d2e]/60 ${focus}`} /></div>
      </div>
    </div>
    <p className={`${frame} pt-5 text-sm leading-relaxed text-[#173d2e]/65`}>Preview catalogue. The programmes, dates and course fees below are samples.</p>

    {sections.map(({ id, title, filters: choices }) => {
      const dark = id === "webinars";
      const items = filterCatalogue(catalogue[id], id, filters[id], search, today);
      return <section key={id} id={`catalogue-${id}`} aria-labelledby={`catalogue-${id}-heading`} className={`scroll-mt-6 py-12 sm:py-16 lg:py-20 ${dark ? "bg-[#102c21] text-[#eef4ef]" : "bg-white"}`}>
        <div className={frame}>
          <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <h2 id={`catalogue-${id}-heading`} className={heading}>{title}</h2>
            <div role="group" aria-label={`${title} filters`} className={`flex w-fit max-w-full flex-wrap gap-1 rounded-[1.5rem] p-1 ${dark ? "bg-white/10" : "bg-[#eef4ef]"}`}>
              {choices.map((choice) => <button key={choice} type="button" aria-pressed={filters[id] === choice} onClick={() => setFilters((previous) => ({ ...previous, [id]: choice }))} className={`min-h-11 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${focus} ${filters[id] === choice ? dark ? "bg-[#eef4ef] text-[#102c21]" : "bg-[#173d2e] text-white" : dark ? "text-[#eef4ef] hover:bg-white/10" : "text-[#173d2e] hover:bg-[#173d2e]/10"}`}>{choice}</button>)}
            </div>
          </div>
          <p role="status" className="sr-only">{items.length} {title.toLowerCase()} shown</p>
          {items.length ? id === "events" ? <EventBookshelf key={items.map((item) => item.id).join("|")} items={items} today={today} /> : <div className={id === "courses" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : ""}>
            {items.map((item) => id === "webinars" ? <WebinarCard key={item.id} item={item} today={today} onSelect={setSelected} /> : <CourseCard key={item.id} item={item} featured={items.length === 1} today={today} onSelect={setSelected} />)}
          </div> : <div className={`rounded-2xl px-6 py-10 ${dark ? "bg-white/5" : "bg-[#eef4ef]"}`}><h3 className="font-garamond text-3xl font-semibold">No {title.toLowerCase()} match this selection.</h3><p className="mt-3 text-base leading-relaxed">Try another search or show all {title.toLowerCase()}.</p><button type="button" onClick={() => { setSearch(""); setFilters((previous) => ({ ...previous, [id]: "All" })); }} className={`mt-5 min-h-11 cursor-pointer rounded-full border border-current px-5 py-2 font-medium ${focus}`}>Reset search and filter</button></div>}
        </div>
      </section>;
    })}
    <ListingDetails item={selected} onClose={closeListing} today={today} />
  </div>;
}
