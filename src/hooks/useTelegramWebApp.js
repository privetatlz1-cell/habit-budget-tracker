import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

const fallbackTheme = {
  bg_color: '#0b1220',
  text_color: '#e2e8f0',
  hint_color: '#94a3b8',
  link_color: '#60a5fa',
  button_color: '#6366f1',
  button_text_color: '#ffffff',
  secondary_bg_color: '#111827'
};

export default function useTelegramWebApp() {
  useEffect(() => {
    if (!WebApp) return;

    const applyTheme = () => {
      const resolved = { ...fallbackTheme };

      const root = document.documentElement;
      root.style.setProperty('--tg-bg-color', resolved.bg_color);
      root.style.setProperty('--tg-text-color', resolved.text_color);
      root.style.setProperty('--tg-hint-color', resolved.hint_color);
      root.style.setProperty('--tg-link-color', resolved.link_color);
      root.style.setProperty('--tg-button-color', resolved.button_color);
      root.style.setProperty('--tg-button-text-color', resolved.button_text_color);
      root.style.setProperty('--tg-secondary-bg-color', resolved.secondary_bg_color);

      root.classList.add('dark');
      WebApp.setHeaderColor(resolved.bg_color);
    };

    WebApp.ready();
    WebApp.expand();
    applyTheme();
    WebApp.onEvent('themeChanged', applyTheme);

    return () => {
      WebApp.offEvent('themeChanged', applyTheme);
    };
  }, []);

  return WebApp;
}
