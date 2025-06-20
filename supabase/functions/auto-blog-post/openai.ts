const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

export async function generateImage({ theme, category, season, trend }: { theme: string, category: string, season: string, trend: string }) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API-Schlüssel nicht konfiguriert");
  }

  const basePrompt = `Hyperrealistisches, stimmungsvolles Garten- oder Küchenbild passend zum Thema "${theme}" (${category}, ${season}, Trend: ${trend}). Natürliches Licht, viel Atmosphäre, hochwertiger Fotografie-Stil. Ohne Text.`;
  
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: basePrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
        quality: "hd",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Fehler (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.data?.[0]?.b64_json) {
      throw new Error("Bildgenerierung fehlgeschlagen - keine Bilddaten erhalten");
    }
    
    return data.data[0].b64_json;
  } catch (error) {
    console.error("Bildgenerierung Fehler:", error);
    throw new Error(`Bildgenerierung fehlgeschlagen: ${error.message}`);
  }
}

export async function generateTopicIdea(contextPrompt: string) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API-Schlüssel nicht konfiguriert");
  }

  try {
    const ideaResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Du bist eine deutschsprachige Garten-/Küchenbloggerin. Erfinde ein frisches, trendiges Blogartikel-Thema für diese Rahmenbedingungen (höchstens 10 Worte):" },
          { role: "user", content: contextPrompt }
        ],
        temperature: 0.85,
        max_tokens: 64,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Fehler (${response.status}): ${errorText}`);
    }

    const ideaData = await ideaResp.json();
    return ideaData.choices?.[0]?.message?.content?.replace(/["\.]/g,"").trim() || "Neuer Blogartikel";
  } catch (error) {
    console.error("Topic-Generierung Fehler:", error);
    throw new Error(`Topic-Generierung fehlgeschlagen: ${error.message}`);
  }
}

export async function generateArticle(prompt: string) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API-Schlüssel nicht konfiguriert");
  }

  try {
    const artResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Du bist eine deutsche Garten-/Küchenbloggerin. Gib einen SEO-optimierten Artikel als Markdown zurück, mit Überschrift und Teaser." },
          { role: "user", content: prompt }
        ],
        temperature: 0.75,
        max_tokens: 1800,
      }),
    });

    if (!artResp.ok) {
      const errorText = await artResp.text();
      throw new Error(`OpenAI API Fehler (${artResp.status}): ${errorText}`);
    }

    const artData = await artResp.json();
    
    if (!artData.choices?.[0]?.message?.content) {
      throw new Error("Artikel-Generierung fehlgeschlagen - kein Content erhalten");
    }
    
    return artData.choices[0].message.content.trim();
  } catch (error) {
    console.error("Artikel-Generierung Fehler:", error);
    throw new Error(`Artikel-Generierung fehlgeschlagen: ${error.message}`);
  }
}