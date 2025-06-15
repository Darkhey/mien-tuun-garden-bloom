
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  console.log(`[generate-blog-post] Request method: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Input-Validierung
    const body = await req.json();
    const { prompt } = body;
    
    console.log("[generate-blog-post] Eingehender Request Body:", JSON.stringify(body));
    console.log("[generate-blog-post] Extrahierter Prompt:", prompt);

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.error("[generate-blog-post] Ungültiger Prompt:", prompt);
      return new Response(
        JSON.stringify({ error: "Prompt ist erforderlich und darf nicht leer sein" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!openAIApiKey) {
      console.error("[generate-blog-post] OpenAI API Key fehlt");
      return new Response(
        JSON.stringify({ error: "OpenAI API Key nicht konfiguriert" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const messages = [
      { 
        role: "system", 
        content: "Du bist eine hilfreiche deutschsprachige Bloggerin für Garten & Küche und schreibst inspirierende, SEO-optimierte Blogartikel. Schreibe zu folgender Idee einen passenden Artikelentwurf als Markdown:" 
      },
      { role: "user", content: prompt.trim() }
    ];

    console.log("[generate-blog-post] Sende Request an OpenAI API...");
    console.log("[generate-blog-post] Messages:", JSON.stringify(messages));

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    console.log(`[generate-blog-post] OpenAI Response Status: ${openAIResponse.status}`);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error(`[generate-blog-post] OpenAI API Fehler (${openAIResponse.status}):`, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API Fehler: ${openAIResponse.status}`,
          details: errorText 
        }),
        {
          status: openAIResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await openAIResponse.json();
    console.log("[generate-blog-post] OpenAI Response Data:", JSON.stringify(data));

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[generate-blog-post] Kein Content in OpenAI Response:", data);
      return new Response(
        JSON.stringify({ error: "Keine Antwort von OpenAI erhalten" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[generate-blog-post] Artikel erfolgreich generiert. Content length:", content.length);
    
    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("[generate-blog-post] Unbehandelter Fehler:", err);
    console.error("[generate-blog-post] Error stack:", err.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Interner Server-Fehler",
        details: String(err?.message ?? err)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
