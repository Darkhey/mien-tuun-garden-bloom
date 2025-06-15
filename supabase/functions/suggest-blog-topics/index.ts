
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

/**
 * Helper to robustly extract topic list from OpenAI reply (numbered or bullet, or comma/line-separated)
 */
function extractTopics(raw: string): string[] {
  if (!raw || typeof raw !== "string") return [];
  // Split by linebreak, filter empty, clean up
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let topics: string[] = [];
  // Pattern 1: 1. Thema, 2. Thema, ...
  let numbered = lines.filter(l => /^\d+\.\s*/.test(l));
  if (numbered.length >= 3) {
    topics = numbered.map(l => l.replace(/^\d+\.\s*/, "").trim());
  } else {
    // Pattern 2: Bullet list
    let bullets = lines.filter(l => /^[-–•]\s*/.test(l));
    if (bullets.length >= 3) {
      topics = bullets.map(l => l.replace(/^[-–•]\s*/, "").trim());
    } else if (lines.length >= 3) {
      // Fallback: Any non-empty line
      topics = lines;
    } else {
      // Fallback: Try comma-separated
      topics = raw.split(",").map(x => x.trim()).filter(Boolean);
    }
  }
  // Remove duplicates
  return Array.from(new Set(topics)).filter(Boolean);
}

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
      return new Response(JSON.stringify({ error, topics: [] }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const topicsRaw = data.choices?.[0]?.message?.content ?? "";
    const topicsArray = extractTopics(topicsRaw);

    // Alles loggen
    console.log("[suggest-blog-topics] OpenAI-Roh-Antwort:", topicsRaw);
    console.log("[suggest-blog-topics] Extrahierte Themen:", topicsArray);

    return new Response(JSON.stringify({ topics: topicsArray, openai_raw: topicsRaw }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[suggest-blog-topics] Allgemeiner Fehler:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err), topics: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
