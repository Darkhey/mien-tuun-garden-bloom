
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_ADMIN_KEY = Deno.env.get("OPENAI_ADMIN_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const getOpenAIKey = () => OPENAI_ADMIN_KEY || OPENAI_API_KEY;

async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens = 2500, temperature = 0.75): Promise<string> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error("no_openai_key");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature, max_tokens: maxTokens,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`OpenAI ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(systemPrompt: string, userPrompt: string, maxTokens = 2500, temperature = 0.75): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("no_gemini_key");

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function aiGenerate(systemPrompt: string, userPrompt: string, maxTokens = 2500, temperature = 0.75): Promise<string> {
  // Try OpenAI first, then Gemini as fallback
  try {
    return await callOpenAI(systemPrompt, userPrompt, maxTokens, temperature);
  } catch (openaiErr) {
    console.warn("[auto-blog-post] OpenAI failed, trying Gemini:", openaiErr.message);
  }

  try {
    return await callGemini(systemPrompt, userPrompt, maxTokens, temperature);
  } catch (geminiErr) {
    console.error("[auto-blog-post] Gemini also failed:", geminiErr.message);
    throw new Error("Keine KI-API verfügbar (OpenAI + Gemini fehlgeschlagen)");
  }
}

export async function generateImage({ theme, category, season, trend }: { theme: string, category: string, season: string, trend: string }) {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error("OpenAI API-Schlüssel nicht konfiguriert");

  const basePrompt = `Hyperrealistisches, stimmungsvolles Garten- oder Küchenbild passend zum Thema "${theme}" (${category}, ${season}, Trend: ${trend}). Natürliches Licht, viel Atmosphäre, hochwertiger Fotografie-Stil. Ohne Text.`;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: basePrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "high",
      output_format: "png",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Image API Fehler (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.data?.[0]?.b64_json) throw new Error("Keine Bilddaten erhalten");
  return data.data[0].b64_json;
}

export async function generateTopicIdea(contextPrompt: string) {
  const result = await aiGenerate(
    "Du bist eine deutschsprachige Garten-/Küchenbloggerin. Erfinde ein frisches, trendiges Blogartikel-Thema für diese Rahmenbedingungen (höchstens 10 Worte):",
    contextPrompt,
    64,
    0.85
  );
  return result.replace(/[".]/g, "").trim() || "Neuer Blogartikel";
}

export async function generateArticle(prompt: string) {
  const result = await aiGenerate(
    "Du bist eine deutsche Garten-/Küchenbloggerin. Gib einen SEO-optimierten Artikel als Markdown zurück, mit Überschrift und Teaser. Mindestens 1200 Wörter.",
    prompt,
    3000,
    0.75
  );
  if (!result) throw new Error("Artikel-Generierung fehlgeschlagen - kein Content erhalten");
  return result;
}

export async function analyzeContentPerformance(content: string, metadata: any) {
  const result = await aiGenerate(
    "Du bist ein SEO- und Content-Marketing-Experte. Analysiere den gegebenen Content und gib konkrete Verbesserungsvorschläge. Antworte als JSON mit den Feldern: seoScore (0-100), readabilityScore (0-100), engagementPotential (0-100), improvements (Array von Strings), keywords (Array), estimatedPerformance (0-100).",
    `Analysiere diesen Content:\n\nTitel: ${metadata.title}\nKategorie: ${metadata.category}\nContent: ${content.substring(0, 2000)}...`,
    1000,
    0.3
  );

  try {
    return JSON.parse(result);
  } catch {
    return { seoScore: 75, readabilityScore: 80, engagementPotential: 70, improvements: [result], keywords: [], estimatedPerformance: 75 };
  }
}
