
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

async function generateWithGemini(prompt: string) {
  if (!geminiApiKey) {
    throw new Error("Gemini API Key nicht konfiguriert");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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
        temperature: 0.8,
        maxOutputTokens: 1000,
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword } = await req.json();
    
    console.log(`[suggest-blog-topics] Eingehender Keyword: ${keyword}`);

    if (!keyword || keyword.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Keyword ist erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Erstelle 5 konkrete, spezifische Blog-Artikel-Titel für deutsche Garten- und Küchen-Blogs basierend auf diesem Kontext: "${keyword}"

Die Titel sollen:
- Spezifisch und actionable sein
- SEO-optimiert mit relevanten Keywords
- Für deutsche Leser ansprechend formuliert
- Praktischen Nutzen vermitteln
- Zwischen 8-12 Wörtern lang sein

Gib nur die 5 Titel zurück, einen pro Zeile, ohne Nummerierung oder zusätzliche Erklärungen.`;

    let suggestions: string[] = [];
    let usedProvider = 'OpenAI';

    // Try OpenAI first
    if (openAIApiKey) {
      try {
        const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Du bist ein kreativer Content-Experte für deutsche Garten- und Küchen-Blogs." },
              { role: "user", content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 500,
          }),
        });

        if (openAIResponse.ok) {
          const data = await openAIResponse.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            suggestions = content.split('\n').filter((s: string) => s.trim().length > 0);
            console.log(`[suggest-blog-topics] OpenAI erfolgreich verwendet`);
          }
        } else {
          const errorData = await openAIResponse.json();
          console.error(`[suggest-blog-topics] Fehler beim OpenAI Request:`, JSON.stringify(errorData, null, 2));
          throw new Error(`OpenAI API Fehler: ${errorData.error?.message}`);
        }
      } catch (openaiError) {
        console.warn(`[suggest-blog-topics] OpenAI fehlgeschlagen, verwende Gemini Fallback:`, openaiError);
      }
    }

    // Fallback to Gemini if OpenAI failed or is not available
    if (suggestions.length === 0 && geminiApiKey) {
      try {
        const geminiResponse = await generateWithGemini(prompt);
        suggestions = geminiResponse.split('\n').filter((s: string) => s.trim().length > 0);
        usedProvider = 'Google Gemini';
        console.log(`[suggest-blog-topics] Gemini Fallback erfolgreich verwendet`);
      } catch (geminiError) {
        console.error(`[suggest-blog-topics] Gemini Fallback fehlgeschlagen:`, geminiError);
      }
    }

    if (suggestions.length === 0) {
      throw new Error("Beide KI-Services sind nicht verfügbar");
    }

    // Clean up suggestions
    const cleanedSuggestions = suggestions
      .map(s => s.trim().replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''))
      .filter(s => s.length > 0)
      .slice(0, 5);

    console.log(`[suggest-blog-topics] ${cleanedSuggestions.length} Vorschläge generiert mit ${usedProvider}`);

    return new Response(
      JSON.stringify({ 
        suggestions: cleanedSuggestions,
        provider: usedProvider
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[suggest-blog-topics] Fehler:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unbekannter Fehler",
        suggestions: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
