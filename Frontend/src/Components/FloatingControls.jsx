import ScrollToTopButton from './ScrollToTopButton';
import ThemeToggle from './ThemeToggle';
import { floatingControlStyles as styles } from './FloatingControls.styles';

export default function FloatingControls({ showScrollToTop = true }) {
  return <div role="group" aria-label="Page controls" className={styles.stack}>
    <ThemeToggle />
    {showScrollToTop && <ScrollToTopButton />}
  </div>;
}
