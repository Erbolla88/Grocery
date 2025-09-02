
import React from 'react';
import { GroceryItemComponent } from './GroceryItemComponent';
import type { GroceryItem, Supermarket, Language } from '../types';

interface GroceryListProps {
  groupedItems: Record<string, GroceryItem[]>;
  onTogglePurchased: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdatePrice: (id: string, supermarket: Supermarket, price: number | null) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  supermarkets: Supermarket[];
  t: Record<string, string>;
  language: Language;
}

export const GroceryList: React.FC<GroceryListProps> = ({ groupedItems, onTogglePurchased, onRemoveItem, onUpdatePrice, onUpdateQuantity, supermarkets, t, language }) => {
  const categories = Object.keys(groupedItems).sort();

  if (categories.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500">{t.emptyList}</p>
        <p className="text-sm text-gray-400 mt-2">{t.emptyListSubtitle}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category}>
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">
            {category}
          </h2>
          <ul className="space-y-3">
            {groupedItems[category].map(item => (
              <GroceryItemComponent
                key={item.id}
                item={item}
                onTogglePurchased={onTogglePurchased}
                onRemoveItem={onRemoveItem}
                onUpdatePrice={onUpdatePrice}
                onUpdateQuantity={onUpdateQuantity}
                supermarkets={supermarkets}
                t={t}
                language={language}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
