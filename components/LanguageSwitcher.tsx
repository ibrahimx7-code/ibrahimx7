
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslations();

  const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
  ];

  return (
    <div className="flex items-center gap-2">
       <Languages size={20} className="text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ar' | 'ja')}
        className="bg-base-300 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
