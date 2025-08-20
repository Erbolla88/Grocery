
import React, { useState, useMemo, useEffect } from 'react';
import { AddItemForm } from './components/AddItemForm';
import { GroceryList } from './components/GroceryList';
import { Header } from './components/Header';
import { UserSelector } from './components/UserSelector';
import { Favorites } from './components/Favorites';
import { USERS, SUPERMARKETS, CATEGORY_TRANSLATIONS } from './constants';
import { categorizeAndIconifyItem } from './services/geminiService';
import type { User, GroceryItem, Supermarket, Language, QuickAddConstant, Multilingual } from './types';
import { database } from './firebaseConfig';
import { ref, onValue, push, update, remove, child } from 'firebase/database';
import { QuickAddItem } from './components/QuickAddItem';
import { translations } from './translations';


// Utility to check if localStorage is available and accessible.
const checkLocalStorage = (): boolean => {
    try {
        const testKey = '__test_storage__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.warn("localStorage is not available. User preference will not be persisted.");
        return false;
    }
};

const IS_STORAGE_AVAILABLE = checkLocalStorage();

// Helper to safely load and parse from localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
    if (!IS_STORAGE_AVAILABLE) {
        return fallback;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        return fallback;
    }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(() =>
    loadFromStorage<User>('groceryAppUser', USERS[0])
  );
  const [language, setLanguage] = useState<Language>(() => 
    loadFromStorage<Language>('groceryAppLanguage', 'es')
  );

  const t = useMemo(() => {
    return Object.keys(translations).reduce((acc, key) => {
        acc[key] = translations[key][language];
        return acc;
    }, {} as Record<string, string>);
  }, [language]);

  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [history, setHistory] = useState<GroceryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!IS_STORAGE_AVAILABLE) return;
    try {
      localStorage.setItem('groceryAppUser', JSON.stringify(currentUser));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!IS_STORAGE_AVAILABLE) return;
    try {
        localStorage.setItem('groceryAppLanguage', JSON.stringify(language));
    } catch (error) {
        console.error("Failed to save language to localStorage", error);
    }
  }, [language]);
  
  // Helper function for backward compatibility
  const ensureMultilingual = (itemData: any): { name: Multilingual, category: Multilingual } => {
    let name: Multilingual;
    let category: Multilingual;
    
    if (typeof itemData.name === 'string') {
        name = { es: itemData.name, it: itemData.name };
    } else {
        name = itemData.name;
    }

    if (typeof itemData.category === 'string') {
        const categoryEs = itemData.category;
        const categoryIt = CATEGORY_TRANSLATIONS[categoryEs] || categoryEs;
        category = { es: categoryEs, it: categoryIt };
    } else {
        category = itemData.category;
    }

    return { name, category };
  };

  useEffect(() => {
    const itemsRef = ref(database, 'items');
    const historyRef = ref(database, 'history');

    const unsubscribeItems = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const itemKeys = Object.keys(data).sort().reverse(); 
        const loadedList: GroceryItem[] = itemKeys.map(key => {
            const itemData = data[key];
            
            const { name, category } = ensureMultilingual(itemData);
            itemData.name = name;
            itemData.category = category;

            if (!itemData.prices || typeof itemData.prices !== 'object') {
                itemData.prices = SUPERMARKETS.reduce((acc, market) => {
                    acc[market] = null;
                    return acc;
                }, {} as Record<Supermarket, number | null>);
            }
            if (typeof itemData.quantity !== 'number' || itemData.quantity < 1) {
                itemData.quantity = 1;
            }
            return { id: key, ...itemData };
        });
        setGroceryList(loadedList);
    });

    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
        const data = snapshot.val() || {};
        const historyKeys = Object.keys(data).sort().reverse(); 
        const loadedHistory = historyKeys.map(key => {
            const itemData = data[key];
            const { name, category } = ensureMultilingual(itemData);
            itemData.name = name;
            itemData.category = category;
            return { id: key, ...itemData };
        });
        setHistory(loadedHistory);
    });

    return () => {
        unsubscribeItems();
        unsubscribeHistory();
    };
  }, []);

  const handleAddItem = async (itemName: string) => {
    const trimmedItemName = itemName.trim().toLowerCase();
    if (!trimmedItemName) return;
    
    const existingItem = groceryList.find(item => 
        item.name.es.toLowerCase() === trimmedItemName || 
        item.name.it.toLowerCase() === trimmedItemName
    );

    if (existingItem) {
        const itemRef = ref(database, `items/${existingItem.id}`);
        update(itemRef, { quantity: existingItem.quantity + 1 });
    } else {
        setIsLoading(true);
        setError(null);
        try {
          const { name, category, emoji } = await categorizeAndIconifyItem(itemName, language);
          const newItemData = {
            name: name,
            category: category,
            icon: emoji,
            purchased: false,
            addedBy: currentUser,
            quantity: 1,
            prices: SUPERMARKETS.reduce((acc, market) => {
                acc[market] = null;
                return acc;
            }, {} as Record<Supermarket, number | null>)
          };
          
          const itemsRef = ref(database, 'items');
          await push(itemsRef, newItemData);
        } catch (err) {
          setError(err instanceof Error ? err.message : t.unknownError);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
    }
  };

  const handleQuickAddItem = async (item: QuickAddConstant, quantity: number) => {
    const existingItem = groceryList.find(i => i.name.es.toLowerCase() === item.name.es.toLowerCase());

    if (existingItem) {
        const itemRef = ref(database, `items/${existingItem.id}`);
        update(itemRef, { quantity: existingItem.quantity + quantity });
    } else {
        setIsLoading(true);
        setError(null);
        try {
            const newItemData = {
                name: item.name,
                category: item.category,
                icon: item.icon,
                purchased: false,
                addedBy: currentUser,
                quantity: quantity,
                prices: SUPERMARKETS.reduce((acc, market) => {
                    acc[market] = null;
                    return acc;
                }, {} as Record<Supermarket, number | null>)
            };
            
            const itemsRef = ref(database, 'items');
            await push(itemsRef, newItemData);
        } catch (err) {
            setError(err instanceof Error ? err.message : t.unknownError);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
        handleRemoveItem(id);
    } else {
        const itemRef = ref(database, `items/${id}`);
        update(itemRef, { quantity: newQuantity });
    }
  };

  const handleTogglePurchased = (id: string) => {
    const item = groceryList.find(i => i.id === id);
    if (item) {
      const itemRef = ref(database, `items/${id}`);
      update(itemRef, { purchased: !item.purchased });
    }
  };
  
  const handleRemoveItem = (id: string) => {
    const itemRef = ref(database, `items/${id}`);
    remove(itemRef);
  };
  
  const handleClearPurchased = () => {
    const purchasedItems = groceryList.filter(item => item.purchased);
    if (purchasedItems.length === 0) return;

    const updates: { [path: string]: any } = {};
    const historyNames = new Set(history.map(item => item.name.es.toLowerCase()));

    purchasedItems.forEach(item => {
        updates[`/items/${item.id}`] = null;
        if (!historyNames.has(item.name.es.toLowerCase())) {
            const newHistoryKey = push(child(ref(database), 'history')).key;
            if (newHistoryKey) {
                const { id, ...historyData } = item;
                updates[`/history/${newHistoryKey}`] = historyData;
            }
        }
    });

    if (Object.keys(updates).length > 0) {
        update(ref(database), updates).catch(err => {
            console.error("Failed to clear purchased items:", err);
            setError(t.clearError);
        });
    }
  };

  const handleEmptyList = () => {
    if (window.confirm(t.emptyListConfirm)) {
        const itemsRef = ref(database, 'items');
        remove(itemsRef).catch(err => {
            console.error("Failed to empty list:", err);
            setError(t.clearError); // Reusing the same error message
        });
    }
  };

  const handleUpdatePrice = (id: string, supermarket: Supermarket, price: number | null) => {
    const itemPriceRef = ref(database, `items/${id}/prices`);
    update(itemPriceRef, { [supermarket]: price });
  };

  const groupedItems = useMemo(() => {
    return groceryList.reduce((acc, item) => {
      const category = item.category?.[language] || t.uncategorized;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  }, [groceryList, language, t.uncategorized]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto max-w-4xl p-4">
        <Header t={t} language={language} setLanguage={setLanguage}/>
        <div className="mt-6">
          <UserSelector
            users={USERS}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            t={t}
          />
        </div>
        <div className="mt-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <AddItemForm onAddItem={handleAddItem} isLoading={isLoading} t={t} />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <QuickAddItem onAddItem={handleQuickAddItem} isLoading={isLoading} t={t} language={language} />

        {history.length > 0 && (
            <Favorites items={history} onAddItem={handleAddItem} t={t} language={language} />
        )}

        <main className="mt-8">
           <GroceryList 
              groupedItems={groupedItems} 
              onTogglePurchased={handleTogglePurchased}
              onRemoveItem={handleRemoveItem}
              onUpdatePrice={handleUpdatePrice}
              onUpdateQuantity={handleUpdateQuantity}
              supermarkets={SUPERMARKETS}
              t={t}
              language={language}
            />
        </main>

        <div className="mt-8 flex justify-center items-center space-x-4">
            {groceryList.some(item => item.purchased) && (
                <button 
                    onClick={handleClearPurchased}
                    className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    {t.clearPurchased}
                </button>
            )}
            {groceryList.length > 0 && (
                <button
                    onClick={handleEmptyList}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    {t.emptyListButton}
                </button>
            )}
        </div>

         <footer className="text-center mt-12 pb-4">
            <p className="text-sm text-gray-400">{t.poweredByAI}</p>
         </footer>
      </div>
    </div>
  );
};

export default App;
