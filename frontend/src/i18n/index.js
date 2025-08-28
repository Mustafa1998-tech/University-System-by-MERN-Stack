import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Import translation files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Load translations using http
  .use(HttpApi)
  // Initialize i18next
  .init({
    resources,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Default language
    lng: 'en',
    fallbackLng: 'en',
    
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
      format: (value, format, lng) => {
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        }
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value));
        }
        if (format === 'datetime') {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(value));
        }
        return value;
      }
    },
    
    // Namespace options
    defaultNS: 'translation',
    ns: ['translation'],
    
    // React options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'b', 'span'],
    },
    
    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

// Language change handler
i18n.on('languageChanged', (lng) => {
  // Update document direction for RTL languages
  const direction = lng === 'ar' ? 'rtl' : 'ltr';
  document.dir = direction;
  document.documentElement.setAttribute('dir', direction);
  document.documentElement.setAttribute('lang', lng);
  
  // Update body class for styling
  document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
  document.body.classList.add(direction);
  
  // Store language preference
  localStorage.setItem('language', lng);
});

// Set initial direction
const currentLng = i18n.language || 'en';
const direction = currentLng === 'ar' ? 'rtl' : 'ltr';
document.dir = direction;
document.documentElement.setAttribute('dir', direction);
document.documentElement.setAttribute('lang', currentLng);
document.body.classList.add(direction);

export default i18n;