export const THEME_KEY = 'arpc-color-theme';
export const normalizeTheme = value => value === 'dark' ? 'dark' : 'light';

export function readTheme() {
  try { return normalizeTheme(localStorage.getItem(THEME_KEY)); }
  catch { return 'light'; }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
}
