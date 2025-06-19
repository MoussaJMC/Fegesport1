import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import translationEN from '../locales/en.json';
import translationFR from '../locales/fr.json';

// Configure i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detects user language
  .init({
    resources: {
      en: {
        translation: translationEN
      },
      fr: {
        translation: translationFR
      }
    },
    fallbackLng: 'fr',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    react: {
      useSuspense: false // prevents suspense when loading translations
    }
  });

// Function to change language that updates localStorage
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
};

export default i18n;