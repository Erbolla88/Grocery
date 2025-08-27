// This file acts as a Vercel Serverless Function.
// It's a secure backend proxy that calls the Gemini API.

const apiKey = process.env.API_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const getSystemInstruction = () => {
  const categoriesEs = "Frutas, Verduras, Carne y Pescado, Lácteos y Huevos, Panadería, Despensa, Congelados, Bebidas, Aperitivos, Hogar, Cuidado Personal, Otros";
  const categoriesIt = "Frutta, Verdura, Carne e Pesce, Latticini e Uova, Panetteria, Dispensa, Surgelati, Bevande, Snack, Casa, Cura Personale, Altro";
  
  // A single, robust prompt that instructs the model to return a JSON object.
  const instruction = `Eres un asistente de listas de la compra. Para el artículo proporcionado, devuelve un único objeto JSON. NO uses markdown (es decir, no envuelvas el JSON en \`\`\`json ... \`\`\`).
El objeto JSON debe tener la siguiente estructura:
{
  "name_es": "nombre del artículo en singular en español",
  "name_it": "nombre del artículo en singular en italiano",
  "category_es": "una categoría de la lista de categorías en español",
  "category_it": "la traducción al italiano de la categoría elegida",
  "emoji": "un único emoji adecuado para el artículo"
}

Lista de categorías en español: ${categoriesEs}.
Lista de categorías en italiano: ${categoriesIt}.

Asegúrate de que la categoría devuelta sea una de las de la lista.`;

  return instruction;
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
            parts: [{ text: getSystemInstruction() }]
        },
        generationConfig: {
            responseMimeType: "application/json",
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
        console.error("Error from Gemini API:", errorBody.error ? errorBody.error.message : errorBody);
        return res.status(geminiResponse.status).json({ error: "Failed to get a response from the AI model." });
    }

    const data = await geminiResponse.json();
    
    // The response text itself is the JSON string
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
        console.error("Model did not return any text. Response:", JSON.stringify(data, null, 2));
        return res.status(500).json({ error: "AI model returned an empty response." });
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return res.status(200).json(parsedJson);
    } catch (parseError) {
        console.error("Failed to parse JSON response from model. Raw text:", jsonText);
        return res.status(500).json({ error: "AI model returned invalid data format." });
    }

  } catch (error) {
    console.error("Error in serverless function:", error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
