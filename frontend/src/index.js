import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize i18n
import './i18n';

// Performance monitoring (optional)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Error reporting (you can integrate with services like Sentry)
const reportError = (error, errorInfo) => {
  console.error('React Error:', error, errorInfo);
  // Send to error reporting service
};

// Performance monitoring
const reportWebVitals = (metric) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric);
  }
  // Send to analytics service
};

// Create root and render app
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register web vitals
getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global error handler
window.addEventListener('error', (event) => {
  reportError(event.error, { message: event.message, filename: event.filename, lineno: event.lineno });
});

window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, { type: 'unhandledrejection' });
});

export default reportWebVitals;