import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

const fallbackTheme = {
  bg_color: '#ffffff',
  text_color: '#111827',
  hint_color: '#6b7280',
  link_color: '#3b82f6',
  button_color: '#4f46e5',
  button_text_color: '#ffffff',
  secondary_bg_color: '#f8fafc'
};

export default function useTelegramWebApp() {
  useEffect(() => {
    if (!WebApp) return;

    const applyTheme = () => {
      const themeParams = WebApp.themeParams || {};
      const resolved = { ...fallbackTheme, ...themeParams };

      const root = document.documentElement;
      root.style.setProperty('--tg-bg-color', resolved.bg_color);
      root.style.setProperty('--tg-text-color', resolved.text_color);
      root.style.setProperty('--tg-hint-color', resolved.hint_color);
      root.style.setProperty('--tg-link-color', resolved.link_color);
      root.style.setProperty('--tg-button-color', resolved.button_color);
      root.style.setProperty('--tg-button-text-color', resolved.button_text_color);
      root.style.setProperty('--tg-secondary-bg-color', resolved.secondary_bg_color);

      const isDark = WebApp.colorScheme === 'dark';
      root.classList.toggle('dark', isDark);
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
