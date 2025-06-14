
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, content, image } = await req.json();

    // Prompt: Extrahiere ein Rezept als strukturiertes JSON
    const systemPrompt = `
Du bist ein hilfreicher Rezeptassistent in einer modernen deutschsprachigen Garten- und Food-App. Extrahiere aus folgendem Blogartikel ein Rezept-Objekt mit den Feldern: 
- title (string),
- description (string, optional),
- image (url, optional),
- ingredients (array aus { name:string, amount:number|null, unit:string|null }),
- instructions (array von kurzen strings),
- tips (array von kurzen strings, optional).

Gib als Antwort ausschließlich ein gültiges kompaktes JSON-Objekt für ein einzeln darstellbares Rezept zurück.

Blogartikel Titel: ${title}
Bild: ${image ?? ""}
Inhalt:
${content}
`.trim();

    const chatResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    const data = await chatResp.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Keine KI-Antwort erhalten.");
    }
    // Parse das JSON-Objekt aus der KI-Antwort
    const recipe = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("KI Rezept Extraktion Fehler:", err);
    return new Response(JSON.stringify({ error: err.message || err.toString() }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
