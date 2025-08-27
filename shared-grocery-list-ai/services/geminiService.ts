import type { Language, Multilingual } from '../types';

export const categorizeAndIconifyItem = async (itemName: string, lang: Language): Promise<{ name: Multilingual; category: Multilingual; emoji: string }> => {
  try {
    const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemName, lang }),
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { error: `Request failed with status ${response.status}` };
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const jsonData = await response.json();

    if (jsonData.name_es && jsonData.name_it && jsonData.category_es && jsonData.category_it && jsonData.emoji) {
        return {
            name: { es: jsonData.name_es, it: jsonData.name_it },
            category: { es: jsonData.category_es, it: jsonData.category_it },
            emoji: jsonData.emoji || '🛒'
        };
    } else {
        console.error('Invalid response format from server:', jsonData);
        throw new Error('La respuesta del servidor no tiene el formato esperado.');
    }

  } catch (error) {
    console.error("Error calling categorization API:", error);
    const fallbackCategory = { es: 'Otros', it: 'Altro' };
    return { name: { es: itemName, it: itemName }, category: fallbackCategory, emoji: '🛒' };
  }
};
