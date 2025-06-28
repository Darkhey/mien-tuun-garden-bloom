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
      const { data, error } = await supabase
        .from('sowing_calendar')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching plants:', error);
        return this.getFallbackPlants();
      }
      
      return data as PlantData[];
    });
  }

  async getPlantById(id: string): Promise<PlantData | null> {
    return this.getCachedOrFetch(`plant-${id}`, async () => {
      const { data, error } = await supabase
        .from('sowing_calendar')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching plant with ID ${id}:`, error);
        return null;
      }
      
      return data as PlantData;
    });
  }

  async getCompanionPlants(plantName: string): Promise<CompanionPlantData | null> {
    return this.getCachedOrFetch(`companion-${plantName}`, async () => {
      const { data, error } = await supabase
        .from('companion_plants')
        .select('*')
        .eq('plant', plantName)
        .single();
      
      if (error) {
        console.error(`Error fetching companion plants for ${plantName}:`, error);
        return this.getFallbackCompanionPlants(plantName);
      }
      
      return data as CompanionPlantData;
    });
  }

  async getPlantGrowingTips(plantName: string): Promise<PlantGrowingTips | null> {
    return this.getCachedOrFetch(`tips-${plantName}`, async () => {
      const { data, error } = await supabase
        .from('plant_growing_tips')
        .select('*')
        .eq('plant', plantName)
        .single();
      
      if (error) {
        console.error(`Error fetching growing tips for ${plantName}:`, error);
        return this.getFallbackGrowingTips(plantName);
      }
      
      return data as PlantGrowingTips;
    });
  }

  async searchPlants(query: string): Promise<PlantData[]> {
    return this.getCachedOrFetch(`search-${query}`, async () => {
      const { data, error } = await supabase
        .from('sowing_calendar')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name');
      
      if (error) {
        console.error(`Error searching plants for "${query}":`, error);
        return [];
      }
      
      return data as PlantData[];
    });
  }

  async getPlantsByType(type: string): Promise<PlantData[]> {
    return this.getCachedOrFetch(`type-${type}`, async () => {
      const { data, error } = await supabase
        .from('sowing_calendar')
        .select('*')
        .eq('type', type)
        .order('name');
      
      if (error) {
        console.error(`Error fetching plants of type ${type}:`, error);
        return [];
      }
      
      return data as PlantData[];
    });
  }

  async getPlantsBySeason(season: string): Promise<PlantData[]> {
    return this.getCachedOrFetch(`season-${season}`, async () => {
      const { data, error } = await supabase
        .from('sowing_calendar')
        .select('*')
        .contains('season', [season])
        .order('name');
      
      if (error) {
        console.error(`Error fetching plants for season ${season}:`, error);
        return [];
      }
      
      return data as PlantData[];
    });
  }

  async getPlantsByMonth(month: number): Promise<PlantData[]> {
    return this.getCachedOrFetch(`month-${month}`, async () => {
      const { data, error } = await supabase
        .from('sowing_calendar')
        .select('*')
        .or(`directSow.cs.{${month}},indoor.cs.{${month}},plantOut.cs.{${month}},harvest.cs.{${month}}`)
        .order('name');
      
      if (error) {
        console.error(`Error fetching plants for month ${month}:`, error);
        return [];
      }
      
      return data as PlantData[];
    });
  }

  // Fallback methods for when the database is not available
  private getFallbackPlants(): PlantData[] {
    return SOWING_DATA;
  }

  private getFallbackCompanionPlants(plantName: string): CompanionPlantData | null {
    return COMPANION_PLANTS[plantName] || null;
  }

  private getFallbackGrowingTips(plantName: string): PlantGrowingTips | null {
    return PLANT_GROWING_TIPS[plantName] || null;
  }
}

// Fallback data
const SOWING_DATA: PlantData[] = [
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
  },
  {
    id: "4",
    name: "Tomaten",
    type: "Gemüse",
    season: ["Frühling", "Sommer"],
    directSow: [],
    indoor: [2, 3, 4],
    plantOut: [5, 6],
    harvest: [7, 8, 9, 10],
    difficulty: "Mittel",
    notes: "Wärmebedürftig, nach Eisheiligen auspflanzen"
  },
  {
    id: "5",
    name: "Basilikum",
    type: "Kräuter",
    season: ["Frühling", "Sommer"],
    directSow: [5, 6],
    indoor: [3, 4, 5],
    plantOut: [5, 6],
    harvest: [6, 7, 8, 9],
    difficulty: "Mittel",
    notes: "Wärmebedürftig, regelmäßig entspitzen"
  }
];

const COMPANION_PLANTS: Record<string, CompanionPlantData> = {
  "Tomaten": {
    plant: "Tomaten",
    good: [
      {plant: "Basilikum", reason: "Verbessert den Geschmack und hält Schädlinge wie Weiße Fliegen fern"},
      {plant: "Karotten", reason: "Lockern den Boden und konkurrieren nicht um die gleichen Nährstoffe"},
      {plant: "Zwiebeln", reason: "Halten Blattläuse und andere Schädlinge fern durch ihren intensiven Geruch"}
    ],
    bad: [
      {plant: "Kartoffeln", reason: "Beide Nachtschattengewächse - fördern Krankheitsübertragung wie Kraut- und Braunfäule"},
      {plant: "Fenchel", reason: "Hemmt das Wachstum durch allelopathische Substanzen"}
    ]
  },
  "Karotten": {
    plant: "Karotten",
    good: [
      {plant: "Zwiebeln", reason: "Möhrenfliege wird durch Zwiebelgeruch abgehalten, Zwiebeln profitieren von lockerem Boden"},
      {plant: "Lauch", reason: "Ähnlicher Effekt wie Zwiebeln - hält Möhrenfliege fern"}
    ],
    bad: [
      {plant: "Dill", reason: "Kann das Karottenwachstum hemmen und zieht Möhrenfliege an"}
    ]
  }
};

const PLANT_GROWING_TIPS: Record<string, PlantGrowingTips> = {
  "Tomaten": {
    temperature: "18-25°C optimal, mindestens 15°C nachts",
    watering: "Gleichmäßig feucht, aber nicht nass. Morgens gießen.",
    light: "6-8 Stunden direktes Sonnenlicht täglich",
    timing: "Nach den Eisheiligen (Mitte Mai) auspflanzen",
    difficulty: "Mittel",
    specificTips: [
      "Ausgeizen (Seitentriebe entfernen) für bessere Fruchtentwicklung",
      "Stütze oder Rankhilfe bereits beim Pflanzen anbringen",
      "Mulchen verhindert Krankheiten und hält Feuchtigkeit"
    ],
    commonMistakes: [
      "Zu früh auspflanzen - Frostgefahr!",
      "Blätter beim Gießen benetzen - fördert Krankheiten"
    ]
  },
  "Basilikum": {
    temperature: "20-25°C, sehr wärmebedürftig",
    watering: "Mäßig, nicht über Blätter gießen",
    light: "Volle Sonne, geschützter Standort",
    timing: "Nach Eisheiligen ins Freie",
    difficulty: "Mittel",
    specificTips: [
      "Blütenstände ausbrechen für mehr Blattmasse",
      "Triebspitzen regelmäßig entspitzen",
      "Im Topf überwintern möglich"
    ],
    commonMistakes: [
      "Zu kalt stellen - stirbt ab",
      "Überwässern - Wurzelfäule"
    ]
  }
};

export const sowingCalendarService = SowingCalendarService.getInstance();
export default sowingCalendarService;