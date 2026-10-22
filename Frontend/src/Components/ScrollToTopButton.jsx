import { useEffect, useSyncExternalStore } from 'react';
import { floatingControlStyles as styles } from './FloatingControls.styles';

function subscribeToScroll(onChange) {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  window.addEventListener('pageshow', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
    window.removeEventListener('pageshow', onChange);
  };
}

const canScrollUp = () => window.scrollY > 1;
const serverSnapshot = () => false;

export default function ScrollToTopButton() {
  const enabled = useSyncExternalStore(subscribeToScroll, canScrollUp, serverSnapshot);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  const scrollToTop = () => {
    if (!enabled) return;
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'instant' : 'smooth',
    });
  };

  return <button
    type="button"
    onClick={scrollToTop}
    disabled={!enabled}
    aria-label="Scroll to top"
    title={enabled ? 'Scroll to top' : 'Already at the top'}
    className={`${styles.button} border-white/15 bg-brand text-white enabled:hover:bg-brand/90 disabled:cursor-default disabled:opacity-50 disabled:shadow-none`}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  </button>;
}
