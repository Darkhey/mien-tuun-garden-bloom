
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
        
        return data as unknown as PlantData[];
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
          .single();
        
        if (error) {
          console.error(`Error fetching plant with ID ${id}:`, error);
          return null;
        }
        
        return data as unknown as PlantData;
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
        
        return data as unknown as PlantData[];
      } catch (error) {
        console.error(`Error in searchPlants:`, error);
        return [];
      }
    });
  }

  clearCache(): void {
    this.cache.clear();
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
