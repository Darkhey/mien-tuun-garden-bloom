
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const instagramAccessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { blogPostId, caption, imageUrl } = await req.json();

    console.log('Instagram post request:', { blogPostId, imageUrl: !!imageUrl });

    if (!blogPostId || !caption) {
      throw new Error('Blog Post ID und Caption sind erforderlich');
    }

    if (!instagramAccessToken) {
      throw new Error('Instagram Access Token nicht konfiguriert');
    }

    // Get blog post details
    const { data: blogPost, error: blogError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', blogPostId)
      .single();

    if (blogError || !blogPost) {
      throw new Error('Blog Post nicht gefunden');
    }

    // Check if already posted to Instagram
    const { data: existingPost } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('blog_post_id', blogPostId)
      .single();

    if (existingPost && existingPost.status === 'posted') {
      throw new Error('Dieser Artikel wurde bereits auf Instagram geteilt');
    }

    // Create Instagram post record
    const { data: instagramRecord, error: recordError } = await supabase
      .from('instagram_posts')
      .upsert({
        blog_post_id: blogPostId,
        caption: caption,
        image_url: imageUrl || blogPost.featured_image,
        status: 'processing',
        scheduled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (recordError) {
      console.error('Error creating Instagram record:', recordError);
      throw new Error('Fehler beim Erstellen des Instagram-Eintrags');
    }

    // Get Instagram User ID first
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id&access_token=${instagramAccessToken}`
    );

    if (!userResponse.ok) {
      throw new Error('Fehler beim Abrufen der Instagram User ID');
    }

    const userData = await userResponse.json();
    const instagramUserId = userData.id;

    console.log('Instagram User ID:', instagramUserId);

    // Step 1: Create media container (for single image post)
    const mediaUrl = imageUrl || blogPost.featured_image;
    
    if (!mediaUrl) {
      throw new Error('Kein Bild für Instagram Post verfügbar');
    }

    console.log('Creating media container with image:', mediaUrl);

    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramUserId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          image_url: mediaUrl,
          caption: caption,
          access_token: instagramAccessToken
        })
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      console.error('Container creation error:', errorData);
      throw new Error(`Fehler beim Erstellen des Media Containers: ${errorData.error?.message || 'Unbekannter Fehler'}`);
    }

    const containerData = await containerResponse.json();
    const creationId = containerData.id;

    console.log('Media container created:', creationId);

    // Step 2: Publish the media container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramUserId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          creation_id: creationId,
          access_token: instagramAccessToken
        })
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      console.error('Publish error:', errorData);
      throw new Error(`Fehler beim Veröffentlichen: ${errorData.error?.message || 'Unbekannter Fehler'}`);
    }

    const publishData = await publishResponse.json();
    const mediaId = publishData.id;

    console.log('Instagram post published successfully:', mediaId);

    // Update record as posted
    const { error: updateError } = await supabase
      .from('instagram_posts')
      .update({
        status: 'posted',
        instagram_id: mediaId,
        posted_at: new Date().toISOString()
      })
      .eq('id', instagramRecord.id);

    if (updateError) {
      console.error('Error updating Instagram record:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post erfolgreich auf Instagram veröffentlicht',
        instagramId: mediaId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Instagram post error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unbekannter Fehler beim Instagram-Post'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
