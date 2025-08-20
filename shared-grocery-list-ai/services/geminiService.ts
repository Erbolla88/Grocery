import { GoogleGenAI, Type } from "@google/genai";
import type { Language, Multilingual } from '../types';
import { firebaseConfig } from "../firebaseConfig";

const apiKey = firebaseConfig.apiKey;
if (!apiKey) {
    throw new Error("API key not found in firebaseConfig.ts. Please ensure it is set.");
}

const ai = new GoogleGenAI({ apiKey });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name_es: { type: Type.STRING, description: "The name of the item in Spanish, singular form." },
    name_it: { type: Type.STRING, description: "The name of the item in Italian, singular form." },
    category_es: { type: Type.STRING, description: "A suitable category for the grocery item, in Spanish." },
    category_it: { type: Type.STRING, description: "A suitable category for the grocery item, in Italian." },
    emoji: { type: Type.STRING, description: "A single relevant emoji representing the grocery item." },
  },
  required: ["name_es", "name_it", "category_es", "category_it", "emoji"],
};

const SYSTEM_INSTRUCTIONS: Record<Language, string> = {
  es: `Eres un asistente de listas de la compra. Para el artículo proporcionado, indica su nombre en singular en español e italiano, la categoría más apropiada en español e italiano, y un único icono emoji.
Las categorías en español deben ser una de: Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros.
Las categorías en italiano deben ser la traducción correspondiente: Frutta, Verdura, Carne e Pesce, Latticini e Uova, Panetteria, Dispensa, Surgelati, Bevande, Snack, Casa, Cura Personale, Altro.`,
  it: `Sei un assistente per la lista della spesa. Per l'articolo fornito, indica il suo nome al singolare in spagnolo e italiano, la categoria più approprata in spagnolo e italiano, e una singola icona emoji.
Le categorie in italiano devono essere una delle seguenti: Frutta, Verdura, Carne e Pesce, Latticini e Uova, Panetteria, Dispensa, Surgelati, Bevande, Snack, Casa, Cura Personale, Altro.
Le categorie in spagnolo devono essere la traduzione corrispondente: Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros.`
};


export const categorizeAndIconifyItem = async (itemName: string, lang: Language): Promise<{ name: Multilingual; category: Multilingual; emoji: string }> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Clasifica este artículo: ${itemName}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS[lang],
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
    });

    const textData = response.text;
    if (!textData) {
        throw new Error("La API no devolvió contenido.");
    }
    
    const jsonData = JSON.parse(textData);

    if (jsonData.name_es && jsonData.name_it && jsonData.category_es && jsonData.category_it && jsonData.emoji) {
        return {
            name: { es: jsonData.name_es, it: jsonData.name_it },
            category: { es: jsonData.category_es, it: jsonData.category_it },
            emoji: jsonData.emoji
        };
    } else {
        console.error('Invalid response format from server:', jsonData);
        throw new Error('La respuesta del servidor no tiene el formato esperado.');
    }

  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    const fallbackCategory = { es: 'Otros', it: 'Altro' };
    return { name: { es: itemName, it: itemName }, category: fallbackCategory, emoji: '🛒' };
  }
};