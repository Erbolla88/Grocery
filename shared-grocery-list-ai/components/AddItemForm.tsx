
import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { Spinner } from './Spinner';

interface AddItemFormProps {
  onAddItem: (itemName: string) => Promise<void>;
  isLoading: boolean;
  t: Record<string, string>;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, isLoading, t }) => {
  const [itemName, setItemName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      onAddItem(itemName);
      setItemName('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="item-name" className="text-lg font-semibold text-gray-700">{t.addItemLabel}</label>
      <div className="mt-2 flex items-center space-x-2">
        <input
          id="item-name"
          type="text"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          placeholder={t.addItemPlaceholder}
          className="flex-grow block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
          disabled={isLoading}
          aria-label={t.addItemAriaLabel}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={isLoading || !itemName.trim()}
          aria-label={t.addItemAriaLabel}
        >
          {isLoading ? <Spinner /> : <PlusIcon />}
        </button>
      </div>
    </form>
  );
};
