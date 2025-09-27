
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Record<string, any>;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`./locales/${language}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Could not load translations:", error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};