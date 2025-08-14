
import type { User, GroceryItem, Supermarket } from './types';

export const USERS: User[] = ['Andrea', 'Rocío'];

export const SUPERMARKETS: Supermarket[] = ['Mercadona', 'Carrefour', 'Cash', 'Aldi', 'Lidl'];

export const INITIAL_GROCERY_LIST: GroceryItem[] = [
  {
    id: 1,
    name: 'Aguacate',
    category: 'Frutas',
    icon: '🥑',
    purchased: false,
    addedBy: 'Andrea',
    prices: { Mercadona: null, Carrefour: null, Cash: null, Aldi: null, Lidl: null },
  },
  {
    id: 2,
    name: 'Leche',
    category: 'Lácteos y Huevos',
    icon: '🥛',
    purchased: true,
    addedBy: 'Rocío',
    prices: { Mercadona: 0.90, Carrefour: 0.88, Cash: null, Aldi: null, Lidl: null },
  },
  {
    id: 3,
    name: 'Pan de masa madre',
    category: 'Panadería',
    icon: '🍞',
    purchased: false,
    addedBy: 'Rocío',
    prices: { Mercadona: 2.50, Carrefour: null, Cash: null, Aldi: null, Lidl: null },
  },
];