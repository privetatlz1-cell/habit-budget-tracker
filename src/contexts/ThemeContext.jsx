import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContextObj = createContext({ theme: 'dark', setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    try { localStorage.setItem('theme', 'dark'); } catch {}
  }, [theme]);

  const setTheme = (next) => {
    if (next === 'dark') setThemeState('dark');
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContextObj.Provider value={value}>{children}</ThemeContextObj.Provider>;
}

export function useTheme() {
  return useContext(ThemeContextObj);
}





