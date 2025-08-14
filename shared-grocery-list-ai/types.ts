
export type User = 'Andrea' | 'Rocío';
export type Supermarket = 'Mercadona' | 'Carrefour' | 'Cash' | 'Aldi' | 'Lidl';

export interface GroceryItem {
  id: number;
  name: string;
  category: string;
  icon: string; // Emoji
  purchased: boolean;
  addedBy: User;
  prices: Record<Supermarket, number | null>;
}