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
    },
    react: {
      useSuspense: false // prevents issues with suspense
    },
    debug: false // set to true to see debugging info in console
  });

// Add a function to help debug missing translations
export const checkMissingTranslations = () => {
  const frKeys = getAllKeys(translationFR);
  const enKeys = getAllKeys(translationEN);
  
  console.log('Missing in EN:', frKeys.filter(key => !enKeys.includes(key)));
  console.log('Missing in FR:', enKeys.filter(key => !frKeys.includes(key)));
};

// Helper function to get all keys from a nested object
const getAllKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = [];
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = [...keys, ...getAllKeys(obj[key], newKey)];
    } else {
      keys.push(newKey);
    }
  }
  
  return keys;
};

export default i18n;