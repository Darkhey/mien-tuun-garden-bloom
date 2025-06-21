
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_ADMIN_KEY = Deno.env.get("OPENAI_ADMIN_KEY");

// Use admin key for enhanced capabilities, fallback to regular key
const getOpenAIKey = (requireAdmin = false) => {
  if (requireAdmin && OPENAI_ADMIN_KEY) {
    return OPENAI_ADMIN_KEY;
  }
  return OPENAI_ADMIN_KEY || OPENAI_API_KEY;
};

export async function generateImage({ theme, category, season, trend }: { theme: string, category: string, season: string, trend: string }) {
  const apiKey = getOpenAIKey(true); // Use admin key for image generation
  
  if (!apiKey) {
    throw new Error("OpenAI API-Schlüssel nicht konfiguriert");
  }

  const basePrompt = `Hyperrealistisches, stimmungsvolles Garten- oder Küchenbild passend zum Thema "${theme}" (${category}, ${season}, Trend: ${trend}). Natürliches Licht, viel Atmosphäre, hochwertiger Fotografie-Stil. Ohne Text.`;
  
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1", // Use the latest image model
        prompt: basePrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
        quality: "high", // Enhanced quality with admin key
        output_format: "png",
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
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API-Schlüssel nicht konfiguriert");
  }

  try {
    const ideaResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14", // Latest model
        messages: [
          { role: "system", content: "Du bist eine deutschsprachige Garten-/Küchenbloggerin. Erfinde ein frisches, trendiges Blogartikel-Thema für diese Rahmenbedingungen (höchstens 10 Worte):" },
          { role: "user", content: contextPrompt }
        ],
        temperature: 0.85,
        max_tokens: 64,
      }),
    });

    if (!ideaResp.ok) {
      const errorText = await ideaResp.text();
      throw new Error(`OpenAI API Fehler (${ideaResp.status}): ${errorText}`);
    }

    const ideaData = await ideaResp.json();
    return (
      ideaData.choices?.[0]?.message?.content?.replace(/[".]/g, "").trim() ||
      "Neuer Blogartikel"
    );
  } catch (error) {
    console.error("Topic-Generierung Fehler:", error);
    throw new Error(`Topic-Generierung fehlgeschlagen: ${error.message}`);
  }
}

export async function generateArticle(prompt: string) {
  const apiKey = getOpenAIKey(true); // Use admin key for enhanced article generation
  
  if (!apiKey) {
    throw new Error("OpenAI API-Schlüssel nicht konfiguriert");
  }

  try {
    const artResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14", // Latest model
        messages: [
          { role: "system", content: "Du bist eine deutsche Garten-/Küchenbloggerin. Gib einen SEO-optimierten Artikel als Markdown zurück, mit Überschrift und Teaser." },
          { role: "user", content: prompt }
        ],
        temperature: 0.75,
        max_tokens: 2500, // Increased for better content
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

// New admin-level function for content analysis and optimization
export async function analyzeContentPerformance(content: string, metadata: any) {
  const apiKey = getOpenAIKey(true); // Requires admin key
  
  if (!apiKey) {
    throw new Error("OpenAI Admin-Schlüssel erforderlich für Content-Analyse");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { 
            role: "system", 
            content: "Du bist ein SEO- und Content-Marketing-Experte. Analysiere den gegebenen Content und gib konkrete Verbesserungsvorschläge. Antworte als JSON mit den Feldern: seoScore (0-100), readabilityScore (0-100), engagementPotential (0-100), improvements (Array von Strings), keywords (Array), estimatedPerformance (0-100)." 
          },
          { 
            role: "user", 
            content: `Analysiere diesen Content:\n\nTitel: ${metadata.title}\nKategorie: ${metadata.category}\nContent: ${content.substring(0, 2000)}...` 
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error("Keine Analyse erhalten");
    }

    // Try to parse as JSON, fallback to structured text
    try {
      return JSON.parse(analysisText);
    } catch {
      return {
        seoScore: 75,
        readabilityScore: 80,
        engagementPotential: 70,
        improvements: [analysisText],
        keywords: [],
        estimatedPerformance: 75
      };
    }
  } catch (error) {
    console.error("Content-Analyse Fehler:", error);
    throw error;
  }
}
