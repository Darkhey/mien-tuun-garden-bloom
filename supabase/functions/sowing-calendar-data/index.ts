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

    const { action, plantName, data } = await req.json();

    console.log(`[SowingCalendarData] Processing ${action} request`);

    switch (action) {
      case 'getAllPlants':
        return await getAllPlants(supabaseClient);
      
      case 'getPlantById':
        return await getPlantById(supabaseClient, data.id);
      
      case 'getCompanionPlants':
        return await getCompanionPlants(supabaseClient, plantName);
      
      case 'getPlantGrowingTips':
        return await getPlantGrowingTips(supabaseClient, plantName);
      
      case 'searchPlants':
        return await searchPlants(supabaseClient, data.query);
      
      case 'getPlantsByType':
        return await getPlantsByType(supabaseClient, data.type);
      
      case 'getPlantsBySeason':
        return await getPlantsBySeason(supabaseClient, data.season);
      
      case 'getPlantsByMonth':
        return await getPlantsByMonth(supabaseClient, data.month);
      
      case 'getPlantDetails':
        return await getPlantDetails(supabaseClient, data.plantName);
      
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
    console.error('[SowingCalendarData] Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getAllPlants(supabase: any) {
  const { data, error } = await supabase
    .from('sowing_calendar')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ plants: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPlantById(supabase: any, id: string) {
  const { data, error } = await supabase
    .from('sowing_calendar')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ plant: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getCompanionPlants(supabase: any, plantName: string) {
  const { data, error } = await supabase
    .from('companion_plants')
    .select('*')
    .eq('plant', plantName)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ companionPlants: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    throw error;
  }
  
  return new Response(
    JSON.stringify({ companionPlants: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPlantGrowingTips(supabase: any, plantName: string) {
  const { data, error } = await supabase
    .from('plant_growing_tips')
    .select('*')
    .eq('plant', plantName)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ growingTips: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    throw error;
  }
  
  return new Response(
    JSON.stringify({ growingTips: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function searchPlants(supabase: any, query: string) {
  const { data, error } = await supabase
    .from('sowing_calendar')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name');
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ plants: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPlantsByType(supabase: any, type: string) {
  const { data, error } = await supabase
    .from('sowing_calendar')
    .select('*')
    .eq('type', type)
    .order('name');
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ plants: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPlantsBySeason(supabase: any, season: string) {
  const { data, error } = await supabase
    .from('sowing_calendar')
    .select('*')
    .contains('season', [season])
    .order('name');
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ plants: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPlantsByMonth(supabase: any, month: number) {
  const { data, error } = await supabase
    .from('sowing_calendar')
    .select('*')
    .or(`direct_sow.cs.{${month}},indoor.cs.{${month}},plant_out.cs.{${month}},harvest.cs.{${month}}`)
    .order('name');
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ plants: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPlantDetails(supabase: any, plantName: string) {
  // Get all details for a specific plant from multiple tables
  const [plantData, companionData, tipsData] = await Promise.all([
    supabase
      .from('sowing_calendar')
      .select('*')
      .eq('name', plantName)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }),
    supabase
      .from('companion_plants')
      .select('*')
      .eq('plant', plantName)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }),
    supabase
      .from('plant_growing_tips')
      .select('*')
      .eq('plant', plantName)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      })
  ]);
  
  if (!plantData) {
    return new Response(
      JSON.stringify({ error: 'Plant not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({
      plant: plantData,
      companionPlants: companionData,
      growingTips: tipsData
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}