import { useContent } from "../contexts/ContentContext";
import { useEffect, useState } from "react";
import { FiArrowDown, FiSearch } from "react-icons/fi";
import { publicAsset } from "../utils/publicAsset";
import { catalogue as sampleCatalogue, filterCatalogue, getCatalogueDay } from "../data/catalogue";
import EventBookshelf from "../Components/EventBookshelf";
import WebinarFolders from "../Components/WebinarFolders";
import CourseLaptop from "../Components/CourseLaptop";
import StateView from "../Components/StateView";
import { ContentNotice, ContentUnavailable } from "../Components/ContentFeedback";
import { publicPageFrame as frame } from "../Components/PublicLayout.styles";
import HeroShade from "../Components/HeroShade";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";
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

export default function Catalogue({ initialId, autoPlay = true, sectionKind, preview = false } = {}) {
  const content = useContent();
  const catalogue = content ? Object.fromEntries(["events", "webinars", "courses"].map(kind => [kind, content.programmes.filter(p => p.kind === kind)])) : sampleCatalogue;
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ events: "All", webinars: "All", courses: "All" });
  const [today, setToday] = useState(getCatalogueDay);
  const unavailable = content && !content.hasData && (content.loading || content.error);
  const empty = !unavailable && !Object.values(catalogue).some(items => items.length);
  const fillPreview = preview && Boolean(sectionKind);
  useEffect(() => {
    const refresh = () => setToday(getCatalogueDay());
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  return <div lang="en" className={`bg-surface text-ink ${fillPreview ? 'max-lg:flex max-lg:min-h-svh max-lg:flex-col' : ''}`}>
    {!sectionKind && <header aria-labelledby="catalogue-heading" className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-neutral-900 text-[#eef4ef] sm:min-h-[25rem] lg:min-h-[28rem]">
      <img aria-hidden="true" src={publicAsset("/images/team/meeting-discussion.jpg")} alt="" width="1600" height="1067" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover object-[center_40%]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-black/90 via-black/65 to-black/40" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-black/80 via-transparent to-black/50" />
      <HeroShade />
      <div className={`${frame} flex flex-col gap-6 pt-32 pb-9 sm:gap-7 sm:pt-36 sm:pb-10 lg:pt-40 lg:pb-12`}>
        <h1 id="catalogue-heading" className="font-garamond text-[clamp(2.8rem,9vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.025em] sm:text-[clamp(3.75rem,7vw,6rem)]">Come curious.<br /><span className="text-[#E9AD5E]">Leave inspired.</span></h1>
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <p className="max-w-[66ch] flex-1 text-justify text-base leading-[1.75] lg:text-lg">Find your next gathering, join a conversation online or make time to learn. Explore events, webinars and courses from ARPC.</p>
          <button type="button" onClick={() => scrollToSection("catalogue-browse")} className={`group inline-flex min-h-14 shrink-0 cursor-pointer items-center justify-center self-end gap-6 rounded-full bg-soft px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-[#E9AD5E] hover:text-brand motion-reduce:transition-none sm:text-lg ${focus}`}>Explore the catalogue <FiArrowDown aria-hidden="true" className="size-5" /></button>
        </div>
      </div>
    </header>}

    {!sectionKind && !unavailable && !empty && <div id="catalogue-browse" className="scroll-mt-6 border-b border-ink/15 bg-soft">
      <div className={`${frame} flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between`}>
        <nav aria-label="Catalogue sections" className="flex flex-wrap gap-x-7 gap-y-2 font-garamond text-2xl font-semibold sm:gap-x-10 sm:text-3xl">{sections.map(({ id, title }) => <button key={id} type="button" onClick={() => scrollToSection(`catalogue-${id}`)} className={`inline-flex min-h-11 cursor-pointer items-center border-b-2 border-transparent transition-colors hover:border-ink ${focus}`}>{title}</button>)}</nav>
        <div className="relative w-full lg:max-w-80"><FiSearch aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink/65" /><input type="search" aria-label="Search the catalogue" placeholder="Find something to explore" value={search} onChange={(event) => setSearch(event.target.value)} className={`min-h-12 w-full rounded-full border border-ink/25 bg-surface py-3 pr-4 pl-12 text-base placeholder:text-ink/60 ${focus}`} /></div>
      </div>
    </div>}
    {(unavailable || empty) ? <div id="catalogue-browse" className={`${frame} scroll-mt-6 py-12 sm:py-16 ${fillPreview ? 'max-lg:flex max-lg:flex-1 max-lg:flex-col' : ''}`}>
      <ContentNotice content={content}/>
      {unavailable ? <ContentUnavailable content={content} resource="the catalogue"/> : <StateView fill={fillPreview} kind="programmes" title={sectionKind ? `No ${sectionKind} available yet.` : 'No programmes available yet.'} description={sectionKind ? `New ${sectionKind} will appear here when they are available.` : 'Events, webinars and courses will appear here when they are available. Explore the gallery in the meantime.'} actions={sectionKind ? [] : [{label:'Explore the gallery',to:'/gallery'}, {label:'Back to home',to:'/',secondary:true}]}/>}
    </div> : <>
    {content?.error&&content?.hasData&&<div className={`${frame} pt-6`}><ContentNotice content={content}/></div>}
    {sections.filter(section => !sectionKind || section.id === sectionKind).map(({ id, title, filters: choices }) => {
      const items = filterCatalogue(catalogue[id], id, filters[id], search, today);
      return <section key={id} id={`catalogue-${id}`} aria-labelledby={`catalogue-${id}-heading`} className={`scroll-mt-6 bg-surface py-12 sm:py-16 lg:py-20 ${fillPreview ? 'max-lg:flex max-lg:flex-1 max-lg:flex-col' : ''}`}>
        <div className={`${frame} ${fillPreview ? 'max-lg:flex max-lg:flex-1 max-lg:flex-col' : ''}`}>
          <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <h2 id={`catalogue-${id}-heading`} className={heading}>{title}</h2>
            <div role="group" aria-label={`${title} filters`} className="flex w-fit max-w-full flex-wrap gap-1 rounded-[1.5rem] bg-soft p-1">
              {choices.map((choice) => <button key={choice} type="button" aria-pressed={filters[id] === choice} onClick={() => setFilters((previous) => ({ ...previous, [id]: choice }))} className={`min-h-11 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${focus} ${filters[id] === choice ? "bg-action text-on-action" : "text-ink hover:bg-ink/10"}`}>{choice}</button>)}
            </div>
          </div>
          <p role="status" className="sr-only">{items.length} {title.toLowerCase()} shown</p>
          {items.length ? id === "events" ? <EventBookshelf key={items.map((item) => item.id).join("|")} items={items} today={today} initialId={initialId} preview={preview} /> : id === "webinars" ? <WebinarFolders key={items.map((item) => item.id).join("|")} items={items} today={today} initialId={initialId} autoPlay={autoPlay} preview={preview} /> : <CourseLaptop key={items.map((item) => item.id).join("|")} items={items} initialId={initialId} preview={preview} /> : <StateView fill={fillPreview} compact headingLevel={3} kind={catalogue[id].length ? 'search' : 'programmes'} title={catalogue[id].length ? `No ${title.toLowerCase()} match this selection.` : `No ${title.toLowerCase()} available yet.`} description={catalogue[id].length ? `Try a different search or clear your filters to see more ${title.toLowerCase()}.` : `New ${title.toLowerCase()} will appear here when they are available. Explore another section of the catalogue in the meantime.`} actions={catalogue[id].length ? [{label:'Reset search and filter',onClick:() => {setSearch('');setFilters(previous => ({...previous,[id]:'All'}));}}] : []}/>}
        </div>
      </section>;
    })}</>}
  </div>;
}
