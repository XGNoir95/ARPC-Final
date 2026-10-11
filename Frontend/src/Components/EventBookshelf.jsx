import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen, FiCalendar, FiCheck, FiClock, FiMapPin, FiX } from "react-icons/fi";
import { formatCatalogueDate, isFinished } from "../data/catalogue";
import { publicAsset } from "../utils/publicAsset";
import { bookStyles, bookStylesClasses } from "./EventBookshelf.styles";

const bindings = [
  { cloth: "#28523e", ink: "#eef4ef", height: 0.92 },
  { cloth: "#e5eadb", ink: "#173d2e", height: 1 },
  { cloth: "#E9AD5E", ink: "#102c21", height: 0.94 },
  { cloth: "#708775", ink: "#102c21", height: 0.97 },
];
const boundEvents = ["reflection-evening", "books-conversations", "seerah-evening", "community-morning"];
function bindingFor(item) {
  const index = boundEvents.indexOf(item.id);
  const fallback = [...item.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const binding = bindings[(index === -1 ? fallback : index) % bindings.length];
  return { "--book-cloth": binding.cloth, "--book-ink": binding.ink, "--book-height": binding.height };
}
const shortDate = (date) => new Intl.DateTimeFormat("en-GB", {
  month: "short", day: "numeric", timeZone: "UTC",
}).format(new Date(`${date}T12:00:00Z`));
const bookTiming = { expanding: 420, opening: 680, closing: 520, collapsing: 420 };
const bookEase = [0.45, 0, 0.2, 1];

export default function EventBookshelf({ items, today }) {
  const shelfRef = useRef(null);
  const triggerRef = useRef(null);
  const activeArticleRef = useRef(null);
  const queuedBook = useRef(null);
  const openingCount = useRef(0);
  const previouslyOpen = useRef(false);
  const [book, setBook] = useState(null);
  const reducedMotion = useReducedMotion();
  const activeId = book?.id;
  const phase = book?.phase;
  const closing = phase === "closing" || phase === "collapsing";

  useLayoutEffect(() => {
    if (!activeId && previouslyOpen.current && triggerRef.current?.isConnected) triggerRef.current.focus({ preventScroll: true });
    previouslyOpen.current = Boolean(activeId);
    if (activeId && reducedMotion && activeArticleRef.current) {
      const scroller = shelfRef.current.parentElement;
      scroller.scrollTo?.({ left: activeArticleRef.current.offsetLeft, behavior: "auto" });
    }
  }, [activeId, reducedMotion]);

  useEffect(() => {
    if (!phase || phase === "open") return;
    const timer = window.setTimeout(() => {
      if (phase === "collapsing") {
        const next = queuedBook.current;
        queuedBook.current = null;
        if (next) triggerRef.current = next.trigger;
        setBook(next ? { ...next, phase: reducedMotion ? "open" : "expanding" } : null);
      } else {
        const nextPhase = { expanding: "opening", opening: "open", closing: "collapsing" }[phase];
        setBook((current) => current?.id === activeId ? { ...current, phase: nextPhase } : current);
      }
    }, reducedMotion ? 0 : bookTiming[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, activeId, reducedMotion]);

  const closeBook = () => {
    queuedBook.current = null;
    if (reducedMotion) {
      setBook(null);
    } else setBook((current) => current && !["closing", "collapsing"].includes(current.phase) ? { ...current, phase: "closing" } : current);
  };

  const openBook = (id, trigger) => {
    // Geometry and identity belong to this opening, never to the book being closed.
    const next = { id, trigger, entryHeight: trigger.closest("article").getBoundingClientRect().height, opening: ++openingCount.current };
    if (!activeId || reducedMotion) {
      queuedBook.current = null;
      triggerRef.current = trigger;
      setBook({ ...next, phase: reducedMotion ? "open" : "expanding" });
    } else {
      queuedBook.current = next;
      setBook((current) => ["closing", "collapsing"].includes(current.phase) ? current : { ...current, phase: "closing" });
    }
  };

  const revealBook = (article) => {
    const scroller = shelfRef.current.parentElement;
    if (scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollTo?.({ left: article.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  const moveAlongShelf = (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const buttons = [...shelfRef.current.querySelectorAll("[data-event-spine]")].filter((button) => !button.disabled);
    const index = buttons.indexOf(event.currentTarget);
    const target = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : Math.max(0, Math.min(buttons.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
    buttons[target].focus({ preventScroll: true });
    buttons[target].scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "auto" });
  };

  return <div className={bookStylesClasses(`event-shelf ${activeId ? "event-shelf--reading" : ""}`)}>
    <div className={bookStyles["event-shelf__scroll"]}>
      <div ref={shelfRef} className={bookStyles["event-shelf__row"]}>
        {items.map((item) => {
          const expanded = activeId === item.id;
          const finished = isFinished(item, today);
          return <article key={item.id} ref={expanded ? activeArticleRef : null} aria-labelledby={`${item.id}-spine-title`} data-book-phase={expanded ? phase : "closed"} className={bookStylesClasses(`event-volume ${expanded ? "event-volume--open" : ""} ${expanded && phase === "collapsing" ? "event-volume--collapsing" : ""}`)} style={bindingFor(item)}
            onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "width" && expanded && !closing) revealBook(event.currentTarget); }}>
          <h3 className={bookStyles["event-volume__heading"]} aria-label={item.title} aria-hidden={expanded ? true : undefined} inert={expanded ? true : undefined}>
          <button
            type="button"
            className={bookStyles["event-spine"]}
            aria-label={`Open event book: ${item.title}`}
            data-event-spine=""
            disabled={expanded}
            aria-expanded={expanded}
            aria-controls={expanded ? `${item.id}-pages` : undefined}
            onClick={(event) => openBook(item.id, event.currentTarget)}
            onKeyDown={moveAlongShelf}
          >
            <span className={bookStyles["event-spine__date"]}><time dateTime={item.date}>{shortDate(item.date)}</time><span>{item.date.slice(0, 4)}</span></span>
            <span id={`${item.id}-spine-title`} className={bookStyles["event-spine__title"]}>{item.title}</span>
            <span className={bookStyles["event-spine__status"]} data-status={finished ? "finished" : "upcoming"}><span aria-hidden="true" />{finished ? "Finished" : "Upcoming"}</span>
            <span className={bookStyles["event-spine__publisher"]} aria-hidden="true">
              <span className={bookStyles["event-spine__wordmark"]}>
                <img src={publicAsset("/logo1.png")} alt="" width="8000" height="4500" />
                <img className="event-spine__wordmark-letters" src={publicAsset("/logo1.png")} alt="" width="8000" height="4500" />
              </span>
              <img className={bookStyles["event-spine__round-logo"]} src={publicAsset("/newLogo.png")} alt="" width="36" height="36" />
            </span>
          </button>
          </h3>
          {expanded && <Motion.div key={`${item.id}-${book.opening}`} className={bookStyles["event-book-holder"]}
            initial={{ height: reducedMotion ? "auto" : book.entryHeight, opacity: reducedMotion ? 1 : 0 }}
            animate={{ height: phase === "collapsing" ? book.entryHeight : "auto", opacity: phase === "collapsing" ? 0 : 1 }}
            transition={{ duration: reducedMotion ? 0 : bookTiming.expanding / 1000, ease: bookEase, opacity: { duration: reducedMotion ? 0 : 0.18 } }}
            inert={closing ? true : undefined} aria-hidden={closing ? true : undefined}>
            <EventBookPages item={item} today={today} phase={phase} reducedMotion={reducedMotion} onClose={closeBook} />
          </Motion.div>}
        </article>;
        })}
      </div>
    </div>
    <p className={bookStyles["event-shelf__hint"]}><FiBookOpen aria-hidden="true" /><span>Choose a book to explore an event.</span></p>
  </div>;
}

function EventBookPages({ item, today, onClose, phase, reducedMotion }) {
  const pagesRef = useRef(null);
  const finished = isFinished(item, today);
  const dateLabel = formatCatalogueDate(item.date);
  const year = item.date.slice(0, 4);
  const dayAndMonth = dateLabel.slice(0, -(year.length + 1));

  useEffect(() => {
    pagesRef.current?.focus({ preventScroll: true });
  }, []);

  return <section
    ref={pagesRef}
    id={`${item.id}-pages`}
    tabIndex={-1}
    aria-labelledby={`${item.id}-open-title`}
    className={bookStylesClasses(`event-book-pages event-book-pages--${phase}`)}
    onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); } }}
  >
    <button type="button" onClick={onClose} aria-label="Close event book" className={bookStyles["event-book-close"]}><FiX aria-hidden="true" /></button>
      <div className={bookStyles["event-book-spread"]}>
        <div className={bookStyles["event-book-left"]}>
          <p className={bookStyles["event-book-format"]}>{item.format}</p>
          <img src={publicAsset(item.image)} alt={item.imageAlt} width="800" height="600" className={bookStyles["event-book-image"]} />
          <p className={bookStyles["event-book-introduction"]}>{item.description}</p>
          <span className={bookStyles["event-book-imprint"]}>Ahsanullah Roh. Peace Club</span>
        </div>
        <div className={bookStyles["event-book-details"]}>
          <span className={bookStyles["event-book-status"]} data-status={finished ? "finished" : "upcoming"}><span aria-hidden="true" />{finished ? "Recently finished" : "Upcoming event"}</span>
          <h3 id={`${item.id}-open-title`} className={bookStyles["event-book-title"]}>{item.title}</h3>
          <dl className={bookStyles["event-book-metadata"]}>
            <div><dt><FiCalendar aria-hidden="true" />Date</dt><dd><time dateTime={item.date}>{dayAndMonth}{" "}<span className={bookStyles["event-book-metadata__year"]}>{year}</span></time></dd></div>
            <div><dt><FiClock aria-hidden="true" />Time</dt><dd>{item.time}</dd></div>
            <div><dt><FiMapPin aria-hidden="true" />Place</dt><dd>{item.location}</dd></div>
          </dl>
          <p className={bookStyles["event-book-description"]}>{item.details}</p>
          <ul className={bookStyles["event-book-takeaways"]}>{item.takeaways.map((point) => <li key={point}><FiCheck aria-hidden="true" /><span>{point}</span></li>)}</ul>
          <p className={bookStyles["event-book-preview"]}>Sample programme. Dates and availability are illustrative.</p>
          <div className={bookStyles["event-book-actions"]}>
            {finished ? <button type="button" disabled className={bookStyles["event-book-register"]}>Registration closed</button>
              : <Link to="/join" className={bookStyles["event-book-register"]}>Register <span className={bookStyles["event-book-register__arrow"]}><FiArrowUpRight aria-hidden="true" /></span></Link>}
          </div>
        </div>
        {!reducedMotion && <Motion.div
          aria-hidden="true"
          className={bookStyles["event-book-cover"]}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: phase === "opening" || phase === "open" ? -179 : 0 }}
          transition={{ duration: (phase === "closing" ? bookTiming.closing : bookTiming.opening) / 1000, ease: bookEase }}
        >
          <div className={bookStyles["event-book-cover__front"]}>
          <span className={bookStyles["event-book-cover__publisher"]}>ARPC</span>
          <span className={bookStyles["event-book-cover__title"]}>{item.title}</span>
          <span className={bookStyles["event-book-cover__date"]}>{formatCatalogueDate(item.date)}</span>
          </div>
          <div className={bookStyles["event-book-cover__back"]}>
            <img src={publicAsset("/newLogo.png")} alt="" width="96" height="96" />
            <span>Ahsanullah Roh. Peace Club</span>
          </div>
        </Motion.div>}
      </div>
  </section>;
}
