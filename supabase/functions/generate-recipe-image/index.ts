
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

// Utility: English fallback if user-provided prompt is German
function translateCategory(category: string) {
  // Simple dictionary fallback
  const dict: Record<string,string> = {
    vegetarisch: "vegetarian",
    vegan: "vegan",
    dessert: "dessert",
    snack: "snack",
    frühstück: "breakfast",
    mittag: "lunch",
    abend: "dinner",
    grillen: "barbecue",
  };
  return dict[category?.toLowerCase()] || category || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description, ingredients, category } = await req.json();
    if (!openAIApiKey) throw new Error("OPENAI_API_KEY nicht gesetzt");

    // Den Prompt zusammenbauen (so konkret wie möglich)
    let prompt = `A beautifully styled, photorealistic food photograph for a recipe titled "${title}".`;
    if (description) prompt += ` ${description}`;
    if (category) prompt += ` (${translateCategory(category)})`;
    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      prompt += " Ingredients include: " + ingredients.map((i: any) => typeof i === 'string' ? i : i.name).join(", ") + ".";
    }
    // Keywords für DALL-E
    prompt += " High-resolution, natural light, magazine style, no hands, no text, no logo. --ar 16:9";

    // OpenAI image API ansprechen
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model: "dall-e-3",
        n: 1,
        size: "1792x1024",
        response_format: "b64_json",
        quality: "hd",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: "OpenAI image generation failed", details: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    if (!data?.data?.[0]?.b64_json) {
      return new Response(JSON.stringify({ error: "No image returned from OpenAI", details: data }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageB64: data.data[0].b64_json }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
