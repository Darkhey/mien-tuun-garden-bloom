
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
    console.log("[blog-to-recipe] Request empfangen:", { title, truncatedContent: content?.slice?.(0, 160), image });

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

    console.log("[blog-to-recipe] Prompt für KI gebaut (Länge):", systemPrompt.length);

    // OpenAI API Aufruf
    let chatResp: Response;
    try {
      chatResp = await fetch("https://api.openai.com/v1/chat/completions", {
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
    } catch (fetchErr) {
      console.error("[blog-to-recipe] OpenAI-Request fehlgeschlagen:", fetchErr);
      return new Response(
        JSON.stringify({
          error: "OpenAI request failed",
          code: "openai_network_error",
          details: String(fetchErr?.message ?? fetchErr)
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!chatResp.ok) {
      const chatErr = await chatResp.text();
      console.error("[blog-to-recipe] Fehlerhafte Antwort von OpenAI:", chatErr);
      return new Response(
        JSON.stringify({
          error: "OpenAI API error",
          code: "openai_error",
          status: chatResp.status,
          openai: chatErr,
        }),
        { status: chatResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data;
    try {
      data = await chatResp.json();
    } catch (parseErr) {
      console.error("[blog-to-recipe] Fehler beim Parsen der OpenAI-Antwort:", parseErr);
      return new Response(
        JSON.stringify({
          error: "Antwort von OpenAI konnte nicht geparst werden",
          code: "openai_json_parse_error",
          details: String(parseErr?.message ?? parseErr)
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("[blog-to-recipe] Keine 'content'-Antwort von OpenAI erhalten:", data);
      return new Response(
        JSON.stringify({
          error: "Keine KI-Antwort erhalten",
          code: "no_content",
          data,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const recipe = JSON.parse(data.choices[0].message.content);
      console.log("[blog-to-recipe] Rezept erfolgreich extrahiert, Titel:", recipe?.title || "<kein Titel>");
      return new Response(JSON.stringify({ recipe }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (jsonErr) {
      console.error("[blog-to-recipe] Fehler beim JSON.parse der KI-Antwort:", data.choices[0].message.content, jsonErr);
      return new Response(
        JSON.stringify({
          error: "KI-Antwort konnte nicht als JSON geparst werden",
          code: "json_parse_error",
          content: data.choices[0].message.content,
          details: String(jsonErr?.message ?? jsonErr)
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("[blog-to-recipe] Allgemeiner Fehler:", err);
    return new Response(JSON.stringify({
      error: String(err?.message ?? err),
      code: "unhandled_error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
