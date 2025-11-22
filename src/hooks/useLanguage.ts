import { useTranslation } from 'react-i18next';
import { Language } from '../utils/translations';

/**
 * Hook to get and manage the current language
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = (i18n.language || 'fr') as Language;

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const isCurrentLanguage = (lang: Language) => {
    return currentLanguage === lang;
  };

  return {
    currentLanguage,
    changeLanguage,
    isCurrentLanguage,
  };
};
