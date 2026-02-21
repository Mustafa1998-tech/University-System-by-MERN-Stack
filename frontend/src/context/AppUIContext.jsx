import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getText } from '../config/uiText';

const AppUIContext = createContext(null);

function resolveApiBase() {
  const defaultHost = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';

  const raw = process.env.REACT_APP_API_URL || `http://${defaultHost}:5000/api/v1`;
  const trimmed = raw.replace(/\/+$/, '');

  return trimmed.endsWith('/api') ? `${trimmed}/v1` : trimmed;
}

export function AppUIProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('sis_language');
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sis_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const apiBase = useMemo(() => resolveApiBase(), []);
  const text = useMemo(() => getText(language), [language]);

  useEffect(() => {
    localStorage.setItem('sis_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', language === 'ar');
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sis_theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      apiBase,
      text
    }),
    [language, theme, apiBase, text]
  );

  return <AppUIContext.Provider value={value}>{children}</AppUIContext.Provider>;
}

export function useAppUI() {
  const context = useContext(AppUIContext);
  if (!context) {
    throw new Error('useAppUI must be used within AppUIProvider');
  }
  return context;
}
