import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';
  const currentLanguage = i18n.language;

  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
  }, [i18n]);

  const formatMessage = useCallback((key, options = {}) => {
    return t(key, options);
  }, [t]);

  const formatNumber = useCallback((number, options = {}) => {
    return new Intl.NumberFormat(currentLanguage, options).format(number);
  }, [currentLanguage]);

  const formatCurrency = useCallback((amount, currency = 'USD') => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency,
    }).format(amount);
  }, [currentLanguage]);

  const formatDate = useCallback((date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(new Date(date));
  }, [currentLanguage]);

  const formatDateTime = useCallback((date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(new Date(date));
  }, [currentLanguage]);

  const formatRelativeTime = useCallback((date) => {
    const rtf = new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' });
    const diffInMs = new Date(date) - new Date();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    
    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        return rtf.format(diffInMinutes, 'minute');
      }
      return rtf.format(diffInHours, 'hour');
    }
    
    if (Math.abs(diffInDays) < 7) {
      return rtf.format(diffInDays, 'day');
    }
    
    if (Math.abs(diffInDays) < 30) {
      const diffInWeeks = Math.round(diffInDays / 7);
      return rtf.format(diffInWeeks, 'week');
    }
    
    if (Math.abs(diffInDays) < 365) {
      const diffInMonths = Math.round(diffInDays / 30);
      return rtf.format(diffInMonths, 'month');
    }
    
    const diffInYears = Math.round(diffInDays / 365);
    return rtf.format(diffInYears, 'year');
  }, [currentLanguage]);

  const getDirection = useCallback(() => {
    return isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const getTextAlign = useCallback((reverse = false) => {
    if (reverse) {
      return isRTL ? 'left' : 'right';
    }
    return isRTL ? 'right' : 'left';
  }, [isRTL]);

  const getMarginDirection = useCallback((start = true) => {
    if (start) {
      return isRTL ? 'marginRight' : 'marginLeft';
    }
    return isRTL ? 'marginLeft' : 'marginRight';
  }, [isRTL]);

  const getPaddingDirection = useCallback((start = true) => {
    if (start) {
      return isRTL ? 'paddingRight' : 'paddingLeft';
    }
    return isRTL ? 'paddingLeft' : 'paddingRight';
  }, [isRTL]);

  const getBorderDirection = useCallback((start = true) => {
    if (start) {
      return isRTL ? 'borderRight' : 'borderLeft';
    }
    return isRTL ? 'borderLeft' : 'borderRight';
  }, [isRTL]);

  // Helper for conditional class names based on direction
  const directionClass = useCallback((ltrClass, rtlClass) => {
    return isRTL ? rtlClass : ltrClass;
  }, [isRTL]);

  // Helper for flex direction
  const getFlexDirection = useCallback((reverse = false) => {
    if (reverse) {
      return isRTL ? 'row' : 'row-reverse';
    }
    return isRTL ? 'row-reverse' : 'row';
  }, [isRTL]);

  return {
    t,
    i18n,
    isRTL,
    currentLanguage,
    changeLanguage,
    formatMessage,
    formatNumber,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    getDirection,
    getTextAlign,
    getMarginDirection,
    getPaddingDirection,
    getBorderDirection,
    directionClass,
    getFlexDirection,
  };
};

export default useI18n;