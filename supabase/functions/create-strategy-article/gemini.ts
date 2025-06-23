
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

export async function generateWithGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API-Schlüssel nicht konfiguriert");
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Fehler (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Keine Antwort von Gemini erhalten");
    }
    
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Gemini API Fehler:", error);
    throw new Error(`Gemini-Generierung fehlgeschlagen: ${error.message}`);
  }
}

export async function generateTopicWithGemini(contextPrompt: string) {
  const prompt = `Du bist eine deutschsprachige Garten-/Küchenbloggerin. Erfinde ein frisches, trendiges Blogartikel-Thema für diese Rahmenbedingungen (höchstens 10 Worte): ${contextPrompt}`;
  
  const result = await generateWithGemini(prompt);
  return result.replace(/[".]/g, "").trim() || "Neuer Blogartikel";
}

export async function generateArticleWithGemini(prompt: string) {
  const systemPrompt = `Du bist eine deutsche Garten-/Küchenbloggerin. Gib einen SEO-optimierten Artikel als Markdown zurück, mit Überschrift und Teaser.

Prompt: ${prompt}`;
  
  return await generateWithGemini(systemPrompt);
}
