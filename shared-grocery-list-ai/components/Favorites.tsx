

import React from 'react';
import type { GroceryItem, Language } from '../types';
import { PlusIcon } from './icons/PlusIcon.tsx';

interface FavoritesProps {
  items: GroceryItem[];
  onAddItem: (itemName: string) => Promise<void>;
  t: Record<string, string>;
  language: Language;
}

export const Favorites: React.FC<FavoritesProps> = ({ items, onAddItem, t, language }) => {
  return (
    <div className="mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700">{t.historySuggestionsTitle}</h2>
      <p className="text-sm text-gray-500 mb-4">{t.historySuggestionsSubtitle}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onAddItem(item.name[language])}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-3 rounded-full transition-colors duration-200"
            title={`Añadir ${item.name[language]} a la lista`}
          >
            <span className="text-lg mr-2">{item.icon}</span>
            <span>{item.name[language]}</span>
            <div className="ml-2 text-gray-400">
                <PlusIcon className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};