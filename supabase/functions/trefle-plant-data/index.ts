import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TREFLE_API_TOKEN = Deno.env.get("TREFLE_API_TOKEN");
const TREFLE_API_BASE = "https://trefle.io/api/v1";

// Cache for API responses to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TREFLE_API_TOKEN) {
      throw new Error("Trefle API token not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, query, plantId, page = 1, limit = 20 } = await req.json();
    console.log(`[trefle-plant-data] Processing ${action} request`);

    switch (action) {
      case 'search':
        return await searchPlants(query, page, limit);
      
      case 'getPlantDetails':
        return await getPlantDetails(plantId);
      
      case 'syncToDatabase':
        return await syncToDatabase(supabaseClient);
      
      case 'getPlantsByFilter':
        return await getPlantsByFilter(query);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('[trefle-plant-data] Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function searchPlants(query: string, page: number, limit: number) {
  const cacheKey = `search:${query}:${page}:${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(
      JSON.stringify(cached.data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(`${TREFLE_API_BASE}/plants/search`);
    url.searchParams.append('token', TREFLE_API_TOKEN!);
    url.searchParams.append('q', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trefle API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Process and transform the data
    const transformedData = {
      plants: data.data.map((plant: any) => ({
        id: plant.id,
        scientific_name: plant.scientific_name,
        common_name: plant.common_name,
        family: plant.family,
        image_url: plant.image_url,
        year: plant.year,
        family_common_name: plant.family_common_name,
      })),
      meta: data.meta,
      links: data.links,
    };
    
    // Cache the result
    cache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[trefle-plant-data] Search error:', error);
    throw error;
  }
}

async function getPlantDetails(plantId: string) {
  const cacheKey = `plant:${plantId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(
      JSON.stringify(cached.data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(`${TREFLE_API_BASE}/plants/${plantId}`);
    url.searchParams.append('token', TREFLE_API_TOKEN!);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trefle API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Process and transform the data
    const plantData = data.data;
    const transformedData = {
      id: plantData.id,
      scientific_name: plantData.scientific_name,
      common_name: plantData.common_name,
      family: plantData.family,
      family_common_name: plantData.family_common_name,
      image_url: plantData.image_url,
      synonyms: plantData.synonyms,
      year: plantData.year,
      bibliography: plantData.bibliography,
      author: plantData.author,
      
      // Growth data
      growth: {
        days_to_harvest: plantData.main_species?.specifications?.growth_period,
        minimum_temperature: {
          deg_c: plantData.main_species?.growth?.minimum_temperature?.deg_c,
          deg_f: plantData.main_species?.growth?.minimum_temperature?.deg_f,
        },
        maximum_temperature: {
          deg_c: plantData.main_species?.growth?.maximum_temperature?.deg_c,
          deg_f: plantData.main_species?.growth?.maximum_temperature?.deg_f,
        },
        soil_humidity: plantData.main_species?.growth?.soil_humidity,
        soil_nutriments: plantData.main_species?.growth?.soil_nutriments,
        soil_salinity: plantData.main_species?.growth?.soil_salinity,
        soil_texture: plantData.main_species?.growth?.soil_texture,
        soil_ph_minimum: plantData.main_species?.growth?.ph_minimum,
        soil_ph_maximum: plantData.main_species?.growth?.ph_maximum,
        light: plantData.main_species?.growth?.light,
        atmospheric_humidity: plantData.main_species?.growth?.atmospheric_humidity,
        growth_months: plantData.main_species?.growth?.growth_months,
        bloom_months: plantData.main_species?.growth?.bloom_months,
        fruit_months: plantData.main_species?.growth?.fruit_months,
        row_spacing: {
          cm: plantData.main_species?.growth?.row_spacing?.cm,
          in: plantData.main_species?.growth?.row_spacing?.in,
        },
        spread: {
          cm: plantData.main_species?.growth?.spread?.cm,
          in: plantData.main_species?.growth?.spread?.in,
        },
        sowing_method: plantData.main_species?.growth?.sowing,
      },
      
      // Specifications
      specifications: {
        ligneous_type: plantData.main_species?.specifications?.ligneous_type,
        growth_form: plantData.main_species?.specifications?.growth_form,
        growth_habit: plantData.main_species?.specifications?.growth_habit,
        growth_rate: plantData.main_species?.specifications?.growth_rate,
        edible: plantData.main_species?.specifications?.edible,
        vegetable: plantData.main_species?.specifications?.vegetable,
        edible_part: plantData.main_species?.specifications?.edible_part,
        edible_use: plantData.main_species?.specifications?.edible_use,
        medicinal: plantData.main_species?.specifications?.medicinal,
        toxicity: plantData.main_species?.specifications?.toxicity,
      },
      
      // Distributions
      distributions: {
        native: plantData.main_species?.distributions?.native,
        introduced: plantData.main_species?.distributions?.introduced,
      },
    };
    
    // Cache the result
    cache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[trefle-plant-data] Plant details error:', error);
    throw error;
  }
}

async function getPlantsByFilter(filters: any) {
  const { edible, vegetable, category, page = 1, limit = 20 } = filters;
  
  const cacheKey = `filter:${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(
      JSON.stringify(cached.data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(`${TREFLE_API_BASE}/plants`);
    url.searchParams.append('token', TREFLE_API_TOKEN!);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    if (edible !== undefined) {
      url.searchParams.append('filter[edible]', edible ? 'true' : 'false');
    }
    
    if (vegetable !== undefined) {
      url.searchParams.append('filter[vegetable]', vegetable ? 'true' : 'false');
    }
    
    if (category) {
      url.searchParams.append('filter[family_common_name]', category);
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trefle API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Process and transform the data
    const transformedData = {
      plants: data.data.map((plant: any) => ({
        id: plant.id,
        scientific_name: plant.scientific_name,
        common_name: plant.common_name,
        family: plant.family,
        image_url: plant.image_url,
        year: plant.year,
        family_common_name: plant.family_common_name,
      })),
      meta: data.meta,
      links: data.links,
    };
    
    // Cache the result
    cache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[trefle-plant-data] Filter error:', error);
    throw error;
  }
}

async function syncToDatabase(supabaseClient: any) {
  try {
    // Get edible plants
    const url = new URL(`${TREFLE_API_BASE}/plants`);
    url.searchParams.append('token', TREFLE_API_TOKEN!);
    url.searchParams.append('filter[edible]', 'true');
    url.searchParams.append('page', '1');
    url.searchParams.append('limit', '100');
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trefle API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Process plants and insert into database
    const plants = [];
    
    for (const plant of data.data) {
      // Get detailed plant information
      const detailsUrl = new URL(`${TREFLE_API_BASE}/plants/${plant.id}`);
      detailsUrl.searchParams.append('token', TREFLE_API_TOKEN!);
      
      const detailsResponse = await fetch(detailsUrl.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!detailsResponse.ok) {
        console.warn(`Could not get details for plant ${plant.id}`);
        continue;
      }
      
      const detailsData = await detailsResponse.json();
      const plantDetails = detailsData.data;
      
      // Map to our database schema
      const plantEntry = {
        name: plantDetails.common_name || plantDetails.scientific_name,
        type: plantDetails.main_species?.specifications?.vegetable ? 'Gemüse' : 
              plantDetails.main_species?.specifications?.edible_part?.includes('flowers') ? 'Blumen' : 
              'Kräuter',
        season: determineSeason(plantDetails),
        direct_sow: determineDirectSowMonths(plantDetails),
        indoor: determineIndoorMonths(plantDetails),
        plant_out: determinePlantOutMonths(plantDetails),
        harvest: determineHarvestMonths(plantDetails),
        difficulty: determineDifficulty(plantDetails),
        notes: generateNotes(plantDetails),
        description: plantDetails.main_species?.specifications?.edible_use || '',
        image_url: plantDetails.image_url,
        companion_plants: [],
        avoid_plants: [],
        growing_tips: generateGrowingTips(plantDetails),
        common_problems: []
      };
      
      plants.push(plantEntry);
      
      // Avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Insert plants into database
    if (plants.length > 0) {
      const { data: insertedData, error: insertError } = await supabaseClient
        .from('sowing_calendar')
        .upsert(plants, { onConflict: 'name' })
        .select('id, name');
      
      if (insertError) {
        throw insertError;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${insertedData.length} plants to database`,
          plants: insertedData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No plants to sync'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[trefle-plant-data] Sync error:', error);
    throw error;
  }
}

// Helper functions to map Trefle data to our schema

function determineSeason(plantDetails: any): string[] {
  const seasons = [];
  const growthMonths = plantDetails.main_species?.growth?.growth_months || [];
  
  // Spring: March-May (3-5)
  if (growthMonths.some((m: number) => m >= 3 && m <= 5)) {
    seasons.push('Frühling');
  }
  
  // Summer: June-August (6-8)
  if (growthMonths.some((m: number) => m >= 6 && m <= 8)) {
    seasons.push('Sommer');
  }
  
  // Fall: September-November (9-11)
  if (growthMonths.some((m: number) => m >= 9 && m <= 11)) {
    seasons.push('Herbst');
  }
  
  // Winter: December-February (12, 1-2)
  if (growthMonths.some((m: number) => m === 12 || (m >= 1 && m <= 2))) {
    seasons.push('Winter');
  }
  
  // Default to all seasons if no specific growth months
  if (seasons.length === 0) {
    return ['Frühling', 'Sommer', 'Herbst', 'Winter'];
  }
  
  return seasons;
}

function determineDirectSowMonths(plantDetails: any): number[] {
  // Check if direct sowing is recommended
  const sowingMethod = plantDetails.main_species?.growth?.sowing;
  if (sowingMethod !== 'direct') {
    return [];
  }
  
  // Use growth months as a proxy for direct sowing months
  const growthMonths = plantDetails.main_species?.growth?.growth_months || [];
  
  // Adjust for typical sowing (usually 1-2 months before growth)
  return growthMonths.map((month: number) => {
    const sowingMonth = month - 2;
    return sowingMonth <= 0 ? sowingMonth + 12 : sowingMonth;
  });
}

function determineIndoorMonths(plantDetails: any): number[] {
  // Check if indoor sowing is recommended
  const sowingMethod = plantDetails.main_species?.growth?.sowing;
  if (sowingMethod !== 'indirect') {
    return [];
  }
  
  // Use growth months as a proxy for indoor sowing months
  const growthMonths = plantDetails.main_species?.growth?.growth_months || [];
  
  // Adjust for typical indoor sowing (usually 2-3 months before growth)
  return growthMonths.map((month: number) => {
    const sowingMonth = month - 3;
    return sowingMonth <= 0 ? sowingMonth + 12 : sowingMonth;
  });
}

function determinePlantOutMonths(plantDetails: any): number[] {
  // Check if indoor sowing is recommended (plant out is only relevant for indoor sown plants)
  const sowingMethod = plantDetails.main_species?.growth?.sowing;
  if (sowingMethod !== 'indirect') {
    return [];
  }
  
  // Use growth months as a proxy for plant out months
  const growthMonths = plantDetails.main_species?.growth?.growth_months || [];
  
  // Adjust for typical plant out (usually 1 month before growth)
  return growthMonths.map((month: number) => {
    const plantOutMonth = month - 1;
    return plantOutMonth <= 0 ? plantOutMonth + 12 : plantOutMonth;
  });
}

function determineHarvestMonths(plantDetails: any): number[] {
  // Use fruit months as harvest months if available
  if (plantDetails.main_species?.growth?.fruit_months && plantDetails.main_species?.growth?.fruit_months.length > 0) {
    return plantDetails.main_species?.growth?.fruit_months;
  }
  
  // Otherwise use bloom months as a proxy
  if (plantDetails.main_species?.growth?.bloom_months && plantDetails.main_species?.growth?.bloom_months.length > 0) {
    return plantDetails.main_species?.growth?.bloom_months;
  }
  
  // Default to growth months + 3 months if neither fruit nor bloom months are available
  const growthMonths = plantDetails.main_species?.growth?.growth_months || [];
  return growthMonths.map((month: number) => {
    const harvestMonth = month + 3;
    return harvestMonth > 12 ? harvestMonth - 12 : harvestMonth;
  });
}

function determineDifficulty(plantDetails: any): string {
  // Determine difficulty based on various factors
  let difficultyScore = 0;
  
  // Check temperature requirements
  const minTemp = plantDetails.main_species?.growth?.minimum_temperature?.deg_c;
  const maxTemp = plantDetails.main_species?.growth?.maximum_temperature?.deg_c;
  
  if (minTemp !== null && minTemp !== undefined && minTemp > 10) {
    difficultyScore += 1; // Higher minimum temperature requirement increases difficulty
  }
  
  // Check soil requirements
  const soilHumidity = plantDetails.main_species?.growth?.soil_humidity;
  const soilNutriments = plantDetails.main_species?.growth?.soil_nutriments;
  const soilSalinity = plantDetails.main_species?.growth?.soil_salinity;
  
  if (soilHumidity > 7 || soilNutriments > 7 || soilSalinity > 7) {
    difficultyScore += 1; // Specific soil requirements increase difficulty
  }
  
  // Check light requirements
  const light = plantDetails.main_species?.growth?.light;
  if (light > 8) {
    difficultyScore += 1; // High light requirement increases difficulty
  }
  
  // Check atmospheric humidity
  const atmosphericHumidity = plantDetails.main_species?.growth?.atmospheric_humidity;
  if (atmosphericHumidity > 7) {
    difficultyScore += 1; // High humidity requirement increases difficulty
  }
  
  // Map score to difficulty
  if (difficultyScore >= 3) {
    return 'Schwer';
  } else if (difficultyScore >= 1) {
    return 'Mittel';
  } else {
    return 'Einfach';
  }
}

function generateNotes(plantDetails: any): string {
  const notes = [];
  
  // Add edible parts
  if (plantDetails.main_species?.specifications?.edible_part) {
    notes.push(`Essbare Teile: ${plantDetails.main_species?.specifications?.edible_part.join(', ')}`);
  }
  
  // Add edible use
  if (plantDetails.main_species?.specifications?.edible_use) {
    notes.push(plantDetails.main_species?.specifications?.edible_use);
  }
  
  // Add growth habit
  if (plantDetails.main_species?.specifications?.growth_habit) {
    notes.push(`Wuchsform: ${plantDetails.main_species?.specifications?.growth_habit}`);
  }
  
  // Add toxicity warning if applicable
  if (plantDetails.main_species?.specifications?.toxicity) {
    notes.push(`Achtung: ${plantDetails.main_species?.specifications?.toxicity}`);
  }
  
  return notes.join('. ');
}

function generateGrowingTips(plantDetails: any): string[] {
  const tips = [];
  
  // Temperature tip
  const minTemp = plantDetails.main_species?.growth?.minimum_temperature?.deg_c;
  const maxTemp = plantDetails.main_species?.growth?.maximum_temperature?.deg_c;
  
  if (minTemp !== null && minTemp !== undefined) {
    tips.push(`Mindesttemperatur: ${minTemp}°C`);
  }
  
  if (maxTemp !== null && maxTemp !== undefined) {
    tips.push(`Maximale Temperatur: ${maxTemp}°C`);
  }
  
  // Soil tip
  const soilHumidity = plantDetails.main_species?.growth?.soil_humidity;
  if (soilHumidity !== null && soilHumidity !== undefined) {
    if (soilHumidity < 4) {
      tips.push('Bevorzugt trockenen Boden');
    } else if (soilHumidity < 7) {
      tips.push('Bevorzugt mäßig feuchten Boden');
    } else {
      tips.push('Bevorzugt feuchten Boden');
    }
  }
  
  // Light tip
  const light = plantDetails.main_species?.growth?.light;
  if (light !== null && light !== undefined) {
    if (light < 4) {
      tips.push('Gedeiht im Schatten');
    } else if (light < 7) {
      tips.push('Bevorzugt Halbschatten');
    } else {
      tips.push('Benötigt volle Sonne');
    }
  }
  
  // Spacing tip
  const rowSpacing = plantDetails.main_species?.growth?.row_spacing?.cm;
  if (rowSpacing !== null && rowSpacing !== undefined) {
    tips.push(`Reihenabstand: ${rowSpacing} cm`);
  }
  
  // Spread tip
  const spread = plantDetails.main_species?.growth?.spread?.cm;
  if (spread !== null && spread !== undefined) {
    tips.push(`Pflanzabstand: ${spread} cm`);
  }
  
  return tips;
}