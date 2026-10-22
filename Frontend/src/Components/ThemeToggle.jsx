import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../ThemeContext';
import { floatingControlStyles as styles } from './FloatingControls.styles';

export default function ThemeToggle() {
  const { theme, setPreference } = useTheme();
  const dark = theme === 'dark';
  return <button type="button" aria-label="Toggle dark mode" aria-pressed={dark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setPreference(dark ? 'light' : 'dark')} className={`${styles.button} border-ink/20 bg-surface/95 text-ink backdrop-blur-sm hover:bg-raised`}>
    {dark ? <FiSun aria-hidden="true" className={styles.icon}/> : <FiMoon aria-hidden="true" className={styles.icon}/>}
  </button>;
}
