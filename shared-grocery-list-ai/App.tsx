
import React, { useState, useMemo, useEffect } from 'react';
import { AddItemForm } from './components/AddItemForm';
import { GroceryList } from './components/GroceryList';
import { Header } from './components/Header';
import { UserSelector } from './components/UserSelector';
import { Favorites } from './components/Favorites';
import { USERS, INITIAL_GROCERY_LIST, SUPERMARKETS } from './constants';
import { categorizeAndIconifyItem } from './services/geminiService';
import type { User, GroceryItem, Supermarket } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>(INITIAL_GROCERY_LIST);
  const [history, setHistory] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Populate history with already purchased items on initial load
    const purchasedInitially = INITIAL_GROCERY_LIST.filter(item => item.purchased);
    setHistory(purchasedInitially);
  }, []);

  const handleAddItem = async (itemName: string) => {
    if (!itemName.trim()) return;
    
    // Prevent adding duplicates
    if (groceryList.some(item => item.name.toLowerCase() === itemName.trim().toLowerCase())) {
        setError('Este artículo ya está en la lista.');
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { category, emoji } = await categorizeAndIconifyItem(itemName);
      const newItem: GroceryItem = {
        id: Date.now(),
        name: itemName,
        category: category,
        icon: emoji,
        purchased: false,
        addedBy: currentUser,
        prices: SUPERMARKETS.reduce((acc, market) => {
            acc[market] = null;
            return acc;
        }, {} as Record<Supermarket, number | null>)
      };
      setGroceryList(prevList => [newItem, ...prevList]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePurchased = (id: number) => {
    setGroceryList(list =>
      list.map(item =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };
  
  const handleRemoveItem = (id: number) => {
    setGroceryList(list => list.filter(item => item.id !== id));
  };
  
  const handleClearPurchased = () => {
    const purchasedItems = groceryList.filter(item => item.purchased);
    // Add to history, avoiding duplicates by name
    setHistory(prevHistory => {
        const newHistoryItems = purchasedItems.filter(pItem => 
            !prevHistory.some(hItem => hItem.name.toLowerCase() === pItem.name.toLowerCase())
        );
        return [...prevHistory, ...newHistoryItems];
    });

    setGroceryList(list => list.filter(item => !item.purchased));
  };

  const handleUpdatePrice = (id: number, supermarket: Supermarket, price: number | null) => {
    setGroceryList(list => 
      list.map(item => {
        if (item.id === id) {
          const newPrices = { ...item.prices, [supermarket]: price };
          return { ...item, prices: newPrices };
        }
        return item;
      })
    );
  };

  const groupedItems = useMemo(() => {
    return groceryList.reduce((acc, item) => {
      const category = item.category || 'Sin categoría';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  }, [groceryList]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto max-w-4xl p-4">
        <Header />
        <div className="mt-6">
          <UserSelector
            users={USERS}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        </div>
        <div className="mt-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <AddItemForm onAddItem={handleAddItem} isLoading={isLoading} />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {history.length > 0 && (
            <Favorites items={history} onAddItem={handleAddItem} />
        )}

        <main className="mt-8">
           <GroceryList 
              groupedItems={groupedItems} 
              onTogglePurchased={handleTogglePurchased}
              onRemoveItem={handleRemoveItem}
              onUpdatePrice={handleUpdatePrice}
              supermarkets={SUPERMARKETS}
            />
        </main>

        {groceryList.some(item => item.purchased) && (
            <div className="mt-8 text-center">
                <button 
                    onClick={handleClearPurchased}
                    className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Limpiar Artículos Comprados
                </button>
            </div>
        )}

         <footer className="text-center mt-12 pb-4">
            <p className="text-sm text-gray-400">Potenciado por IA ✨</p>
         </footer>
      </div>
    </div>
  );
};

export default App;
