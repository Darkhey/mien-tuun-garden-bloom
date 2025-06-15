
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Simple rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // 10 requests per minute
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

    const { keyword } = await req.json()
    
    // Input validation
    if (!keyword || typeof keyword !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid keyword is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Sanitize input
    const sanitizedKeyword = keyword.trim().slice(0, 500); // Limit input length
    
    if (sanitizedKeyword.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keyword cannot be empty' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log security event
    console.log(`Blog topic suggestion request from ${clientId} with keyword: ${sanitizedKeyword.substring(0, 50)}...`);

    // Mock response for now - replace with actual OpenAI integration
    const mockTopics = [
      `${sanitizedKeyword} für Anfänger`,
      `Die besten ${sanitizedKeyword} Tipps`,
      `${sanitizedKeyword} Schritt für Schritt`,
      `Warum ${sanitizedKeyword} so wichtig ist`,
      `${sanitizedKeyword} Fehler vermeiden`
    ];

    return new Response(
      JSON.stringify({ topics: mockTopics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in suggest-blog-topics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
