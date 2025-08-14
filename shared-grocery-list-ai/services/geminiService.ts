
export const categorizeAndIconifyItem = async (itemName: string): Promise<{ category: string; emoji: string }> => {
  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Ocurrió un error desconocido en el servidor.' }));
      throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (typeof data.category === 'string' && typeof data.emoji === 'string') {
        return data;
    } else {
        console.error('Invalid response format from server:', data);
        throw new Error('La respuesta del servidor no tiene el formato esperado.');
    }

  } catch (error) {
    console.error("Error al llamar a la ruta de la API de categorización:", error);
    // Provide a fallback so the app can continue working and the user can add the item manually.
    return { category: 'Otros', emoji: '🛒' };
  }
};