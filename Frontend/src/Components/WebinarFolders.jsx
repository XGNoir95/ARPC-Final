import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiClock, FiFolder, FiVideo, FiX } from "react-icons/fi";
import { formatCatalogueDate, isFinished } from "../data/catalogue";
import { publicAsset } from "../utils/publicAsset";
import { webinarStyles, webinarStylesClasses } from "./WebinarFolders.styles";

const clothes = {
  "faith-campus": { color: "#173d2e", ink: "#eef4ef" },
  "thoughtful-writing": { color: "#E9AD5E", ink: "#173d2e" },
  "reading-habit": { color: "#dce8df", ink: "#173d2e" },
  "community-ideas": { color: "#577262", ink: "#eef4ef" },
};
const tabDate = (date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

function FolderShape({ position, tabStep }) {
  const left = 35 + position * tabStep * 10;
  const width = tabStep * 10 - 11;
  return <svg className={webinarStyles["webinar-folder-shape"]} viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
    <path fill="var(--folder-color)" d={`M 18 70 H ${left - 12} Q ${left - 4} 70 ${left + 1} 53 L ${left + 10} 16 Q ${left + 14} 0 ${left + 28} 0 H ${left + width - 44} Q ${left + width - 31} 0 ${left + width - 26} 16 L ${left + width - 16} 53 Q ${left + width - 11} 70 ${left + width} 70 H 982 Q 1000 70 1000 88 V 582 Q 1000 600 982 600 H 18 Q 0 600 0 582 V 88 Q 0 70 18 70 Z`} />
  </svg>;
}

export default function WebinarFolders({ items, today }) {
  const [selectedId, setSelectedId] = useState(null);
  const [frontIndex, setFrontIndex] = useState(0);
  const [turn, setTurn] = useState(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");
  const [visible, setVisible] = useState(() => !document.hidden);
  const reducedMotion = useReducedMotion();
  const frameRef = useRef(null);
  const triggerRefs = useRef([]);
  const panelRef = useRef(null);
  const returnFocus = useRef(null);
  const wasOpen = useRef(false);
  const selected = items.find((item) => item.id === selectedId);
  const tabStep = 84 / Math.max(3, items.length);

  const rotateFolders = useCallback((direction) => {
    if (items.length < 2 || selectedId) return;
    const next = (frontIndex + direction + items.length) % items.length;
    if (reducedMotion) setFrontIndex(next);
    else setTurn((current) => current ?? { outgoing: frontIndex, next, phase: "departing" });
  }, [frontIndex, items.length, reducedMotion, selectedId]);

  useEffect(() => {
    if (!turn) return;
    const timer = window.setTimeout(() => {
      if (turn.phase === "departing") {
        setFrontIndex(turn.next);
        setTurn({ ...turn, phase: "arriving" });
      } else setTurn(null);
    }, turn.phase === "departing" ? 350 : 700);
    return () => window.clearTimeout(timer);
  }, [turn]);

  useEffect(() => {
    if (paused || hovered || focused || selected || turn || reducedMotion || !inView || !visible || items.length < 2) return;
    const timer = window.setTimeout(() => rotateFolders(1), 5000);
    return () => window.clearTimeout(timer);
  }, [paused, hovered, focused, selected, turn, reducedMotion, inView, visible, items.length, rotateFolders]);

  useEffect(() => {
    const refreshVisibility = () => { setVisible(!document.hidden); if (document.hidden) setTurn(null); };
    document.addEventListener("visibilitychange", refreshVisibility);
    let observer;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25), { threshold: 0.25 });
      observer.observe(frameRef.current);
    }
    return () => { document.removeEventListener("visibilitychange", refreshVisibility); observer?.disconnect(); };
  }, []);

  useLayoutEffect(() => {
    if (selected) panelRef.current?.focus({ preventScroll: true });
    else if (wasOpen.current) returnFocus.current?.focus({ preventScroll: true });
    wasOpen.current = Boolean(selected);
  }, [selected]);

  function openFolder(item, trigger) {
    setTurn(null);
    setFrontIndex(items.indexOf(item));
    returnFocus.current = trigger;
    setSelectedId(item.id);
  }
  function moveBetweenFolders(event, index) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const available = items.map((item, position) => ({ item, position })).filter(({ item }) => item.id !== selectedId);
    const current = available.findIndex(({ position }) => position === index);
    const next = event.key === "Home" ? 0 : event.key === "End" ? available.length - 1
      : (current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + available.length) % available.length;
    triggerRefs.current[available[next]?.position]?.focus({ preventScroll: true });
  }

  return <div ref={frameRef} className={webinarStyles["webinar-folders"]} style={{ "--folder-count": items.length }}
    onMouseEnter={() => { setHovered(true); setTurn(null); }} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => { setFocused(true); setTurn(null); }}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className={webinarStyles["webinar-folder-basket"]}>
    <div className={webinarStyles["webinar-folder-deck"]} data-open={Boolean(selected)}>
      {items.map((item, index) => {
        const active = item.id === selectedId;
        const rank = (index - frontIndex + items.length) % items.length;
        const cloth = clothes[item.id] ?? clothes["faith-campus"];
        return <article key={item.id} aria-labelledby={`${item.id}-cover-title`} className={webinarStylesClasses(`webinar-file ${active ? "webinar-file--open" : ""} ${turn?.outgoing === index && turn.phase === "departing" ? "webinar-file--departing" : ""}`)}
          style={{ "--folder-rank": rank, "--folder-depth": items.length - 1 - rank, "--folder-tab-left": `${3.5 + index * tabStep}%`, "--folder-tab-width": `${tabStep - 5}%`, "--folder-color": cloth.color, "--folder-ink": cloth.ink }}>
          <h3 aria-label={item.title} aria-hidden={active ? true : undefined} inert={active ? true : undefined}>
            <button ref={(node) => { triggerRefs.current[index] = node; }} type="button" className={webinarStyles["webinar-folder-cover"]}
              aria-label={`Open webinar folder: ${item.title}`} aria-expanded={active} aria-controls={`${item.id}-folder-panel`}
              aria-current={rank === 0 ? "true" : undefined}
              disabled={active} onClick={(event) => openFolder(item, event.currentTarget)} onKeyDown={(event) => moveBetweenFolders(event, index)}>
              <FolderShape position={index} tabStep={tabStep} />
              <span className={webinarStyles["webinar-folder-cover__tab"]}><span className={webinarStyles["webinar-folder-cover__format"]}>{item.format}</span><span className={webinarStyles["webinar-folder-cover__short-date"]}>{tabDate(item.date)}</span></span>
              <span className={webinarStyles["webinar-folder-cover__summary"]}>
                <span className={webinarStyles["webinar-folder-cover__visual"]} aria-hidden="true">
                  <img src={publicAsset(item.image)} alt="" width="800" height="600" loading="lazy" />
                  <span className={webinarStyles["webinar-folder-cover__video"]}><FiVideo /></span>
                </span>
                <span className={webinarStyles["webinar-folder-cover__copy"]}>
                  <span id={`${item.id}-cover-title`} className={webinarStyles["webinar-folder-cover__title"]}>{item.title}</span>
                  <span className={webinarStyles["webinar-folder-cover__description"]}>{item.description}</span>
                </span>
                <span className={webinarStyles["webinar-folder-cover__footer"]}><time dateTime={item.date}>{formatCatalogueDate(item.date)}</time><span className={webinarStyles["webinar-folder-status"]} data-status={isFinished(item, today) ? "finished" : "upcoming"}><span aria-hidden="true" />{isFinished(item, today) ? "Finished" : "Upcoming"}</span></span>
              </span>
            </button>
          </h3>
        </article>;
      })}
      {items.map((item) => <section key={item.id} ref={selectedId === item.id ? panelRef : null} role="region"
        id={`${item.id}-folder-panel`} aria-labelledby={`${item.id}-folder-title`} hidden={selectedId !== item.id}
        tabIndex={-1} className={webinarStyles["webinar-folder-panel"]} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setSelectedId(null); } }}>
        {selectedId === item.id && <>
          <span aria-hidden="true" className={webinarStyles["webinar-folder-open-tab"]}>{item.format}</span>
          <button type="button" className={webinarStyles["webinar-folder-close"]} aria-label="Close webinar folder" onClick={() => setSelectedId(null)}><FiX aria-hidden="true" /></button>
          <div className={webinarStyles["webinar-folder-content"]}>
            <div className={webinarStyles["webinar-folder-image"]}>
              <img src={publicAsset(item.image)} alt={item.imageAlt} width="800" height="600" loading="lazy" />
              <div className={webinarStyles["webinar-folder-image__caption"]}><span aria-hidden="true"><FiVideo /></span><p>{item.format}<span>Online with ARPC</span></p></div>
            </div>
            <div className={webinarStyles["webinar-folder-details"]}>
              <h3 id={`${item.id}-folder-title`}>{item.title}</h3>
              <dl className={webinarStyles["webinar-folder-metadata"]}>
                <div><dt><FiCalendar aria-hidden="true" />Date</dt><dd><time dateTime={item.date}>{formatCatalogueDate(item.date)}</time></dd></div>
                <div><dt><FiClock aria-hidden="true" />Time</dt><dd>{item.time}<span>Dhaka time</span></dd></div>
                <div><dt><FiVideo aria-hidden="true" />Place</dt><dd>{item.location}</dd></div>
              </dl>
              <p className={webinarStyles["webinar-folder-description"]}>{item.details}</p>
              <ul className={webinarStyles["webinar-folder-takeaways"]}>{item.takeaways.map((point) => <li key={point}><FiCheck aria-hidden="true" />{point}</li>)}</ul>
              <div className={webinarStyles["webinar-folder-actions"]}>
                <p>Sample session. {isFinished(item, today) ? "Recording and resources will appear when confirmed." : "Speaker and joining details will appear when confirmed."}</p>
                {isFinished(item, today) ? <button type="button" disabled className={webinarStyles["webinar-folder-register"]}>Recording coming soon</button>
                  : <Link to="/register" className={webinarStyles["webinar-folder-register"]}>Register <span aria-hidden="true"><FiArrowUpRight /></span></Link>}
              </div>
            </div>
          </div>
        </>}
      </section>)}
    </div>
    </div>
    <div className={webinarStyles["webinar-folder-toolbar"]}>
      {items.length > 1 && <div role="group" aria-label="Folder rotation controls" className={webinarStyles["webinar-folder-controls"]}>
        <button type="button" aria-label="Previous webinar folder" disabled={Boolean(selected || turn)} onClick={() => { setPaused(true); rotateFolders(-1); }}><FiChevronLeft aria-hidden="true" /></button>
        <span className={webinarStyles["webinar-folder-position"]} aria-label={`Folder ${frontIndex + 1} of ${items.length}`}>{String(frontIndex + 1).padStart(2, "0")}<span aria-hidden="true"> / </span>{String(items.length).padStart(2, "0")}</span>
        <button type="button" aria-label="Next webinar folder" disabled={Boolean(selected || turn)} onClick={() => { setPaused(true); rotateFolders(1); }}><FiChevronRight aria-hidden="true" /></button>
      </div>}
      <p><FiFolder aria-hidden="true" /><span>{selected ? "Explore the session inside your folder." : "Open a folder to explore a webinar."}</span></p>
    </div>
  </div>;
}
