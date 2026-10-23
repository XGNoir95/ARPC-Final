import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext';
import { applyTheme, normalizeTheme, readTheme, THEME_KEY } from '../utils/theme';

export default function ThemeProvider({ children }) {
  const [preference, setStoredPreference] = useState(readTheme);
  const theme = preference;
  const setPreference = useCallback(value => {
    const next = normalizeTheme(value);
    setStoredPreference(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch { /* The selected theme still works when browser storage is blocked. */ }
  }, []);

  useLayoutEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    const onStorage = event => {
      if (event.key === THEME_KEY || event.key === null) setStoredPreference(normalizeTheme(event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ preference, theme, setPreference }), [preference, theme, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
