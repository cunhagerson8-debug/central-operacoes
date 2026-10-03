import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, type Theme } from './theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    const sync = () => setTheme(getStoredTheme());
    window.addEventListener('mil-theme-change', sync);
    return () => window.removeEventListener('mil-theme-change', sync);
  }, []);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = next === 'dark' ? 'Ativar tema escuro' : 'Ativar tema claro';

  return (
    <button
      type="button"
      className="theme-toggle"
      title={label}
      aria-label={label}
      onClick={() => applyTheme(next)}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
