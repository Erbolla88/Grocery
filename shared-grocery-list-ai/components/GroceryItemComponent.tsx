import React, { useState, ChangeEvent } from 'react';
import type { GroceryItem, Supermarket } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface GroceryItemProps {
  item: GroceryItem;
  onTogglePurchased: (id: number) => void;
  onRemoveItem: (id: number) => void;
  onUpdatePrice: (id: number, supermarket: Supermarket, price: number | null) => void;
  supermarkets: Supermarket[];
}

export const GroceryItemComponent: React.FC<GroceryItemProps> = ({ item, onTogglePurchased, onRemoveItem, onUpdatePrice, supermarkets }) => {
  
  // The state was inferred as Record<Supermarket, number | null>, but the input's onChange provides a string.
  // Explicitly typing the state to include string will fix the comparison error.
  const [prices, setPrices] = useState<Record<Supermarket, string | number | null>>(item.prices);

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>, supermarket: Supermarket) => {
    setPrices({ ...prices, [supermarket]: e.target.value });
  };

  const handlePriceBlur = (supermarket: Supermarket) => {
      const value = prices[supermarket];
      
      // The original logic had a bug where a null price would become 0 on blur because Number(null) is 0.
      // This revised logic correctly handles null, empty strings, and invalid numbers by parsing them to null.
      let newPrice: number | null;
      if (value === null || value === '') {
        newPrice = null;
      } else {
        const parsed = Number(value);
        newPrice = isNaN(parsed) ? null : parsed;
      }

      // Only update if the value has actually changed to prevent unnecessary re-renders.
      if (newPrice !== item.prices[supermarket]) {
        onUpdatePrice(item.id, supermarket, newPrice);
      }
  };

  const userColorClasses = {
    Andrea: 'bg-rose-100 text-rose-700',
    Rocío: 'bg-sky-100 text-sky-700',
  };
    
  return (
    <li className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md gap-4">
      {/* Item Info */}
      <div className="flex items-center flex-grow cursor-pointer w-full" onClick={() => onTogglePurchased(item.id)}>
          <span className="text-2xl mr-4">{item.icon}</span>
          <div className="flex-grow">
            <span
              className={`text-lg text-gray-800 transition-all duration-300 ${
                item.purchased ? 'line-through text-gray-400' : ''
              }`}
            >
              {item.name}
            </span>
            <div className="flex items-center mt-1">
                 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${userColorClasses[item.addedBy]}`}>
                    Añadido por {item.addedBy}
                 </span>
            </div>
          </div>
      </div>
      
      {/* Prices and Actions */}
      <div className="flex items-center space-x-4 ml-auto w-full sm:w-auto justify-between">
         {/* Price Inputs */}
        <div className="flex items-center space-x-2">
            {supermarkets.map(market => (
                <div key={market}>
                    <label htmlFor={`price-${item.id}-${market}`} className="block text-xs font-medium text-gray-500">{market}</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-sm text-gray-500">€</span>
                        <input
                            id={`price-${item.id}-${market}`}
                            type="number"
                            step="0.01"
                            value={prices[market] ?? ''}
                            onChange={(e) => handlePriceChange(e, market)}
                            onBlur={() => handlePriceBlur(market)}
                            onClick={(e) => e.stopPropagation()} // Prevent toggling purchase status
                            className="w-20 pl-5 pr-2 py-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            ))}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
            <input
                type="checkbox"
                checked={item.purchased}
                onChange={() => onTogglePurchased(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                aria-label={`Marcar ${item.name} como comprado`}
            />
            <button 
                onClick={() => onRemoveItem(item.id)} 
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label={`Eliminar ${item.name}`}
            >
                <TrashIcon />
            </button>
        </div>
       </div>
    </li>
  );
};