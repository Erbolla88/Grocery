
import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import type { Language } from '../types';

interface HeaderProps {
  t: Record<string, string>;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ t, language, setLanguage }) => {
  return (
    <header className="text-center relative py-2">
      <div className="absolute top-0 right-0">
        <LanguageSelector language={language} setLanguage={setLanguage} />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 tracking-tight">{t.appTitle}</h1>
      <p className="mt-2 text-md text-gray-500">{t.appSubtitle}</p>
    </header>
  );
};
