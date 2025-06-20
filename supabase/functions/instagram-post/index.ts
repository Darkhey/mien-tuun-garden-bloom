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

    // For now, we'll simulate posting to Instagram
    // In a real implementation, you would:
    // 1. Upload image to Instagram
    // 2. Create media container
    // 3. Publish the post
    
    console.log('Simulating Instagram post with caption:', caption.substring(0, 100) + '...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update record as posted
    const { error: updateError } = await supabase
      .from('instagram_posts')
      .update({
        status: 'posted',
        instagram_id: `sim_${Date.now()}`, // Simulated Instagram post ID
        posted_at: new Date().toISOString()
      })
      .eq('id', instagramRecord.id);

    if (updateError) {
      console.error('Error updating Instagram record:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post erfolgreich auf Instagram geteilt (Simulation)',
        instagramId: `sim_${Date.now()}`
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