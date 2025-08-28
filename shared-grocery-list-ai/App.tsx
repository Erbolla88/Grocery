import React, { useState, useMemo, useEffect } from 'react';
import { AddItemForm } from './components/AddItemForm';
import { GroceryList } from './components/GroceryList';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Favorites } from './components/Favorites';
import { USERS, SUPERMARKETS, CATEGORY_TRANSLATIONS } from './constants';
import { categorizeAndIconifyItem } from './services/geminiService';
import type { User, GroceryItem, Supermarket, Language, QuickAddConstant, Multilingual } from './types';
import { database, auth } from './firebaseConfig';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { ref, onValue, push, update, remove, child } from 'firebase/database';
import { QuickAddItem } from './components/QuickAddItem';
import { translations } from './translations';
import { Spinner } from './components/Spinner';

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

const loadFromStorage = <T,>(key: string, fallback: T): T => {
    if (!IS_STORAGE_AVAILABLE) return fallback;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        return fallback;
    }
};

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const currentUser = useMemo<User | null>(() => {
    if (authUser?.displayName && USERS.includes(authUser.displayName as User)) {
      return authUser.displayName as User;
    }
    return null;
  }, [authUser]);

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!IS_STORAGE_AVAILABLE) return;
    try {
        localStorage.setItem('groceryAppLanguage', JSON.stringify(language));
    } catch (error) {
        console.error("Failed to save language to localStorage", error);
    }
  }, [language]);
  
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
    if (!authUser) {
      setGroceryList([]);
      setHistory([]);
      return;
    };

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
  }, [authUser]);

  const handleAddItem = async (itemName: string) => {
    if (!currentUser) return;
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
    if (!currentUser) return;
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
            setError(t.clearError);
        });
    }
  };

  const handleUpdatePrice = (id: string, supermarket: Supermarket, price: number | null) => {
    const itemPriceRef = ref(database, `items/${id}/prices`);
    update(itemPriceRef, { [supermarket]: price });
  };
  
  const handleSignOut = () => {
    signOut(auth).catch(error => console.error("Sign out error", error));
  };

  const groupedItems = useMemo(() => {
    return groceryList.reduce((acc, item) => {
      const category = item.category[language] || t.uncategorized;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  }, [groceryList, language, t.uncategorized]);


  if (isAuthLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  if (!authUser) {
    return <Login t={t} />;
  }
  
  if (!currentUser) {
    // This can happen briefly if displayName is not set yet, or if it's invalid.
    // We could show a specific message or a loader.
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center p-4">
          <div>
            <p className="text-gray-700 mb-4">Error: Perfil de usuario no válido. Por favor, cierra sesión y vuelve a registrarte eligiendo un perfil.</p>
            <button onClick={handleSignOut} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                Cerrar sesión
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 font-sans">
      <Header 
        t={t} 
        language={language}
        setLanguage={setLanguage}
        userDisplayName={authUser.displayName} 
        onSignOut={handleSignOut}
      />
      
      <main className="mt-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <AddItemForm onAddItem={handleAddItem} isLoading={isLoading} t={t} />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <QuickAddItem onAddItem={handleQuickAddItem} isLoading={isLoading} t={t} language={language} />

        <Favorites items={history} onAddItem={handleAddItem} t={t} language={language} />

        <div className="mt-8">
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
        </div>
        
        {groceryList.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleClearPurchased}
                    className="w-full sm:w-auto text-center font-semibold py-2 px-5 rounded-lg transition-all duration-200 bg-green-100 text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                    {t.clearPurchased}
                </button>
                <button
                    onClick={handleEmptyList}
                    className="w-full sm:w-auto text-center font-semibold py-2 px-5 rounded-lg transition-all duration-200 bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    {t.emptyListButton}
                </button>
            </div>
        )}
      </main>
      
      <footer className="text-center mt-12 mb-4">
        <p className="text-gray-500 text-sm">{t.poweredByAI}</p>
      </footer>
    </div>
  );
};

export default App;