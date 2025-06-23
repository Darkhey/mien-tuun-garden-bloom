
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Verwende den Business API Token für Instagram Posting
const instagramAccessToken = Deno.env.get('INSTAGRAM_BUSINESS_ACCESS_TOKEN');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { blogPostId, caption, imageUrl } = await req.json();

    console.log('Instagram post request:', { blogPostId, imageUrl: !!imageUrl, hasBusinessToken: !!instagramAccessToken });

    if (!blogPostId || !caption) {
      throw new Error('Blog Post ID und Caption sind erforderlich');
    }

    if (!instagramAccessToken) {
      console.error('Instagram Business Access Token nicht konfiguriert');
      throw new Error('Instagram Business Access Token nicht konfiguriert. Bitte konfiguriere den INSTAGRAM_BUSINESS_ACCESS_TOKEN in den Supabase Secrets.');
    }

    // Get blog post details
    const { data: blogPost, error: blogError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', blogPostId)
      .single();

    if (blogError || !blogPost) {
      console.error('Blog post not found:', blogError);
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

    console.log('Starting Instagram Business API calls...');

    // Step 1: Debug - Test token validity first
    console.log('Testing token validity...');
    const tokenTestResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${instagramAccessToken}`
    );
    
    if (!tokenTestResponse.ok) {
      const errorText = await tokenTestResponse.text();
      console.error('Token test failed:', tokenTestResponse.status, errorText);
      throw new Error(`Token ist ungültig: ${tokenTestResponse.status} - ${errorText}`);
    }
    
    const tokenData = await tokenTestResponse.json();
    console.log('Token test successful. User/Page:', tokenData);

    // Step 2: Get all pages managed by this token
    console.log('Fetching all managed pages...');
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account&access_token=${instagramAccessToken}`
    );

    if (!pagesResponse.ok) {
      const errorText = await pagesResponse.text();
      console.error('Pages fetch error:', pagesResponse.status, errorText);
      throw new Error(`Fehler beim Abrufen der Facebook Pages: ${pagesResponse.status} - ${errorText}`);
    }

    const pagesData = await pagesResponse.json();
    console.log('Pages response:', JSON.stringify(pagesData, null, 2));

    // Find the Instagram Business Account
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error('Keine Facebook Pages gefunden. Stelle sicher, dass der Token für eine Facebook Page generiert wurde.');
    }

    let instagramAccount = null;
    let pageName = '';
    
    for (const page of pagesData.data) {
      console.log(`Checking page: ${page.name} (ID: ${page.id})`);
      if (page.instagram_business_account) {
        instagramAccount = page.instagram_business_account;
        pageName = page.name;
        console.log(`Found Instagram Business Account on page "${pageName}":`, instagramAccount);
        break;
      }
    }
    
    if (!instagramAccount) {
      const availablePages = pagesData.data.map(p => `"${p.name}" (${p.id})`).join(', ');
      throw new Error(`Kein Instagram Business Account gefunden. Verfügbare Facebook Pages: ${availablePages}. Stelle sicher, dass mindestens eine Page mit einem Instagram Business Account verknüpft ist.`);
    }

    const instagramAccountId = instagramAccount.id;
    console.log(`Using Instagram Business Account ID: ${instagramAccountId} from page: ${pageName}`);

    // Step 3: Create media container (for single image post)
    const mediaUrl = imageUrl || blogPost.featured_image;
    
    if (!mediaUrl) {
      throw new Error('Kein Bild für Instagram Post verfügbar');
    }

    console.log('Creating media container with image:', mediaUrl);

    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
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

    const containerData = await containerResponse.json();
    console.log('Container response:', containerResponse.status, containerData);

    if (!containerResponse.ok) {
      console.error('Container creation error:', containerData);
      throw new Error(`Fehler beim Erstellen des Media Containers: ${containerData.error?.message || 'Unbekannter Fehler'}`);
    }

    const creationId = containerData.id;
    console.log('Media container created:', creationId);

    // Step 4: Publish the media container
    console.log('Publishing media container...');
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
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

    const publishData = await publishResponse.json();
    console.log('Publish response:', publishResponse.status, publishData);

    if (!publishResponse.ok) {
      console.error('Publish error:', publishData);
      throw new Error(`Fehler beim Veröffentlichen: ${publishData.error?.message || 'Unbekannter Fehler'}`);
    }

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
