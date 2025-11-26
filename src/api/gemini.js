const GEMINI_MODEL = "gemini-2.5-flash";
// La clave se provee en runtime o por variable de entorno
const API_KEY = typeof __gemini_api_key !== 'undefined' ? __gemini_api_key : import.meta.env.VITE_GEMINI_API_KEY || "";

export const callGeminiAPI = async (prompt, systemInstruction = "", maxRetries = 5) => {
    if (!API_KEY) {
        console.warn("Gemini API Key no encontrada.");
        throw new Error("API Key de Gemini no configurada.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 && attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) return text;
            throw new Error("Respuesta del modelo vacía o estructura inesperada.");

        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === maxRetries - 1) throw new Error("Error al comunicarse con el modelo Gemini.");
        }
    }
};
