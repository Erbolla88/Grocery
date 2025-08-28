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
      const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
      throw new Error(errorData.error);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling categorization API:", error);
    // Fallback in case the API call fails
    const fallbackCategory = { es: 'Otros', it: 'Altro' };
    return { name: { es: itemName, it: itemName }, category: fallbackCategory, emoji: '🛒' };
  }
};
