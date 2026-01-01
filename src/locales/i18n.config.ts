import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from './en/auth.json';
import enCommon from './en/common.json';
import enDashboard from './en/dashboard.json';
import viAuth from './vi/auth.json';
import viCommon from './vi/common.json';
import viDashboard from './vi/dashboard.json';

// Import type definitions
import './i18next.d.ts';

/**
 * Supported languages in the application
 */
export const SUPPORTED_LANGUAGES = ['en', 'vi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Default language fallback
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * LocalStorage key for persisting user's language preference
 */
const LANGUAGE_KEY = 'app_language';

/**
 * Check if a string is a supported language
 */
const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

/**
 * Get stored language from localStorage or detect from browser
 * Falls back to DEFAULT_LANGUAGE if no preference found
 */
const getInitialLanguage = (): SupportedLanguage => {
  try {
    // 1. Check localStorage first (user's explicit choice)
    const storedLang = localStorage.getItem(LANGUAGE_KEY);
    if (storedLang && isSupportedLanguage(storedLang)) {
      return storedLang;
    }

    // 2. Detect from browser language
    const browserLang = navigator.language?.split('-')[0]; // en-US → en
    if (browserLang && isSupportedLanguage(browserLang)) {
      return browserLang;
    }
  } catch (error) {
    console.warn('Failed to get initial language:', error);
  }

  // 3. Fallback to default language
  return DEFAULT_LANGUAGE;
};

/**
 * Initialize i18next with React support
 */
i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
    },
    vi: {
      common: viCommon,
      auth: viAuth,
      dashboard: viDashboard,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'auth', 'dashboard'],
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  saveMissing: false,
  missingKeyHandler: (lng, ns, key) => {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing translation: ${ns}:${key} (${lng})`);
    }
  },
});

/**
 * Save language preference to localStorage whenever it changes
 */
i18n.on('languageChanged', (lng) => {
  try {
    // Validate language before saving
    if (isSupportedLanguage(lng)) {
      localStorage.setItem(LANGUAGE_KEY, lng);
      document.documentElement.lang = lng; // Update HTML lang attribute for SEO
    } else {
      console.warn(`[i18n] Attempted to save unsupported language: ${lng}`);
    }
  } catch (error) {
    console.error('[i18n] Failed to save language preference:', error);
    // Fallback: at least update HTML lang even if localStorage fails
    document.documentElement.lang = lng;
  }
});

/**
 * Change language and persist to localStorage
 * @param language - One of the supported languages
 * @throws Error if language is not supported
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  if (!isSupportedLanguage(language)) {
    throw new Error(`[i18n] Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }

  try {
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error(`[i18n] Failed to change language to ${language}:`, error);
    throw error;
  }
};

/**
 * Get current active language
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  const current = i18n.language;
  return isSupportedLanguage(current) ? current : DEFAULT_LANGUAGE;
};

/**
 * Check if a language is currently active
 */
export const isLanguageActive = (language: SupportedLanguage): boolean => {
  return i18n.language === language;
};

/**
 * Toggle between available languages
 */
export const toggleLanguage = async (): Promise<void> => {
  const current = getCurrentLanguage();
  const next: SupportedLanguage = current === 'en' ? 'vi' : 'en';
  await changeLanguage(next);
};

export { i18n };
export default i18n;
