import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const prompt = `Du bist ein deutschsprachiger Trend-Analyst.\nGib mir 5-10 aktuelle Keywords aus den Bereichen Garten und Küche als JSON-Array im Format [{"keyword":"...","relevance":0.9,"category":"garten"}].`;

    let resultText: string | null = null;

    if (openAIApiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "Du lieferst nur JSON ohne Erklärungen." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          resultText = data.choices?.[0]?.message?.content ?? null;
        }
      } catch (err) {
        console.error('[fetch-current-trends] OpenAI request failed:', err);
      }
    }

    if (!resultText && geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
        }
      } catch (err) {
        console.error('[fetch-current-trends] Gemini request failed:', err);
      }
    }

    if (!resultText) {
      return new Response(JSON.stringify({ error: 'No AI response' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let trends;
    try {
      trends = JSON.parse(resultText);
    } catch (_) {
      trends = [];
    }
    return new Response(JSON.stringify(trends), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
