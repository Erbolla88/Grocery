
import React, { useState } from 'react';
import { QUICK_ADD_ITEMS } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import type { QuickAddConstant, Language } from '../types';

interface QuickAddItemProps {
  onAddItem: (item: QuickAddConstant, quantity: number) => void;
  isLoading: boolean;
  t: Record<string, string>;
  language: Language;
}

export const QuickAddItem: React.FC<QuickAddItemProps> = ({ onAddItem, isLoading, t, language }) => {
  const [selectedItem, setSelectedItem] = useState<QuickAddConstant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const handleSelect = (item: QuickAddConstant) => {
    if (isLoading) return;
    if (selectedItem?.name.es === item.name.es) { // Use a stable key like .es for comparison
      setSelectedItem(null); 
    } else {
      setSelectedItem(item);
      setQuantity(1);
    }
  };

  const handleAdd = () => {
    if (selectedItem) {
      onAddItem(selectedItem, quantity);
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  return (
    <div className="mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700">{t.addCommonsTitle}</h2>
      <p className="text-sm text-gray-500 mb-4">{t.addCommonsSubtitle}</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 text-center">
        {QUICK_ADD_ITEMS.map((item) => (
          <div key={item.name.es}>
            <button
              onClick={() => handleSelect(item)}
              className={`w-full p-2 rounded-lg transition-all duration-200 border-2 flex flex-col items-center justify-start ${
                selectedItem?.name.es === item.name.es
                  ? 'bg-blue-100 border-blue-400'
                  : 'bg-gray-100 hover:bg-gray-200 border-transparent'
              } ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
              aria-label={`Seleccionar ${item.name[language]}`}
              disabled={isLoading}
            >
              <span className="text-4xl h-10 flex items-center justify-center" role="img" aria-label={item.name[language]}>{item.icon}</span>
              <span className="block text-xs font-medium text-gray-700 mt-1 truncate">{item.name[language]}</span>
            </button>
            {selectedItem?.name.es === item.name.es && (
              <div className="mt-2 flex items-center justify-center space-x-2">
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-16 border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Cantidad"
                >
                  {[...Array(10).keys()].map(n => (
                    <option key={n + 1} value={n + 1}>{n + 1}</option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md flex items-center justify-center transition-colors duration-200 disabled:bg-blue-300"
                  aria-label={`Añadir ${quantity} de ${item.name[language]}`}
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
