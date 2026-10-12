import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language, TranslationKey } from '../data/translations';
import { initGoogleTranslate, applyFullPageTranslation } from '../utils/translator';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'uz',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('aiadvokat_lang');
      return saved === 'en' ? 'en' : 'uz';
    } catch {
      return 'uz';
    }
  });

  // On mount, initialize the full-page DOM translation engine
  useEffect(() => {
    initGoogleTranslate();
    document.documentElement.lang = language;
    if (language === 'en') {
      applyFullPageTranslation('en');
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('aiadvokat_lang', newLang);
    } catch {}
    document.documentElement.lang = newLang;
    applyFullPageTranslation(newLang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'uz' ? 'en' : 'uz');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const langDict = translations[language];
      if (langDict && key in langDict) {
        return langDict[key];
      }
      return fallback || translations.uz[key] || (key as string);
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
