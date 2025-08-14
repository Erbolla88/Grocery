
import React from 'react';
import { GroceryItemComponent } from './GroceryItemComponent';
import type { GroceryItem, Supermarket } from '../types';

interface GroceryListProps {
  groupedItems: Record<string, GroceryItem[]>;
  onTogglePurchased: (id: number) => void;
  onRemoveItem: (id: number) => void;
  onUpdatePrice: (id: number, supermarket: Supermarket, price: number | null) => void;
  supermarkets: Supermarket[];
}

export const GroceryList: React.FC<GroceryListProps> = ({ groupedItems, onTogglePurchased, onRemoveItem, onUpdatePrice, supermarkets }) => {
  const categories = Object.keys(groupedItems).sort();

  if (categories.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500">Tu lista de la compra está vacía.</p>
        <p className="text-sm text-gray-400 mt-2">¡Añade un artículo para empezar!</p>
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
                supermarkets={supermarkets}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
