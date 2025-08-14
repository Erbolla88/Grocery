
import React from 'react';
import type { GroceryItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface FavoritesProps {
  items: GroceryItem[];
  onAddItem: (itemName: string) => Promise<void>;
}

export const Favorites: React.FC<FavoritesProps> = ({ items, onAddItem }) => {
  return (
    <div className="mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700">Sugerencias del Historial</h2>
      <p className="text-sm text-gray-500 mb-4">Añade rápidamente artículos que has comprado antes.</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onAddItem(item.name)}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-3 rounded-full transition-colors duration-200"
            title={`Añadir ${item.name} a la lista`}
          >
            <span className="text-lg mr-2">{item.icon}</span>
            <span>{item.name}</span>
            <div className="ml-2 text-gray-400">
                <PlusIcon />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
