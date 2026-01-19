import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContextObj = createContext({ theme: 'system', setTheme: () => {} });

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const getDefault = () => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to light theme to match design
    return 'light';
  };

  const [theme, setThemeState] = useState(getDefault);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const setTheme = (next) => {
    if (next === 'light' || next === 'dark') setThemeState(next);
    else setThemeState(getSystemTheme());
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContextObj.Provider value={value}>{children}</ThemeContextObj.Provider>;
}

export function useTheme() {
  return useContext(ThemeContextObj);
}





