
import type { User, Supermarket, QuickAddConstant } from './types';

export const USERS: User[] = ['Andrea', 'Rocío'];

export const SUPERMARKETS: Supermarket[] = ['Mercadona', 'Carrefour', 'Cash', 'Aldi', 'Lidl'];

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'Frutas': 'Frutta',
  'Verduras': 'Verdura',
  'Carne y Pescado': 'Carne e Pesce',
  'Lácteos y Huevos': 'Latticini e Uova',
  'Panadería': 'Panetteria',
  'Despensa': 'Dispensa',
  'Congelados': 'Surgelati',
  'Bebidas': 'Bevande',
  'Aperitivos': 'Snack',
  'Hogar': 'Casa',
  'Cuidado Personal': 'Cura Personale',
  'Otros': 'Altro',
  'Sin categoría': 'Senza categoria',
};


export const QUICK_ADD_ITEMS: QuickAddConstant[] = [
  { name: { es: 'Leche', it: 'Latte' }, icon: '🥛', category: { es: 'Lácteos y Huevos', it: 'Latticini e Uova' } },
  { name: { es: 'Agua', it: 'Acqua' }, icon: '💧', category: { es: 'Bebidas', it: 'Bevande' } },
  { name: { es: 'Plátanos', it: 'Banane' }, icon: '🍌', category: { es: 'Frutas', it: 'Frutta' } },
  { name: { es: 'Pan', it: 'Pane' }, icon: '🍞', category: { es: 'Panadería', it: 'Panetteria' } },
  { name: { es: 'Hielo', it: 'Ghiaccio' }, icon: '🧊', category: { es: 'Congelados', it: 'Surgelati' } },
  { name: { es: 'Pescado', it: 'Pesce' }, icon: '🐟', category: { es: 'Carne y Pescado', it: 'Carne e Pesce' } },
  { name: { es: 'Carne', it: 'Carne' }, icon: '🥩', category: { es: 'Carne y Pescado', it: 'Carne e Pesce' } },
  { name: { es: 'Queso', it: 'Formaggio' }, icon: '🧀', category: { es: 'Lácteos y Huevos', it: 'Latticini e Uova' } },
  { name: { es: 'Pasta', it: 'Pasta' }, icon: '🍝', category: { es: 'Despensa', it: 'Dispensa' } },
  { name: { es: 'Arroz', it: 'Riso' }, icon: '🍚', category: { es: 'Despensa', it: 'Dispensa' } },
  { name: { es: 'Verduras', it: 'Verdure' }, icon: '🥦', category: { es: 'Verduras', it: 'Verdura' } },
  { name: { es: 'Huevos', it: 'Uova' }, icon: '🥚', category: { es: 'Lácteos y Huevos', it: 'Latticini e Uova' } }
];
