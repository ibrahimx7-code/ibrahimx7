
import { useLanguage } from '../contexts/LanguageContext';

const getNestedTranslation = (obj: any, key: string, fallback: string): string => {
  const result = key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  return result || fallback;
};

export const useTranslations = () => {
  const { language, setLanguage, translations, loading } = useLanguage();

  const t = (key: string): string => {
    if (loading) {
      return '...';
    }
    return getNestedTranslation(translations, key, key);
  };

  return { t, language, setLanguage, dir: language === 'ar' ? 'rtl' : 'ltr', loadingTranslations: loading };
};