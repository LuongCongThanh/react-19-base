import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonEn from '../locales/common/en.json';
import commonFr from '../locales/common/fr.json';
import commonVi from '../locales/common/vi.json';
import homeEn from '../locales/home/en.json';
import homeFr from '../locales/home/fr.json';
import homeVi from '../locales/home/vi.json';
import loginEn from '../locales/login/en.json';
import loginFr from '../locales/login/fr.json';
import loginVi from '../locales/login/vi.json';

const resources = {
  vi: {
    common: commonVi,
    home: homeVi,
    login: loginVi,
  },
  en: {
    common: commonEn,
    home: homeEn,
    login: loginEn,
  },
  fr: {
    common: commonFr,
    home: homeFr,
    login: loginFr,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    ns: ['common', 'home', 'login'],
    defaultNS: 'common',
  });

export default i18n;
