
export type User = 'Andrea' | 'Rocío';
export type Supermarket = 'Mercadona' | 'Carrefour' | 'Cash' | 'Aldi' | 'Lidl';
export type Language = 'es' | 'it';

export interface Multilingual {
  es: string;
  it: string;
}

export interface GroceryItem {
  id: string;
  name: Multilingual;
  category: Multilingual;
  icon: string; // Emoji
  purchased: boolean;
  addedBy: User;
  quantity: number;
  prices: Record<Supermarket, number | null>;
}

// This is the type for the items in the QUICK_ADD_ITEMS constant array
export interface QuickAddConstant {
  name: Multilingual;
  icon: string;
  category: Multilingual;
}
