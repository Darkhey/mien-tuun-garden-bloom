
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function generateWithOpenAI(systemPrompt: string) {
  if (!openAIApiKey) return null;

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.15,
        max_tokens: 1400,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.warn(`[generate-recipe] OpenAI Fehler ${aiResponse.status}: ${errText.substring(0, 200)}`);
      return null;
    }

    const data = await aiResponse.json();
    if (data.choices?.[0]?.message?.content) {
      return JSON.parse(data.choices[0].message.content);
    }
  } catch (err) {
    console.warn('[generate-recipe] OpenAI Request fehlgeschlagen:', err);
  }

  return null;
}

async function generateWithGemini(prompt: string) {
  if (!geminiApiKey) return null;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.15, maxOutputTokens: 1400 }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[generate-recipe] Gemini Fehler ${response.status}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : null;
  } catch (err) {
    console.error('[generate-recipe] Gemini Request fehlgeschlagen:', err);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const body = await req.json();
    const {
      title,
      description,
      diet,
      season,
      category,
      servings,
      tags,
      freeText
    } = body;

    // Prompt bauen - optimiert, deutschsprachig, strukturiert, SEO-optimiert
    const systemPrompt = `
Du bist ein kreativer, moderner deutschsprachiger Rezeptentwickler für eine nachhaltige Garten- und Food-App.
Erstelle auf Basis der folgenden Angaben ein einzigartiges, möglichst saisonal passendes Rezept.

WICHTIG: Dein Rezept muss SEO-optimiert sein! Verwende relevante Keywords im Titel und in der Beschreibung.
Achte auf eine klare Struktur und verwende Begriffe, die häufig gesucht werden.

Antworte NUR mit einem strukturierten JSON-Objekt mit den Feldern:
- title (string, SEO-optimiert, enthält relevante Suchbegriffe)
- description (string, kurz, inspirierend, SEO-optimiert mit Keywords)
- image (optional, url oder leerer string)
- servings (Zahl)
- tags (Array string, SEO-relevant)
- difficulty (einfach/mittel/schwer) — intelligent schätzen falls nicht angegeben
- category (z.B. Frühstück, Mittag, Dessert...) — aus Kontext oder Vorgabe nutzen
- season (frühling/sommer/herbst/winter/ganzjährig)
- diet (optional: vegan, vegetarisch, omnivor, glutenfrei, laktosefrei)
- prepTime (Zahl, Vorbereitungszeit in Minuten)
- cookTime (Zahl, Kochzeit in Minuten)
- ingredients (Array { name:string, amount:number|null, unit:string|null, optional: boolean })
- instructions (Array string, kurz & verständlich)
- tips (Array string, optional; z.B. Variationen, Lagerung)
- nutrition (optional: { calories, protein, carbs, fat, fiber, sugar })
- story (string, 3-8 Sätze, motivierender und inspirierender Fließtext aus Sicht eines*r Foodblogger*in, erklärt den besonderen Reiz oder Hintergrund des Rezepts, bezieht sich gezielt auf mindestens einen der Tags, auf Saison und Kategorie, SEO-optimiert, ideal um Neugier und Lust zu machen!)

Vorgaben:
${title ? "Titel: " + title : ""}
${description ? "Beschreibung: " + description : ""}
${diet ? "Ernährung: " + diet : ""}
${season ? "Saison: " + season : ""}
${category ? "Kategorie: " + category : ""}
${servings ? "Portionen: " + servings : ""}
${tags && tags.length ? "Tags: " + tags.join(", ") : ""}
${freeText ? "Hinweise/Wünsche: " + freeText : ""}

Wähle Zutaten und Zubereitung sinnvoll und saisonal passend. Kompakte, gültige JSON-Antwort!
    `.trim();

    let recipe = await generateWithOpenAI(systemPrompt);
    let usedProvider = 'OpenAI';

    if (!recipe) {
      console.log('[generate-recipe] Verwende Gemini Fallback...');
      const geminiResponse = await generateWithGemini(`${systemPrompt}\n\nBitte erstelle ein JSON-Objekt für das Rezept.`);
      if (geminiResponse) {
        const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recipe = JSON.parse(jsonMatch[0]);
          usedProvider = 'Google Gemini';
          console.log('[generate-recipe] Gemini Fallback erfolgreich verwendet');
        }
      }
    }

    if (!recipe) {
      return jsonResponse({ error: "Beide KI-Services nicht verfügbar", code: "no_ai_service" }, 500);
    }

    return jsonResponse({ recipe, provider: usedProvider });

  } catch (err) {
    console.error('[generate-recipe] Fehler:', err);
    return jsonResponse({ error: String(err?.message ?? err), code: "unhandled_error" }, 500);
  }
});
