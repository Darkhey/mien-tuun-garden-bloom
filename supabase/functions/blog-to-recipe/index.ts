
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Simple rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // 5 requests per minute for recipe generation
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Basic rate limiting
    const clientId = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { blogContent, blogTitle } = await req.json()
    
    // Input validation
    if (!blogContent || typeof blogContent !== 'string' || !blogTitle || typeof blogTitle !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid blog content and title are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Sanitize and limit input
    const sanitizedContent = blogContent.trim().slice(0, 10000); // Limit content length
    const sanitizedTitle = blogTitle.trim().slice(0, 200); // Limit title length
    
    if (sanitizedContent.length === 0 || sanitizedTitle.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Blog content and title cannot be empty' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log security event
    console.log(`Recipe generation request from ${clientId} for blog: ${sanitizedTitle.substring(0, 50)}...`);

    // Mock response for now - replace with actual implementation
    const mockRecipe = {
      title: `Rezept basierend auf: ${sanitizedTitle}`,
      description: "Ein köstliches Rezept inspiriert von dem Blog-Artikel",
      ingredients: [
        { name: "Zutat 1", amount: "200g" },
        { name: "Zutat 2", amount: "1 Stück" }
      ],
      instructions: [
        "Schritt 1: Zutaten vorbereiten",
        "Schritt 2: Kochen und genießen"
      ],
      prepTime: 30,
      cookTime: 45,
      servings: 4
    };

    return new Response(
      JSON.stringify({ recipe: mockRecipe }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in blog-to-recipe:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
