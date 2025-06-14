import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { keyword } = await req.json().catch(() => ({ keyword: "" }));
    console.log("[suggest-blog-topics] keyword:", keyword);

    const messages = [
      { role: "system", content: "Du bist ein kreativer, deutschsprachiger Redakteur für Garten- und Küchenblog. Schlage 5 spannende Blogthemen zum Oberbegriff vor, knapp und inspirierend." },
      { role: "user", content: keyword ? `Oberbegriff: ${keyword}` : "Erfinde interessante Themen rund um Garten, Küche, Selbstversorgung." }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[suggest-blog-topics] Fehler bei OpenAI:", error);
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const topics = data.choices?.[0]?.message?.content;
    console.log("[suggest-blog-topics] OpenAI-Roh-Antwort erfolgreich empfangen.");
    return new Response(JSON.stringify({ topics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[suggest-blog-topics] Allgemeiner Fehler:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
