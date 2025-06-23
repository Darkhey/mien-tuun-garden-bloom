
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

export async function uploadImageToSupabase({ supabase, imageB64, fileName }: {
  supabase: any;
  imageB64: string;
  fileName: string;
}): Promise<string> {
  console.log(`[supabase-helpers] Starting image upload: ${fileName}`);
  
  try {
    // Convert base64 to Uint8Array
    const imageData = Uint8Array.from(atob(imageB64), c => c.charCodeAt(0));
    console.log(`[supabase-helpers] Image data size: ${imageData.length} bytes`);

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, imageData, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`[supabase-helpers] Storage upload error:`, error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    console.log(`[supabase-helpers] Image uploaded successfully: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error(`[supabase-helpers] Image upload failed:`, error);
    throw error;
  }
}

export async function saveBlogPost(supabase: any, postData: any): Promise<any> {
  console.log(`[supabase-helpers] Saving blog post: ${postData.slug}`);
  
  try {
    // Prüfe erst, ob ein Artikel mit diesem Slug bereits existiert
    const { data: existing, error: checkError } = await supabase
      .from('blog_posts')
      .select('id, slug')
      .eq('slug', postData.slug)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`[supabase-helpers] Error checking existing post:`, checkError);
      throw new Error(`Database check failed: ${checkError.message}`);
    }

    if (existing) {
      console.log(`[supabase-helpers] Post with slug ${postData.slug} already exists, updating...`);
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error(`[supabase-helpers] Update error:`, error);
        throw new Error(`Database update failed: ${error.message}`);
      }

      console.log(`[supabase-helpers] Post updated successfully: ${data.id}`);
      return data;
    } else {
      console.log(`[supabase-helpers] Creating new post...`);
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        console.error(`[supabase-helpers] Insert error:`, error);
        throw new Error(`Database insert failed: ${error.message}`);
      }

      console.log(`[supabase-helpers] Post created successfully: ${data.id}`);
      return data;
    }
  } catch (error) {
    console.error(`[supabase-helpers] saveBlogPost failed:`, error);
    throw error;
  }
}
