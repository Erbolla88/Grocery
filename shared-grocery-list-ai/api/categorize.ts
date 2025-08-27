// This file acts as a Vercel Serverless Function.
// It's a secure backend proxy that calls the Gemini API.

const apiKey = process.env.API_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const SYSTEM_INSTRUCTIONS = {
  es: `Eres un asistente de listas de la compra. Para el artículo proporcionado, indica su nombre en singular en español e italiano, la categoría más apropiada en español e italiano, y un único emoji adecuado para el artículo.
Las categorías en español deben ser una de: Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros.
Las categorías en italiano deben ser la traducción correspondiente: Frutta, Verdura, Carne e Pesce, Latticini e Uova, Panetteria, Dispensa, Surgelati, Bevande, Snack, Casa, Cura Personale, Altro.`,
  it: `Sei un assistente per la lista della spesa. Per l'articolo fornito, indica il suo nome al singolare in spagnolo e italiano, la categoria più approprata in spagnolo e italiano, e un'unica emoji adatta per l'articolo.
Le categorie in italiano devono essere una delle seguenti: Frutta, Verdura, Carne e Pesce, Latticini e Uova, Panetteria, Dispensa, Surgelati, Bevande, Snack, Casa, Cura Personale, Altro.
Le categorie in spagnolo devono essere la traduzione corrispondente: Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros.`
};

// We define the expected JSON output structure for the AI model.
// This is done via a "function declaration" when using the REST API.
const CATEGORIZE_FUNCTION_DECLARATION = {
    name: "categorize_item",
    description: "Correctly categorizes a grocery item and provides its name in Spanish and Italian, and a suitable emoji.",
    parameters: {
        type: "OBJECT",
        properties: {
            name_es: { type: "STRING", description: "The name of the item in Spanish, singular form." },
            name_it: { type: "STRING", description: "The name of the item in Italian, singular form." },
            category_es: { type: "STRING", description: "A suitable category for the grocery item, in Spanish." },
            category_it: { type: "STRING", description: "A suitable category for the grocery item, in Italian." },
            emoji: { type: "STRING", description: "A single, suitable emoji for the item." },
        },
        required: ["name_es", "name_it", "category_es", "category_it", "emoji"],
    }
};


export default async function handler(req, res) {
  if (!apiKey) {
    console.error("Gemini API key not found in environment variables.");
    return res.status(500).json({ error: "Server configuration error: Missing API Key." });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { itemName, lang } = req.body;

    if (!itemName || !lang || !['es', 'it'].includes(lang)) {
        return res.status(400).json({ error: 'Missing or invalid itemName or lang' });
    }

    const requestBody = {
        contents: [{
            parts: [{ text: `Clasifica este artículo: ${itemName}` }]
        }],
        systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTIONS[lang] }]
        },
        tools: [{
            functionDeclarations: [CATEGORIZE_FUNCTION_DECLARATION]
        }],
        toolConfig: {
            functionCallingConfig: {
                mode: "ANY",
                allowedFunctionNames: ["categorize_item"]
            }
        },
        generationConfig: {
            temperature: 0.2,
        }
    };

    const geminiResponse = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    
    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.json();
        console.error("Error from Gemini API:", errorBody);
        return res.status(geminiResponse.status).json({ error: "Failed to get a response from the AI model." });
    }

    const data = await geminiResponse.json();
    
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (functionCall?.name === 'categorize_item' && functionCall.args) {
        return res.status(200).json(functionCall.args);
    } else {
        console.error("Model did not return the expected function call. Response:", JSON.stringify(data, null, 2));
        // Check for text response as a fallback
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
             return res.status(500).json({ error: `AI model returned unexpected text instead of data: ${textResponse}` });
        }
        return res.status(500).json({ error: "AI model did not return the expected structured data." });
    }

  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
