import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Create language context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children, onLanguageChange }) => {
  const { i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Get current language
  const currentLanguage = i18n.language || 'ar';
  const isRTL = currentLanguage === 'ar';

  // Change language function
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    
    // Update document direction
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.dir = direction;
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.lang = language;
    
    // Call parent callback if provided
    if (onLanguageChange) {
      onLanguageChange(darkMode, language);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Update document class
    document.documentElement.classList.toggle('dark', newDarkMode);
    
    // Call parent callback if provided
    if (onLanguageChange) {
      onLanguageChange(newDarkMode, currentLanguage);
    }
  };

  // Set theme
  const setTheme = (theme) => {
    const isDark = theme === 'dark';
    setDarkMode(isDark);
    localStorage.setItem('theme', theme);
    
    // Update document class
    document.documentElement.classList.toggle('dark', isDark);
    
    // Call parent callback if provided
    if (onLanguageChange) {
      onLanguageChange(isDark, currentLanguage);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if no theme is saved (user hasn't set preference)
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Context value
  const value = {
    currentLanguage,
    isRTL,
    darkMode,
    changeLanguage,
    toggleDarkMode,
    setTheme,
    
    // Utility functions
    getDirection: () => isRTL ? 'rtl' : 'ltr',
    getTextAlign: () => isRTL ? 'right' : 'left',
    getFlexDirection: () => isRTL ? 'row-reverse' : 'row',
    
    // Language options
    languages: [
      { code: 'ar', name: 'العربية', nameEn: 'Arabic' },
      { code: 'en', name: 'English', nameEn: 'English' }
    ],
    
    // Theme options
    themes: [
      { value: 'light', name: 'فاتح', nameEn: 'Light' },
      { value: 'dark', name: 'داكن', nameEn: 'Dark' },
      { value: 'auto', name: 'تلقائي', nameEn: 'Auto' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

export default LanguageContext;