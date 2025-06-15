
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

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

export async function isDuplicate(supabase: SupabaseClient, slug: string) {
    const { data: existingPosts, error: postsError } = await supabase
      .from("blog_posts")
      .select("slug,title")
      .order("published_at", { ascending: false })
      .limit(20);

    if (postsError) {
      console.error("Fehler beim Laden bestehender Artikel:", postsError);
      throw new Error(`Fehler beim Laden bestehender Artikel: ${postsError.message}`);
    }

    return existingPosts?.some((post: any) => {
      const postSlugMain = post.slug.replace(/-\d+$/, "");
      return postSlugMain === slug;
    });
}

export async function saveBlogPost(supabase: SupabaseClient, postData: any) {
    const { error } = await supabase.from("blog_posts").insert([postData]);
    if (error) {
        console.error("Fehler beim Einfügen:", error);
        throw new Error(`Fehler beim Einfügen: ${error.message}`);
    }
}
