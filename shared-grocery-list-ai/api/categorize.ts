// This file acts as a serverless function (e.g., on Vercel, Netlify, or Firebase Functions).
// It securely handles the Gemini API key on the backend.

import { GoogleGenAI, Type } from "@google/genai";

// These types are simplified and duplicated from the frontend for isolation.
type Language = 'es' | 'it';
interface Multilingual {
  es: string;
  it: string;
}

// Ensure API_KEY is available in the serverless environment
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name_es: { type: Type.STRING, description: "The name of the item in Spanish, singular form." },
    name_it: { type: Type.STRING, description: "The name of the item in Italian, singular form." },
    category_es: { type: Type.STRING, description: "A suitable category for the grocery item, in Spanish." },
    category_it: { type: Type.STRING, description: "A suitable category for the grocery item, in Italian." },
    emoji: { type: Type.STRING, description: "A single, suitable emoji for the item." },
  },
  required: ["name_es", "name_it", "category_es", "category_it", "emoji"],
};

const SYSTEM_INSTRUCTIONS: Record<Language, string> = {
  es: `Eres un asistente de listas de la compra. Para el artículo proporcionado, indica su nombre en singular en español e italiano, la categoría más apropiada en español e italiano, y un único emoji adecuado para el artículo.
Las categorías en español deben ser una de: Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros.
Las categorías en italiano deben ser la traducción correspondiente: Frutta, Verdura, Carne e Pesce, Latticini e Uova, Panetteria, Dispensa, Surgelati, Bevande, Snack, Casa, Cura Personale, Altro.`,
  it: `Sei un assistente per la lista della spesa. Per l'articolo fornito, indica il suo nome al singolare in spagnolo e italiano, la categoria più approprata in spagnolo e italiano, e un'unica emoji adatta per l'articolo.
Le categorie in italiano devono essere una delle seguenti: Frutta, Verdura, Carne e Pesce, Latticini e Uova, Panetteria, Dispensa, Surgelati, Bevande, Snack, Casa, Cura Personale, Altro.
Le categorie in spagnolo devono essere la traduzione corrispondente: Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros.`
};

const callGeminiApi = async (itemName: string, lang: Language): Promise<{ name: Multilingual; category: Multilingual; emoji: string }> => {
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
        throw new Error("API did not return content.");
    }
    
    const jsonData = JSON.parse(textData);

    if (jsonData.name_es && jsonData.name_it && jsonData.category_es && jsonData.category_it && jsonData.emoji) {
        return {
            name: { es: jsonData.name_es, it: jsonData.name_it },
            category: { es: jsonData.category_es, it: jsonData.category_it },
            emoji: jsonData.emoji || '🛒'
        };
    } else {
        console.error('Invalid response format from AI server:', jsonData);
        throw new Error('AI response was not in the expected format.');
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the error to be caught by the handler
    throw error;
  }
};


// This function is a generic handler for serverless environments (Vercel, etc.).
// It expects a request object `req` with a `body` and a response object `res`.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { itemName, lang } = req.body;

    if (!itemName || typeof itemName !== 'string' || !lang || (lang !== 'es' && lang !== 'it')) {
      return res.status(400).json({ error: 'Missing or invalid itemName or lang in request body' });
    }

    const result = await callGeminiApi(itemName, lang);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in categorize function handler:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred on the server.';
    return res.status(500).json({ error: 'Internal Server Error', details: message });
  }
}
