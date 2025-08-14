
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "Una categoría adecuada para el artículo de la compra.",
    },
    emoji: {
      type: Type.STRING,
      description: "Un único emoji relevante que represente el artículo de la compra.",
    },
  },
  required: ["category", "emoji"],
};

const SYSTEM_INSTRUCTION = `Eres un asistente de listas de la compra. Para el artículo proporcionado, indica la categoría más apropiada y un único icono emoji.
Las categorías deben ser una de: Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros.
Si el artículo es muy específico, elige la que mejor se ajuste. El emoji debe ser un único carácter común.`;

export const categorizeAndIconifyItem = async (itemName: string): Promise<{ category: string; emoji: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Clasifica este artículo: ${itemName}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("La API devolvió una respuesta vacía.");
    }
    
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonText);
    } catch(e) {
        console.error("Fallo al parsear JSON de Gemini:", jsonText);
        // Fallback si falla el parseo
        return { category: 'Otros', emoji: '🛒' };
    }

    const { category, emoji } = parsedResponse;

    if (typeof category === 'string' && typeof emoji === 'string') {
        return { category, emoji };
    } else {
        console.error('La respuesta de la API no coincide con el schema esperado:', parsedResponse);
        return { category: 'Otros', emoji: '🛒' };
    }

  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    // Fallback para que la app no se rompa
    return { category: 'Otros', emoji: '🛒' };
  }
};
