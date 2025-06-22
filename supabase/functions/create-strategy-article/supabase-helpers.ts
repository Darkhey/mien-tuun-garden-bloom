// Helper für Supabase-Operationen beim Auto-Blog-Post
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

/**
 * Determines whether a given slug or title already exists in the blog topic history.
 *
 * Checks for duplicates by comparing the base slug (without numeric suffixes) and performing exact and fuzzy (≥85% similarity) title matching.
 *
 * @param slug - The slug to check for duplication
 * @param title - The title to check for duplication
 * @returns `true` if a duplicate slug or title is found; otherwise, `false`
 * @throws If there is an error fetching the topic history from the database
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
  // Fuzzy Title Check (min 85% Ähnlichkeit)
  if (!found && title) {
    found = histSlugs?.some((t: any) => {
      const a = normalize(title), b = normalize(t.title || "");
      if (a.length <= 4 || b.length <= 4) return false;
      const distance = levenshtein(a, b);
      const similarity = 1 - distance / Math.max(a.length, b.length);
      return similarity > 0.85;
    });
  }

  return found;
}

/**
 * Normalizes a string for fuzzy comparison by converting to lowercase, replacing German umlauts and ß with ASCII equivalents, removing non-alphanumeric characters, and trimming whitespace.
 *
 * @param str - The input string to normalize
 * @returns The normalized string suitable for fuzzy matching
 */
function normalize(str: string) {
  return str.toLowerCase().replace(/[äöüß]/g, c =>
    ({'ä':'ae','ö':'oe','ü':'ue','ß':'ss'}[c]||c)
  ).replace(/[^a-z0-9]/g,'').trim();
}

/**
 * Calculates the Levenshtein distance between two strings.
 *
 * The Levenshtein distance is the minimum number of single-character edits (insertions, deletions, or substitutions) required to change one string into the other.
 *
 * @param a - The first string to compare
 * @param b - The second string to compare
 * @returns The Levenshtein distance between `a` and `b`
 */
function levenshtein(a: string, b: string) {
  const matrix: number[][] = [];
  const alen = a.length;
  const blen = b.length;

  for (let i = 0; i <= blen; i++) {
    matrix[i] = [i];
  }
  for (let j = 1; j <= alen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= blen; i++) {
    for (let j = 1; j <= alen; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[blen][alen];
}

/**
 * Checks if a topic idea contains any blacklisted terms from the blog topic blacklist.
 *
 * @param topicIdea - The topic idea to check against the blacklist
 * @returns True if the topic idea contains a blacklisted term; otherwise, false
 * @throws If there is an error loading the blacklist from the database
 */
export async function checkBlacklist(supabase: SupabaseClient, topicIdea: string) {
    const { data: blacklist, error: blacklistError } = await supabase
      .from("blog_topic_blacklist")
      .select("topic");
    if (blacklistError) {
      console.error("Fehler beim Laden der Blacklist:", blacklistError.message);
      throw new Error(`Fehler beim Laden der Blacklist: ${blacklistError.message}`);
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

/**
 * Uploads a base64-encoded PNG image to the Supabase storage bucket and returns its public URL.
 *
 * @param imageB64 - The base64-encoded PNG image data
 * @param fileName - The desired file name for the uploaded image
 * @returns The public URL of the uploaded image
 * @throws If the upload fails or the public URL cannot be retrieved
 */
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

  if (!data || !data.publicUrl) {
    throw new Error("Fehler beim Abrufen der Bild-URL");
  }
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
