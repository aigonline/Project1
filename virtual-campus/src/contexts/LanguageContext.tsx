import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

// Define supported languages
export type Language = 'en' | 'fr' | 'es';

// Define translations structure
interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const translations: Record<Language, Translations> = {
  en,
  fr,
  es
};

const defaultContext: LanguageContextType = {
  language: 'en',
  translations: en,
  setLanguage: () => {},
  t: (key) => key,
};

export const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translations.en);

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    // Get saved language from localStorage or detect from browser
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLanguage = navigator.language.split('-')[0] as Language;
    
    // Use saved language if available, otherwise check if browser language is supported
    const initialLanguage = savedLanguage || 
      (translations[browserLanguage] ? browserLanguage : 'en');
    
    setLanguage(initialLanguage);
  }, []);
  
  // Translation function with parameter support
  const t = (key: string, params?: Record<string, string>): string => {
    let text = currentTranslations[key] || key;
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, value);
      });
    }
    
    return text;
  };

  const setLanguage = (newLanguage: Language) => {
    if (translations[newLanguage]) {
      localStorage.setItem('language', newLanguage);
      setLanguageState(newLanguage);
      setCurrentTranslations(translations[newLanguage]);
      
      // Update HTML lang attribute
      document.documentElement.setAttribute('lang', newLanguage);
    }
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        translations: currentTranslations, 
        setLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};