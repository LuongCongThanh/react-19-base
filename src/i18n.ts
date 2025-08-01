// src/i18n.ts

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: 'en',
        ns: ['common', 'home', 'login'],
        defaultNS: 'common',
        backend: {
            loadPath: '/locales/{{ns}}/{{lng}}.json',
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
