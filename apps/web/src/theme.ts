export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mil-theme';

export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage indisponível: o tema vale apenas para a sessão
  }
  window.dispatchEvent(new Event('mil-theme-change'));
}
