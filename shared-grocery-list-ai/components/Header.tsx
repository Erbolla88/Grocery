
import React from 'react';
import { LanguageSelector } from './LanguageSelector.tsx';
import type { Language } from '../types';

interface HeaderProps {
  t: Record<string, string>;
  language: Language;
  setLanguage: (lang: Language) => void;
  userDisplayName: string | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ t, language, setLanguage, userDisplayName, onSignOut }) => {
  return (
    <header className="py-2">
      <div className="flex justify-between items-center mb-2 h-8">
         <div>
           {userDisplayName && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{t.loggedInAs} <strong>{userDisplayName}</strong></span>
                <button onClick={onSignOut} className="text-sm text-blue-600 hover:underline focus:outline-none">
                  {t.signOut}
                </button>
              </div>
           )}
         </div>
         <LanguageSelector language={language} setLanguage={setLanguage} />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">{t.appTitle}</h1>
        <p className="mt-2 text-md text-gray-500">{t.appSubtitle}</p>
      </div>
    </header>
  );
};