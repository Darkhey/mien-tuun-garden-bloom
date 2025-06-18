import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { configId, action } = await req.json();

    console.log(`[ContentAutomationExecutor] Processing request - configId: ${configId}, action: ${action}`);

    if (action === 'execute') {
      // Get configuration details
      const { data: config, error: configError } = await supabaseClient
        .from('content_automation_configs')
        .select('*')
        .eq('id', configId)
        .single();

      if (configError || !config) {
        throw new Error(`Configuration not found: ${configId}`);
      }

      if (!config.is_active) {
        throw new Error(`Configuration is disabled: ${configId}`);
      }

      // Create execution log
      const { data: logData, error: logError } = await supabaseClient
        .from('content_automation_logs')
        .insert({
          config_id: configId,
          action: 'execute_automation',
          status: 'success',
          details: {
            started_at: new Date().toISOString(),
            config_name: config.name
          }
        })
        .select('id')
        .single();

      if (logError) {
        throw new Error(`Failed to create log: ${logError.message}`);
      }

      // Execute the automation process
      const result = await executeAutomation(supabaseClient, config);

      // Update log with results
      await supabaseClient
        .from('content_automation_logs')
        .update({
          details: {
            ...logData.details,
            completed_at: new Date().toISOString(),
            result
          }
        })
        .eq('id', logData.id);

      return new Response(
        JSON.stringify({
          success: true,
          result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('[ContentAutomationExecutor] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function executeAutomation(supabaseClient: any, config: any) {
  // This is a placeholder for the actual automation process
  // In a real implementation, this would:
  // 1. Select a category based on configuration
  // 2. Generate content using AI
  // 3. Create images
  // 4. Apply SEO optimization
  // 5. Save to database
  
  console.log(`[ContentAutomationExecutor] Executing automation for config: ${config.name}`);
  
  // Simulate the process
  const configData = config.config;
  const categories = configData.categories || [];
  
  if (categories.length === 0) {
    throw new Error('No categories configured');
  }
  
  // Select a random category
  const randomCategoryObj = categories[Math.floor(Math.random() * categories.length)];
  const category = Object.keys(randomCategoryObj)[0];
  const priority = randomCategoryObj[category];
  
  // Get tags for this category
  const tags = configData.category_tags?.[category] || [];
  
  // Generate a title (simulated)
  const titles = [
    "10 Tipps für deinen Garten im Sommer",
    "Nachhaltige Gartengestaltung leicht gemacht",
    "Die besten Pflanzen für deinen Balkon",
    "Saisonale Rezepte mit Zutaten aus dem eigenen Garten",
    "DIY-Projekte für deinen Garten"
  ];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  // Generate content (simulated)
  const content = `# ${title}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n## Abschnitt 1\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n## Abschnitt 2\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
  
  // Generate excerpt
  const excerpt = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  
  // Generate image URL (simulated)
  const images = [
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586093728648-04db0bd4c827?w=1200&h=600&fit=crop"
  ];
  const featuredImage = images[Math.floor(Math.random() * images.length)];
  
  // Generate slug
  const slug = title.toLowerCase()
    .replace(/[äöüÄÖÜ]/g, match => {
      return {
        'ä': 'ae', 'ö': 'oe', 'ü': 'ue',
        'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue'
      }[match] || match;
    })
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now();
  
  // Calculate quality score (simulated)
  const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100
  
  // Prepare blog post data
  const blogPostData = {
    slug,
    title,
    content,
    excerpt,
    category,
    tags,
    status: configData.approval?.immediate_publishing ? 'veröffentlicht' : 'entwurf',
    published: configData.approval?.immediate_publishing,
    featured_image: featuredImage,
    author: "Content Automation",
    reading_time: Math.ceil(content.split(/\s+/).length / 200),
    seo_title: title,
    seo_description: excerpt,
    seo_keywords: tags,
    content_types: ["blog"],
    audiences: ["anfaenger"],
    season: getCurrentSeason(),
    automation_config_id: config.id,
    quality_score: qualityScore,
    engagement_score: 0,
    published_at: new Date().toISOString()
  };
  
  // Insert blog post
  const { data: blogPost, error: blogPostError } = await supabaseClient
    .from('blog_posts')
    .insert([blogPostData])
    .select('id')
    .single();
    
  if (blogPostError) {
    throw new Error(`Failed to create blog post: ${blogPostError.message}`);
  }
  
  return {
    blog_post_id: blogPost.id,
    title,
    slug,
    category,
    quality_score: qualityScore,
    status: blogPostData.status
  };
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "frühling";
  if (month >= 6 && month <= 8) return "sommer";
  if (month >= 9 && month <= 11) return "herbst";
  return "winter";
}