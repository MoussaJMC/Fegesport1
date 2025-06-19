import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
import translationEN from '../locales/en.json';
import translationFR from '../locales/fr.json';

// Configure i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: translationEN
      },
      fr: {
        translation: translationFR
      }
    },
    lng: 'fr', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;