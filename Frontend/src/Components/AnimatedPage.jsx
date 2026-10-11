// src/Components/AnimatedPage.jsx
import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import PageSkeleton from "./PageSkeleton";

const AnimatedPage = ({ children, pathname, loading = false, focusOnEntry = false }) => {
  const pageRef = useRef(null);
  const entryFocus = useRef(focusOnEntry);
  const reducedMotion = useReducedMotion();
  const transition = { duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] };

  useLayoutEffect(() => {
    // Show the destination skeleton at the top immediately; never fade to a blank canvas.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useLayoutEffect(() => {
    if (!loading && entryFocus.current) pageRef.current?.focus({ preventScroll: true });
  }, [loading]);

  return (
    <main ref={pageRef} tabIndex={-1} aria-busy={loading} className="relative isolate flex-1 bg-white outline-none">
      <Motion.div
        inert={loading ? true : undefined}
        aria-hidden={loading ? true : undefined}
        style={{ visibility: loading ? "hidden" : "visible" }}
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
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-white"
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
