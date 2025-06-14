
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredient } = await req.json();
    if (!ingredient) {
      return new Response(JSON.stringify({ error: "Missing ingredient" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Sende gezielte Prompt zu OpenAI (gpt-4o-mini)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein kluger Kochassistent. Wenn jemand eine bestimmte Zutat im Rezept nicht mag/verträgt, schlage bitte eine typische sinnvolle Alternative vor (ein Wort, möglichst verbreitet in Europa, gleiche Konsistenz, gleiche Gar-/Kochzeit). Antworte nur mit dem Alternativwort, ohne weiteren Text. Falls es keine echte Alternative gibt, schreibe 'Keine passende Alternative'.",
          },
          { role: "user", content: `Ich mag keine ${ingredient}. Was kann ich stattdessen nehmen?` },
        ],
        max_tokens: 40,
        temperature: 0.3,
      }),
    });
    const data = await response.json();
    const answer = (data?.choices?.[0]?.message?.content || "").trim();

    return new Response(
      JSON.stringify({
        alternative: answer.startsWith("Keine") ? null : answer,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Fehler bei der OpenAI Anfrage" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
