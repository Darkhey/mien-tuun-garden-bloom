
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// Manuelle Vorgaben und Listen (kann feinjustiert werden)
const TOPIC_KEYWORDS = [
  "Gartenideen", "Saisonale Küche", "Nachhaltigkeit", "Ernte", "Saatgut-Tipps", "Kräuter", "DIY Garten", "Regionales"
];
const SEASONS = ["Frühling", "Sommer", "Herbst", "Winter", "Ganzjährig"];
const CATEGORIES = [
  "Gartenplanung", "Saisonale Küche", "Nachhaltigkeit", "DIY Projekte", "Ernte", "Selbstversorgung", "Tipps & Tricks", "Sonstiges"
];
const AUTHORS = ["Anna", "Mia", "Tom", "GartenAI"];

const TAGS = [
  "Garten", "Rezept", "Saisonal", "Tipps", "Trends", "Bio", "DIY"
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Hilfsfunktion: Slug erzeugen
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Hilfsfunktion: Bild generieren via OpenAI
async function generateImage({ theme, category, season, trend }) {
  // Prompt als kurzer deutscher Satz, sehr bildlich & hyperrealistisch
  const basePrompt = `Hyperrealistisches, stimmungsvolles Garten- oder Küchenbild passend zum Thema "${theme}" (${category}, ${season}, Trend: ${trend}). Natürliches Licht, viel Atmosphäre, hochwertiger Fotografie-Stil. Ohne Text.`;
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: basePrompt,
      n: 1,
      size: "1024x1024",
      output_format: "png",
      quality: "high",
    }),
  });
  const data = await response.json();
  // Für gpt-image-1: Es kommt base64!
  if (!data.data?.[0]?.b64_json) throw new Error("Bildgenerierung fehlgeschlagen");
  return data.data[0].b64_json;
}

// Hilfsfunktion: Bild im Storage speichern
async function uploadImageToSupabase({ imageB64, fileName }) {
  // Storage: bucket = blog-images
  const supabase = createClient(
    SUPABASE_URL!,
    SERVICE_ROLE_KEY!,
  );
  // base64 zu Uint8Array/Buffer
  const binary = Uint8Array.from(atob(imageB64), c => c.charCodeAt(0));
  // Lade unter: blog-images/<fileName>
  const { data, error } = await supabase
    .storage
    .from("blog-images")
    .upload(fileName, binary, {
      contentType: "image/png",
      upsert: true,
    });
  if (error) throw new Error("Bilder-Upload fehlgeschlagen: " + error.message);
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/blog-images/${fileName}`;
  return publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Thema + Kontext generieren
    const now = new Date();
    const season = getRandom(SEASONS);
    const category = getRandom(CATEGORIES);
    const author = getRandom(AUTHORS);
    const trend = getRandom(TAGS);

    const contextPrompt = `Kategorie: ${category}, Saison: ${season}, Trend: ${trend}. Schreibe einen Blogartikel, der zum Kontext und aktuellen Zeit passt – inspiriere HobbygärtnerInnen oder Kochbegeisterte.`;

    // 2. Themen-Idee mit OpenAI generieren
    const ideaResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Du bist eine deutschsprachige Garten-/Küchenbloggerin. Erfinde ein frisches, trendiges Blogartikel-Thema für diese Rahmenbedingungen (höchstens 10 Worte):" },
          { role: "user", content: contextPrompt }
        ],
        temperature: 0.85,
        max_tokens: 64,
      }),
    });
    const ideaData = await ideaResp.json();
    const topicIdea = ideaData.choices?.[0]?.message?.content?.replace(/["\.]/g,"").trim() || "Neuer Blogartikel";
    
    // 3. Prompt zusammensetzen
    const prompt = `Thema: ${topicIdea}. ${contextPrompt} Schreibe einen originellen, inspirierenden SEO-Blogartikel auf Deutsch. Baue Trends & Saisonalität ein.`;

    // 4. Artikel via OpenAI generieren
    const artResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Du bist eine deutsche Garten-/Küchenbloggerin. Gib einen SEO-optimierten Artikel als Markdown zurück, mit Überschrift und Teaser." },
          { role: "user", content: prompt }
        ],
        temperature: 0.75,
        max_tokens: 1800,
      }),
    });
    const artData = await artResp.json();
    const articleContent = artData.choices?.[0]?.message?.content?.trim() || "Artikel konnte nicht erstellt werden.";

    // 5. Teaser/Excerpt extrahieren (ersten Absatz)
    let excerptMatch = articleContent.split('\n').find(line => line.trim());
    let excerpt = excerptMatch ? excerptMatch.replace(/^#+\s*/, "").slice(0, 160) : "";

    // 6. SEO-Metadaten generieren
    const seoTitle = topicIdea + " | Mien Tuun";
    const seoDescription = excerpt;
    const seoKeywords = [topicIdea, category, season, trend];

    // 7. Slug vorbereiten
    const slug = generateSlug(topicIdea);

    // 8. KI-generiertes Bild erzeugen & hochladen
    let featured_image: string = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop"; // Fallback
    try {
      const imageB64 = await generateImage({ theme: topicIdea, category, season, trend });
      const fileName = `${slug}-${now.getTime()}.png`;
      featured_image = await uploadImageToSupabase({ imageB64, fileName });
    } catch (imgErr) {
      console.error("Fehler bei der KI-Bildgenerierung:", imgErr);
      // Fallback-Bild bleibt gesetzt
    }

    // 9. Speichern via Service Role Key
    const supabase = createClient(
      SUPABASE_URL!,
      SERVICE_ROLE_KEY!,
    );
    const { error } = await supabase.from("blog_posts").insert([{
      slug: slug + "-" + now.getTime(),
      title: topicIdea,
      excerpt,
      content: articleContent,
      author,
      published: true,
      featured: false,
      featured_image,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      tags: [trend],
      category,
      published_at: now.toISOString().slice(0,10),
      reading_time: 5,
      difficulty: "",
      season,
      audiences: ["Automatisch"],
      content_types: ["Inspiration"],
    }]);
    if (error) {
      console.error("Fehler beim Einfügen:", error);
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      status: "success",
      slug,
      title: topicIdea,
      excerpt,
      content: articleContent,
      author,
      featured_image,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[auto-blog-post] Fehler:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
