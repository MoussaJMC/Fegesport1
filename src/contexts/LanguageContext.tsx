import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../utils/i18n';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  isLanguageLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    // Initialize language from localStorage or default to French
    const savedLanguage = localStorage.getItem('i18nextLng') || 'fr';
    if (i18n.language !== savedLanguage) {
      changeLanguage(savedLanguage);
    }
    setIsLanguageLoaded(true);
  }, [i18n]);

  const handleChangeLanguage = (lang: string) => {
    changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage: i18n.language,
        changeLanguage: handleChangeLanguage,
        isLanguageLoaded
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};