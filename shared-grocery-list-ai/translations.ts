import type { Language } from './types';

type TranslationStrings = {
  [key: string]: Record<Language, string>;
};

export const translations: TranslationStrings = {
  // Header
  appTitle: { es: 'Lista de la Compra', it: 'Lista della Spesa' },
  appSubtitle: { es: 'Nuestra lista compartida, con la ayuda de IA', it: 'La nostra lista condivisa, con l\'aiuto dell\'IA' },
  loggedInAs: { es: 'Sesión iniciada como', it: 'Accesso come' },
  signOut: { es: 'Cerrar sesión', it: 'Esci' },

  // Auth Screen
  loginTitle: { es: 'Iniciar Sesión', it: 'Accedi' },
  signupTitle: { es: 'Crear Cuenta', it: 'Crea Account' },
  emailLabel: { es: 'Correo electrónico', it: 'Email' },
  passwordLabel: { es: 'Contraseña', it: 'Password' },
  confirmPasswordLabel: { es: 'Confirmar contraseña', it: 'Conferma Password' },
  chooseProfileLabel: { es: 'Elige tu perfil', it: 'Scegli il tuo profilo' },
  loginButton: { es: 'Iniciar Sesión', it: 'Accedi' },
  signupButton: { es: 'Crear Cuenta', it: 'Crea Account' },
  switchToSignup: { es: '¿No tienes cuenta? Regístrate', it: 'Non hai un account? Registrati' },
  switchToLogin: { es: '¿Ya tienes cuenta? Inicia sesión', it: 'Hai già un account? Accedi' },

  // User Selector (Legacy - kept for reference if needed, but component is removed)
  shoppingAs: { es: 'Comprando como:', it: 'Acquistando come:' },
  
  // Add Item Form
  addItemLabel: { es: 'Añadir artículo', it: 'Aggiungi articolo' },
  addItemPlaceholder: { es: 'ej: tomates, papel de cocina...', it: 'es: pomodori, carta da cucina...' },
  addItemAriaLabel: { es: 'Añadir artículo', it: 'Aggiungi articolo' },

  // Quick Add
  addCommonsTitle: { es: 'Añadir Comunes', it: 'Aggiungi Comuni' },
  addCommonsSubtitle: { es: 'Selecciona un artículo para añadirlo rápidamente.', it: 'Seleziona un articolo per aggiungerlo rapidamente.' },

  // History / Favorites
  historySuggestionsTitle: { es: 'Sugerencias del Historial', it: 'Suggerimenti dalla Cronologia' },
  historySuggestionsSubtitle: { es: 'Añade rápidamente artículos que has comprado antes.', it: 'Aggiungi rapidamente articoli che hai già acquistato.' },
  
  // Grocery List
  emptyList: { es: 'Tu lista de la compra está vacía.', it: 'La tua lista della spesa è vuota.' },
  emptyListSubtitle: { es: '¡Añade un artículo para empezar!', it: 'Aggiungi un articolo per iniziare!' },
  uncategorized: { es: 'Sin categoría', it: 'Senza categoria' },
  
  // Grocery Item
  addedBy: { es: 'Añadido por', it: 'Aggiunto da' },
  reduceQuantityAria: { es: 'Reducir cantidad de', it: 'Riduci quantità di' },
  increaseQuantityAria: { es: 'Aumentar cantidad de', it: 'Aumenta quantità di' },
  markAsPurchasedAria: { es: 'Marcar como comprado', it: 'Segna come acquistato' },
  removeItemAria: { es: 'Eliminar', it: 'Rimuovi' },

  // Buttons & Footer
  clearPurchased: { es: 'Limpiar Artículos Comprados', it: 'Pulisci Articoli Acquistati' },
  emptyListButton: { es: 'Vaciar Lista', it: 'Svuota Lista' },
  emptyListConfirm: { es: '¿Estás seguro de que quieres vaciar toda la lista?', it: 'Sei sicuro di voler svuotare l\'intera lista?' },
  poweredByAI: { es: 'Potenciado por IA ✨', it: 'Potenziato dall\'IA ✨' },
  
  // Error messages
  unknownError: { es: 'Ocurrió un error desconocido.', it: 'Si è verificato un errore sconosciuto.' },
  clearError: { es: 'Error al limpiar los artículos.', it: 'Errore durante la pulizia degli articoli.' },
};