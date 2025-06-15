
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
    const { keyword } = await req.json();
    console.log("[suggest-blog-topics] Eingehender Keyword:", keyword);

    // Besserer System-Prompt für Themenvorschläge
    const systemPrompt = `Du bist eine deutschsprachige Garten- und Küchenbloggerin. 
    Generiere 5 knackige, inspirierende Blogartikel-Titel zu dem gegebenen Thema. 
    Die Titel sollen:
    - Maximal 8-10 Worte haben
    - Praktisch und umsetzbar sein
    - Neugier wecken
    - Ohne Anführungszeichen ausgegeben werden
    
    Gib nur die Titel zurück, jeder in einer neuen Zeile.`;

    const userPrompt = keyword || "Garten- und Küchentipps für Hobbygärtner";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 200,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[suggest-blog-topics] Fehler beim OpenAI Request:", error);
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Aufteilen der Antwort in einzelne Titel
    const topics = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')) // Entferne Nummerierungen
      .map(line => line.replace(/^-\s*/, '')) // Entferne Bindestriche
      .slice(0, 5); // Maximal 5 Vorschläge

    console.log("[suggest-blog-topics] Generierte Themen:", topics);

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
