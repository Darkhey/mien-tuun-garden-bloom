
import { supabase } from '@/integrations/supabase/client';
import type { PlantData, CompanionPlantData, PlantGrowingTips } from '@/types/sowing';

class SowingCalendarService {
  private static instance: SowingCalendarService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): SowingCalendarService {
    if (!SowingCalendarService.instance) {
      SowingCalendarService.instance = new SowingCalendarService();
    }
    return SowingCalendarService.instance;
  }

  private async getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    
    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  async getAllPlants(): Promise<PlantData[]> {
    return this.getCachedOrFetch('all-plants', async () => {
      try {
        const { data, error } = await supabase
          .from('sowing_calendar')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching plants:', error);
          return this.getFallbackPlants();
        }
        
        return this.transformDbToPlantData(data || []);
      } catch (error) {
        console.error('Error in getAllPlants:', error);
        return this.getFallbackPlants();
      }
    });
  }

  async getPlantById(id: string): Promise<PlantData | null> {
    return this.getCachedOrFetch(`plant-${id}`, async () => {
      try {
        const { data, error } = await supabase
          .from('sowing_calendar')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error(`Error fetching plant with ID ${id}:`, error);
          return null;
        }
        
        return data ? this.transformDbRowToPlantData(data) : null;
      } catch (error) {
        console.error(`Error in getPlantById:`, error);
        return null;
      }
    });
  }

  async searchPlants(query: string): Promise<PlantData[]> {
    return this.getCachedOrFetch(`search-${query}`, async () => {
      try {
        const { data, error } = await supabase
          .from('sowing_calendar')
          .select('*')
          .ilike('name', `%${query}%`)
          .order('name');

        if (error) {
          console.error(`Error searching plants for "${query}":`, error);
          return [];
        }

        return this.transformDbToPlantData(data || []);
      } catch (error) {
        console.error(`Error in searchPlants:`, error);
        return [];
      }
    });
  }

  async getCompanionPlants(plantName: string): Promise<CompanionPlantData | null> {
    return this.getCachedOrFetch(`companions-${plantName}`, async () => {
      try {
        const { data, error } = await supabase
          .from('companion_plants')
          .select('*')
          .eq('plant', plantName)
          .maybeSingle();

        if (error) {
          console.error('Error fetching companion plants:', error);
          return null;
        }

        if (!data) return null;
        
        return {
          plant: data.plant,
          good: data.good || [],
          bad: data.bad || []
        } as CompanionPlantData;
      } catch (error) {
        console.error('Error in getCompanionPlants:', error);
        return null;
      }
    });
  }

  async getPlantGrowingTips(plantName: string): Promise<PlantGrowingTips | null> {
    return this.getCachedOrFetch(`tips-${plantName}`, async () => {
      try {
        const { data, error } = await supabase
          .from('plant_growing_tips')
          .select('*')
          .eq('plant', plantName)
          .maybeSingle();

        if (error) {
          console.error('Error fetching growing tips:', error);
          return null;
        }

        if (!data) return null;
        
        return {
          plant: data.plant,
          temperature: data.temperature,
          watering: data.watering,
          light: data.light,
          timing: data.timing,
          difficulty: data.difficulty,
          specificTips: data.specific_tips || [],
          commonMistakes: data.common_mistakes || []
        } as PlantGrowingTips;
      } catch (error) {
        console.error('Error in getPlantGrowingTips:', error);
        return null;
      }
    });
  }

  async addPlant(plant: PlantData): Promise<void> {
    try {
      const { error } = await supabase.from('sowing_calendar').insert([
        {
          name: plant.name,
          type: plant.type,
          season: plant.season,
          direct_sow: plant.directSow,
          indoor: plant.indoor,
          plant_out: plant.plantOut,
          harvest: plant.harvest,
          difficulty: plant.difficulty,
          notes: plant.notes,
          description: plant.description,
          image_url: plant.imageUrl,
          companion_plants: plant.companionPlants ?? [],
          avoid_plants: plant.avoidPlants ?? [],
          growing_tips: plant.growingTips ?? [],
          common_problems: plant.commonProblems ?? []
        }
      ]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Transform database row to PlantData interface
  private transformDbRowToPlantData(row: any): PlantData | null {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      season: row.season || [],
      directSow: row.direct_sow || [],
      indoor: row.indoor || [],
      plantOut: row.plant_out || [],
      harvest: row.harvest || [],
      difficulty: row.difficulty,
      notes: row.notes || '',
      description: row.description,
      imageUrl: row.image_url,
      companionPlants: row.companion_plants || [],
      avoidPlants: row.avoid_plants || [],
      growingTips: row.growing_tips || [],
      commonProblems: row.common_problems || []
    };
  }

  // Transform array of database rows to PlantData array
  private transformDbToPlantData(rows: any[]): PlantData[] {
    return rows.map(row => this.transformDbRowToPlantData(row)).filter((plant): plant is PlantData => plant !== null);
  }

  // Fallback methods for when the database is not available
  private getFallbackPlants(): PlantData[] {
    return [
      {
        id: "1",
        name: "Radieschen",
        type: "Gemüse",
        season: ["Frühling", "Sommer", "Herbst"],
        directSow: [3, 4, 5, 6, 7, 8, 9],
        indoor: [],
        plantOut: [],
        harvest: [4, 5, 6, 7, 8, 9, 10],
        difficulty: "Einfach",
        notes: "Schnellwachsend, ideal für Anfänger"
      },
      {
        id: "2",
        name: "Möhren",
        type: "Gemüse",
        season: ["Frühling", "Sommer", "Herbst"],
        directSow: [3, 4, 5, 6, 7],
        indoor: [],
        plantOut: [],
        harvest: [6, 7, 8, 9, 10, 11],
        difficulty: "Mittel",
        notes: "Gleichmäßig feucht halten, nicht zu dicht säen"
      },
      {
        id: "3",
        name: "Salat",
        type: "Gemüse",
        season: ["Frühling", "Sommer", "Herbst"],
        directSow: [3, 4, 5, 6, 7, 8],
        indoor: [2, 3, 4],
        plantOut: [4, 5, 6],
        harvest: [5, 6, 7, 8, 9, 10],
        difficulty: "Einfach",
        notes: "Lichtkeimer, nur leicht mit Erde bedecken"
      }
    ];
  }
}

export const sowingCalendarService = SowingCalendarService.getInstance();
export default sowingCalendarService;
