import { useLayoutEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowUpRight, FiBookOpen, FiCheck, FiClock, FiCompass, FiGrid, FiList, FiLock, FiMapPin } from "react-icons/fi";
import { publicAsset } from "../utils/publicAsset";
import { getCourseCover } from "../utils/courseCovers";
import { courseStyles } from "./CourseLaptop.styles";

const courseFee = (item) => item.fee === 0 ? "Free" : `৳ ${item.fee.toLocaleString("en-BD")}`;

function FolderArtwork({ cover, fallbackCover }) {
  return <span className={courseStyles["course-folder-art"]} aria-hidden="true">
    <svg viewBox="0 0 180 140" fill="none">
      <path d="M 14 9 H 53 Q 60 9 66 15 L 74 22 H 166 Q 178 22 178 35 V 123 Q 178 136 165 136 H 15 Q 2 136 2 123 V 22 Q 2 9 14 9 Z" fill="var(--course-folder-color)" stroke="var(--course-folder-ink)" strokeOpacity=".4" />
      <path d="M 3 40 H 177 V 52 H 3 Z" fill="var(--course-folder-ink)" opacity=".08" />
    </svg>
    <img className={courseStyles["course-folder-illustration"]} src={cover} alt="" width="360" height="220"
      onError={(event) => { if (event.currentTarget.getAttribute("src") !== fallbackCover) event.currentTarget.src = fallbackCover; }} />
  </span>;
}

export default function CourseLaptop({ items }) {
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("grid");
  const selected = items.find((item) => item.id === selectedId);
  const panelRef = useRef(null);
  const windowRef = useRef(null);
  const transitionLayerRef = useRef(null);
  const snapshotRef = useRef(null);
  const returnFocus = useRef(null);
  const dockRef = useRef(null);
  const wasOpen = useRef(false);
  const freeCount = items.filter((item) => item.fee === 0).length;
  const nativeMotion = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    const panel = panelRef.current;
    const windowNode = windowRef.current;
    const layer = transitionLayerRef.current;
    if (!selected || !nativeMotion || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const animations = [];
    const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
    if (snapshot) {
      layer.replaceChildren(snapshot.node);
      animations.push(snapshot.node.animate([
        { opacity: snapshot.opacity, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-4px)" },
      ], { duration: 140, easing, fill: "forwards" }));
      const height = panel.getBoundingClientRect().height;
      if (snapshot.height > 0 && height > 0) animations.push(windowNode.animate([
        { height: `${snapshot.height}px` }, { height: `${height}px` },
      ], { duration: 440, easing, fill: "both" }));
    }
    animations.push(panel.animate([
      { opacity: 0, transform: "translateY(6px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: 360, delay: snapshot ? 100 : 0, easing, fill: "both" }));

    let disposed = false;
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      animations.forEach((animation) => animation.cancel());
      layer.replaceChildren();
    };
    Promise.all(animations.map((animation) => animation.finished)).then(cleanup, () => {});
    return cleanup;
  }, [selected, nativeMotion]);

  useLayoutEffect(() => {
    const compact = window.matchMedia?.("(max-width: 1023px)")?.matches;
    if (selected) {
      panelRef.current?.focus({ preventScroll: true });
      if (compact) panelRef.current?.scrollIntoView?.({
        block: "start",
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth",
      });
    } else if (wasOpen.current) {
      const trigger = returnFocus.current?.isConnected ? returnFocus.current : dockRef.current;
      trigger?.focus({ preventScroll: !compact });
    }
    wasOpen.current = Boolean(selected);
  }, [selected]);

  function openCourse(item, trigger) {
    if (selectedId === item.id) return;
    if (selected && nativeMotion && !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      const panel = panelRef.current;
      const node = panel.cloneNode(true);
      node.removeAttribute("id");
      node.removeAttribute("role");
      node.removeAttribute("aria-labelledby");
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("inert", "");
      node.classList.add(...courseStyles["course-screen-details--outgoing"].split(/\s+/));
      node.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
      snapshotRef.current = {
        node,
        opacity: Number(window.getComputedStyle(panel).opacity),
        height: windowRef.current.getBoundingClientRect().height,
      };
    }
    returnFocus.current = trigger;
    setSelectedId(item.id);
  }

  return <div className={courseStyles["course-study-desk"]}>
    <div className={courseStyles["course-laptop"]} style={{ "--course-columns": Math.min(3, items.length) }}>
    <div className={courseStyles["course-laptop-lid"]}>
      <div className={courseStyles["course-laptop-screen"]}>
        <div className={courseStyles["course-desktop-bar"]}>
          <div className={courseStyles["course-desktop-app"]}>
            <span className={courseStyles["course-window-dots"]} aria-hidden="true"><span /><span /><span /></span>
            <span className={courseStyles["course-desktop-brand"]}><img src={publicAsset("/newLogo.png")} alt="ARPC" width="36" height="36" /><span>ARPC Learning</span></span>
          </div>
          <span className={courseStyles["course-desktop-location"]}>{selected ? selected.format : "Course library"}</span>
          <div className={courseStyles["course-view-controls"]} role="group" aria-label="Course library view">
            <button type="button" aria-label="Grid view" aria-pressed={view === "grid"} disabled={Boolean(selected)} onClick={() => setView("grid")}><FiGrid aria-hidden="true" /></button>
            <button type="button" aria-label="List view" aria-pressed={view === "list"} disabled={Boolean(selected)} onClick={() => setView("list")}><FiList aria-hidden="true" /></button>
          </div>
        </div>
        <div className={courseStyles["course-workspace"]} data-open={Boolean(selected)} data-view={view}>
          <div className={courseStyles["course-folder-grid"]} aria-label="Course folders">
            {items.map((item) => {
              const { color, ink, cover, fallbackCover } = getCourseCover(item);
              return <article key={item.id} className={courseStyles["course-folder"]} aria-labelledby={`${item.id}-folder-name`}
                style={{ "--course-folder-color": color, "--course-folder-ink": ink }}>
                <h3 id={`${item.id}-folder-name`} aria-label={item.title}>
                <button type="button" className={courseStyles["course-folder-button"]} aria-label={`Open course folder: ${item.title}`}
                  aria-expanded={selectedId === item.id} aria-controls="course-screen-details"
                  onClick={(event) => openCourse(item, event.currentTarget)}>
                  <FolderArtwork cover={cover} fallbackCover={fallbackCover} />
                  <span className={courseStyles["course-folder-label"]}>
                    <span className={courseStyles["course-folder-title"]}>{item.title}</span>
                    <span className={courseStyles["course-folder-summary"]}>{courseFee(item)}<span aria-hidden="true"> · </span>{item.duration}</span>
                  </span>
                </button>
                </h3>
              </article>;
            })}
          </div>
          {selected && <div ref={windowRef} className={courseStyles["course-detail-window"]}>
          <section key={selected.id} ref={panelRef} id="course-screen-details" role="region" tabIndex={-1}
            aria-labelledby={`${selected.id}-screen-title`} className={courseStyles["course-screen-details"]}
            data-native-motion={nativeMotion}
            onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setSelectedId(null); } }}>
            <div className={courseStyles["course-detail-toolbar"]}>
              <span className={courseStyles["course-detail-status"]}>{selected.fee === 0 ? "Free course" : "Paid course"}</span>
              <button type="button" onClick={() => setSelectedId(null)} className={courseStyles["course-detail-back"]}><FiArrowLeft aria-hidden="true" />All courses</button>
            </div>
            <div className={courseStyles["course-detail-intro"]}>
              <h3 id={`${selected.id}-screen-title`}>{selected.title}</h3>
              <img src={publicAsset(selected.image)} alt={selected.imageAlt} width="800" height="600" loading="lazy" />
            </div>
            <dl className={courseStyles["course-detail-metadata"]}>
              <div><dt><FiBookOpen aria-hidden="true" />Course fee</dt><dd>{courseFee(selected)}</dd></div>
              <div><dt><FiClock aria-hidden="true" />Duration</dt><dd>{selected.duration}</dd></div>
              <div><dt><FiCompass aria-hidden="true" />Learning format</dt><dd>{selected.pace}</dd></div>
              <div><dt><FiMapPin aria-hidden="true" />Place</dt><dd>{selected.location}</dd></div>
            </dl>
            <p className={courseStyles["course-detail-description"]}>{selected.details}</p>
            <h4 className={courseStyles["course-detail-subheading"]}>What you’ll learn</h4>
            <ul className={courseStyles["course-detail-takeaways"]}>{selected.takeaways.map((point) => <li key={point}><FiCheck aria-hidden="true" />{point}</li>)}</ul>
            <div className={courseStyles["course-detail-actions"]}>
              <p>Sample course. Fees, syllabus and availability will be confirmed before enrolment opens.</p>
              <button type="button" disabled><FiLock aria-hidden="true" />Enrolment coming soon</button>
            </div>
          </section>
          <div ref={transitionLayerRef} className={courseStyles["course-detail-transition-layer"]} aria-hidden="true" inert />
          </div>}
          {!selected && <div className={courseStyles["course-library-dock"]}>
            <p className={courseStyles["course-library-count"]}><strong>{items.length} {items.length === 1 ? "course" : "courses"}</strong><span>{freeCount} free<span aria-hidden="true"> · </span>{items.length - freeCount} paid</span></p>
            <p className={courseStyles["course-desktop-hint"]}>Open a folder to explore your next course.</p>
            <button ref={dockRef} type="button" className={courseStyles["course-library-open"]} onClick={(event) => openCourse(items[0], event.currentTarget)}>Explore a course<FiArrowUpRight aria-hidden="true" /></button>
          </div>}
        </div>
      </div>
    </div>
    <div className={courseStyles["course-laptop-base"]} aria-hidden="true" />
    </div>
  </div>;
}
