
// Helper für Supabase-Operationen beim Auto-Blog-Post
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

/**
 * Stellt fest, ob ein Slug oder Titel bereits in der kompletten History vorhanden ist.
 * Optionale fuzzy Logik: auch Titel-Ähnlichkeit ab 85% als Duplikat zählen.
 */
export async function isDuplicate(supabase: SupabaseClient, slug: string, title: string) {
  // Prüfe Slug
  const { data: histSlugs, error: hSlugErr } = await supabase
    .from("blog_topic_history")
    .select("slug, title");

  if (hSlugErr) {
    console.error("Fehler beim Lesen der topic_history:", hSlugErr);
    throw new Error(`Fehler beim Lesen der History: ${hSlugErr.message}`);
  }

  // Slug exakte Übereinstimmung (mit Suffix-Entfernung)
  const baseSlug = slug.replace(/-\d+$/, "");
  let found = histSlugs?.some((t: any) => t.slug.replace(/-\d+$/, "") === baseSlug);

  // Titel exakt
  if (!found && title) {
    found = histSlugs?.some((t: any) => t.title.trim().toLowerCase() === title.trim().toLowerCase());
  }
  // Fuzzy Title Check (min 85% Ähnlichkeit, einfachster Ansatz: Levenshtein)
  if (!found && title) {
    found = histSlugs?.some((t: any) => {
      const a = normalize(title), b = normalize(t.title || "");
      return a.length > 4 && b.length > 4 && levenshtein(a, b) / Math.max(a.length, b.length) > 0.85;
    });
  }

  return found;
}

// Normalisiert Zeichen für Fuzzy-Vergleich
function normalize(str: string) {
  return str.toLowerCase().replace(/[äöüß]/g, c =>
    ({'ä':'ae','ö':'oe','ü':'ue','ß':'ss'}[c]||c)
  ).replace(/[^a-z0-9]/g,'').trim();
}

// Einfache Levenshtein-Distanz (liefert Zahl der gleichen Zeichen am ANFANG)
function levenshtein(a: string, b: string) {
  let i = 0, max = Math.min(a.length, b.length);
  while (i < max && a[i] === b[i]) i++;
  return i;
}

export async function checkBlacklist(supabase: SupabaseClient, topicIdea: string) {
    const { data: blacklist, error: blacklistError } = await supabase
      .from("blog_topic_blacklist")
      .select("topic");
    if (blacklistError) {
      console.error("Fehler beim Laden der Blacklist:", blacklistError.message);
      return false;
    }
    if (blacklist?.length) {
      const isBlacklisted = blacklist.some((item: any) =>
        topicIdea.toLowerCase().includes(item.topic.toLowerCase())
      );
      return isBlacklisted;
    }
    return false;
}

export async function saveBlogPost(supabase: SupabaseClient, postData: any) {
    const { error } = await supabase.from("blog_posts").insert([postData]);
    if (error) {
        console.error("Fehler beim Einfügen:", error);
        throw new Error(`Fehler beim Einfügen: ${error.message}`);
    }
}

export async function uploadImageToSupabase({ supabase, imageB64, fileName }: { supabase: SupabaseClient, imageB64: string, fileName: string }) {
  const binary = Uint8Array.from(atob(imageB64), c => c.charCodeAt(0));
  const { error } = await supabase
    .storage
    .from("blog-images")
    .upload(fileName, binary, {
      contentType: "image/png",
      upsert: true,
    });
  if (error) throw new Error("Bilder-Upload fehlgeschlagen: " + error.message);

  const { data } = supabase
    .storage
    .from("blog-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// Für Logging von Themenversuchen (Punkt 1.1)
export async function logTopicAttempt(supabase: SupabaseClient, { slug, title, used_in_post, reason, try_count, context }: any) {
    const { error } = await supabase.from("blog_topic_history").insert([{
      slug, title, used_in_post: used_in_post || null, reason, try_count: try_count || 1, context: context ? JSON.stringify(context) : null
    }]);
    if (error) {
      console.error("Fehler beim Protokollieren des Themas:", error);
    }
}
