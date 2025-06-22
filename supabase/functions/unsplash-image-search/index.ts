
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!UNSPLASH_ACCESS_KEY) {
    return new Response(
      JSON.stringify({ error: "Unsplash API key not configured" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const { query, page = 1, perPage = 10, orientation = 'landscape' } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Search for photos on Unsplash
    const searchUrl = new URL("https://api.unsplash.com/search/photos");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("page", page.toString());
    searchUrl.searchParams.set("per_page", perPage.toString());
    searchUrl.searchParams.set("orientation", orientation);

    const response = await fetch(searchUrl.toString(), {
      headers: {
        "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response to match our UnsplashImage interface
    const transformedResults = data.results?.map((photo: any) => ({
      id: photo.id,
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
      },
      alt_description: photo.alt_description || photo.description || "",
      description: photo.description || "",
      user: {
        name: photo.user.name,
        username: photo.user.username,
      },
    })) || [];

    return new Response(
      JSON.stringify({
        results: transformedResults,
        total: data.total || 0,
        total_pages: data.total_pages || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unsplash search error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to search images",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
