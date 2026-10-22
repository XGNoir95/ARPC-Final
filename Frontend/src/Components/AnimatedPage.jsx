// src/Components/AnimatedPage.jsx
import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import PageSkeleton from "./PageSkeleton";
import { ROUTE_FADE_SECONDS } from "../utils/prepareRoute";

const AnimatedPage = ({ children, pathname, loading = false, focusOnEntry = false }) => {
  const pageRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const transition = { duration: reducedMotion ? 0 : ROUTE_FADE_SECONDS, ease: [0.22, 1, 0.36, 1] };

  useLayoutEffect(() => {
    // Show the destination skeleton at the top immediately; never fade to a blank canvas.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useLayoutEffect(() => {
    if (!loading && focusOnEntry) pageRef.current?.focus({ preventScroll: true });
  }, [loading, pathname, focusOnEntry]);

  return (
    <main ref={pageRef} tabIndex={-1} aria-busy={loading} className="relative isolate grid flex-1 bg-surface outline-none">
      <Motion.div
        inert={loading ? true : undefined}
        aria-hidden={loading ? true : undefined}
        className={`min-w-0 [grid-area:1/1] ${loading ? "invisible" : "visible"}`}
        initial={{ opacity: loading ? 0 : 1 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={transition}
      >
        {children}
      </Motion.div>
      <AnimatePresence initial={false}>
        {loading && <Motion.div
          key="skeleton"
          aria-hidden="true"
          className="pointer-events-none relative z-10 min-w-0 bg-surface [grid-area:1/1]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <PageSkeleton pathname={pathname} />
        </Motion.div>}
      </AnimatePresence>
    </main>
  );
};

export default AnimatedPage;
