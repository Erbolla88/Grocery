
import { GoogleGenAI, Type } from "@google/genai";

// This file will be handled by Vercel's Edge runtime.
// Make sure to set the API_KEY in your Vercel project's Environment Variables.

export const config = {
  runtime: 'edge',
};

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


export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY environment variable not set on server");
    return new Response(JSON.stringify({ message: 'Error de configuración del servidor: la clave API no está configurada.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const { itemName } = await request.json();
    if (!itemName || typeof itemName !== 'string') {
        return new Response(JSON.stringify({ message: 'El parámetro itemName es requerido y debe ser un texto.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
    
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
    const parsedResponse = JSON.parse(jsonText);

    return new Response(JSON.stringify(parsedResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error en la ruta API de categorización:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ message: 'Fallo al contactar la API de Gemini.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}