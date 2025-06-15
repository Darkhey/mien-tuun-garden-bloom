
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

export async function generateImage({ theme, category, season, trend }: { theme: string, category: string, season: string, trend: string }) {
  const basePrompt = `Hyperrealistisches, stimmungsvolles Garten- oder Küchenbild passend zum Thema "${theme}" (${category}, ${season}, Trend: ${trend}). Natürliches Licht, viel Atmosphäre, hochwertiger Fotografie-Stil. Ohne Text.`;
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
  const data = await response.json();
  if (!data.data?.[0]?.b64_json) throw new Error("Bildgenerierung fehlgeschlagen");
  return data.data[0].b64_json;
}

export async function generateTopicIdea(contextPrompt: string) {
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
    const ideaData = await ideaResp.json();
    return ideaData.choices?.[0]?.message?.content?.replace(/["\.]/g,"").trim() || "Neuer Blogartikel";
}

export async function generateArticle(prompt: string) {
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
    const artData = await artResp.json();
    return artData.choices?.[0]?.message?.content?.trim() || "Artikel konnte nicht erstellt werden.";
}
