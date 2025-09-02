

import React from 'react';
import { ItalianFlagIcon } from './icons/ItalianFlagIcon.tsx';
import { SpanishFlagIcon } from './icons/SpanishFlagIcon.tsx';
import type { Language } from '../types';

interface LanguageSelectorProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => {
  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'it' : 'es';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label={`Switch to ${language === 'es' ? 'Italian' : 'Spanish'}`}
    >
      {language === 'es' ? <ItalianFlagIcon /> : <SpanishFlagIcon />}
    </button>
  );
};