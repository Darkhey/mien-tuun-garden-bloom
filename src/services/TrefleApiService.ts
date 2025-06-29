import { supabase } from '@/integrations/supabase/client';
import type { TreflePlant, TreflePlantDetails, TrefleSearchResponse, TrefleFilterOptions } from '@/types/trefle';

class TrefleApiService {
  private static instance: TrefleApiService;

  public static getInstance(): TrefleApiService {
    if (!TrefleApiService.instance) {
      TrefleApiService.instance = new TrefleApiService();
    }
    return TrefleApiService.instance;
  }

  async searchPlants(query: string, page: number = 1, limit: number = 20): Promise<TrefleSearchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('trefle-plant-data', {
        body: { 
          action: 'search',
          query,
          page,
          limit
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching plants:', error);
      throw new Error(`Failed to search plants: ${error.message}`);
    }
  }

  async getPlantDetails(plantId: number): Promise<TreflePlantDetails> {
    try {
      const { data, error } = await supabase.functions.invoke('trefle-plant-data', {
        body: { 
          action: 'getPlantDetails',
          plantId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error getting plant details for ID ${plantId}:`, error);
      throw new Error(`Failed to get plant details: ${error.message}`);
    }
  }

  async getPlantsByFilter(filters: TrefleFilterOptions): Promise<TrefleSearchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('trefle-plant-data', {
        body: { 
          action: 'getPlantsByFilter',
          query: filters
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error filtering plants:', error);
      throw new Error(`Failed to filter plants: ${error.message}`);
    }
  }

  async syncToDatabase(): Promise<{ success: boolean; message: string; plants?: any[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('trefle-plant-data', {
        body: { 
          action: 'syncToDatabase'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing plants to database:', error);
      throw new Error(`Failed to sync plants: ${error.message}`);
    }
  }

  // Helper method to map Trefle data to our sowing calendar format
  mapToSowingCalendarFormat(plant: TreflePlantDetails): any {
    // Determine plant type
    let type = 'Gemüse';
    if (plant.specifications.vegetable) {
      type = 'Gemüse';
    } else if (plant.specifications.edible_part?.includes('flowers')) {
      type = 'Blumen';
    } else if (plant.specifications.edible) {
      type = 'Kräuter';
    }

    // Determine seasons
    const seasons = [];
    const growthMonths = plant.growth.growth_months || [];
    
    // Spring: March-May (3-5)
    if (growthMonths.some(m => m >= 3 && m <= 5)) {
      seasons.push('Frühling');
    }
    
    // Summer: June-August (6-8)
    if (growthMonths.some(m => m >= 6 && m <= 8)) {
      seasons.push('Sommer');
    }
    
    // Fall: September-November (9-11)
    if (growthMonths.some(m => m >= 9 && m <= 11)) {
      seasons.push('Herbst');
    }
    
    // Winter: December-February (12, 1-2)
    if (growthMonths.some(m => m === 12 || (m >= 1 && m <= 2))) {
      seasons.push('Winter');
    }

    // Determine difficulty
    let difficulty = 'Mittel';
    const minTemp = plant.growth.minimum_temperature?.deg_c;
    const soilHumidity = plant.growth.soil_humidity;
    const light = plant.growth.light;
    
    let difficultyScore = 0;
    
    if (minTemp !== null && minTemp !== undefined && minTemp > 10) {
      difficultyScore += 1;
    }
    
    if (soilHumidity !== null && soilHumidity !== undefined && soilHumidity > 7) {
      difficultyScore += 1;
    }
    
    if (light !== null && light !== undefined && light > 8) {
      difficultyScore += 1;
    }
    
    if (difficultyScore >= 2) {
      difficulty = 'Schwer';
    } else if (difficultyScore === 0) {
      difficulty = 'Einfach';
    }

    // Generate notes
    const notes = [];
    
    if (plant.specifications.edible_part) {
      notes.push(`Essbare Teile: ${plant.specifications.edible_part.join(', ')}`);
    }
    
    if (plant.specifications.edible_use) {
      notes.push(plant.specifications.edible_use);
    }
    
    if (plant.specifications.toxicity) {
      notes.push(`Achtung: ${plant.specifications.toxicity}`);
    }

    return {
      name: plant.common_name || plant.scientific_name,
      type,
      season: seasons,
      directSow: this.determineSowingMonths(plant, 'direct'),
      indoor: this.determineSowingMonths(plant, 'indoor'),
      plantOut: this.determinePlantOutMonths(plant),
      harvest: this.determineHarvestMonths(plant),
      difficulty,
      notes: notes.join('. '),
      description: plant.specifications.edible_use || '',
      image_url: plant.image_url,
      companion_plants: [],
      avoid_plants: [],
      growing_tips: this.generateGrowingTips(plant),
      common_problems: []
    };
  }

  private determineSowingMonths(plant: TreflePlantDetails, method: 'direct' | 'indoor'): number[] {
    const sowingMethod = plant.growth.sowing_method;
    
    // If sowing method doesn't match, return empty array
    if ((method === 'direct' && sowingMethod !== 'direct') || 
        (method === 'indoor' && sowingMethod !== 'indirect')) {
      return [];
    }
    
    // Use growth months as a proxy for sowing months
    const growthMonths = plant.growth.growth_months || [];
    
    // Adjust for typical sowing times
    const offset = method === 'direct' ? 2 : 3;
    
    return growthMonths.map(month => {
      const sowingMonth = month - offset;
      return sowingMonth <= 0 ? sowingMonth + 12 : sowingMonth;
    });
  }

  private determinePlantOutMonths(plant: TreflePlantDetails): number[] {
    // Plant out is only relevant for indoor sown plants
    if (plant.growth.sowing_method !== 'indirect') {
      return [];
    }
    
    // Use growth months as a proxy for plant out months
    const growthMonths = plant.growth.growth_months || [];
    
    // Adjust for typical plant out times (usually 1 month before growth)
    return growthMonths.map(month => {
      const plantOutMonth = month - 1;
      return plantOutMonth <= 0 ? plantOutMonth + 12 : plantOutMonth;
    });
  }

  private determineHarvestMonths(plant: TreflePlantDetails): number[] {
    // Use fruit months as harvest months if available
    if (plant.growth.fruit_months && plant.growth.fruit_months.length > 0) {
      return plant.growth.fruit_months;
    }
    
    // Otherwise use bloom months as a proxy
    if (plant.growth.bloom_months && plant.growth.bloom_months.length > 0) {
      return plant.growth.bloom_months;
    }
    
    // Default to growth months + 3 months if neither fruit nor bloom months are available
    const growthMonths = plant.growth.growth_months || [];
    return growthMonths.map(month => {
      const harvestMonth = month + 3;
      return harvestMonth > 12 ? harvestMonth - 12 : harvestMonth;
    });
  }

  private generateGrowingTips(plant: TreflePlantDetails): string[] {
    const tips = [];
    
    // Temperature tip
    const minTemp = plant.growth.minimum_temperature?.deg_c;
    const maxTemp = plant.growth.maximum_temperature?.deg_c;
    
    if (minTemp !== null && minTemp !== undefined) {
      tips.push(`Mindesttemperatur: ${minTemp}°C`);
    }
    
    if (maxTemp !== null && maxTemp !== undefined) {
      tips.push(`Maximale Temperatur: ${maxTemp}°C`);
    }
    
    // Soil tip
    const soilHumidity = plant.growth.soil_humidity;
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
    const light = plant.growth.light;
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
    const rowSpacing = plant.growth.row_spacing?.cm;
    if (rowSpacing !== null && rowSpacing !== undefined) {
      tips.push(`Reihenabstand: ${rowSpacing} cm`);
    }
    
    // Spread tip
    const spread = plant.growth.spread?.cm;
    if (spread !== null && spread !== undefined) {
      tips.push(`Pflanzabstand: ${spread} cm`);
    }
    
    return tips;
  }
}

export const trefleApiService = TrefleApiService.getInstance();
export default trefleApiService;