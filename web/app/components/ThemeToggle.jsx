'use client';

// Alterna claro/oscuro estampando data-theme en <html>. Respeta el tema del
// sistema hasta que el usuario decide manualmente.
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const actual =
      root.dataset.theme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.dataset.theme = actual === 'dark' ? 'light' : 'dark';
  }

  return (
    <button className="tbtn" onClick={toggle} aria-label="Cambiar tema claro u oscuro" title="Cambiar tema">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" />
      </svg>
    </button>
  );
}
