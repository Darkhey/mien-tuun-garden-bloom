export interface PlantData {
  id: string;
  name: string;
  type: 'Gemüse' | 'Obst' | 'Kräuter' | 'Blumen';
  season: string[];
  directSow: number[];
  indoor: number[];
  plantOut: number[];
  harvest: number[];
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  notes: string;
  description?: string;
  imageUrl?: string;
  companionPlants?: string[];
  avoidPlants?: string[];
  growingTips?: string[];
  commonProblems?: string[];
}

export interface CompanionPlantData {
  plant: string;
  good: Array<{plant: string, reason: string}>;
  bad: Array<{plant: string, reason: string}>;
}

export interface PlantGrowingTips {
  temperature: string;
  watering: string;
  light: string;
  timing: string;
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  specificTips: string[];
  commonMistakes: string[];
}

export interface SowingCalendarFilters {
  search: string;
  type: string;
  season: string;
  difficulty: string;
  month: string;
  categoryFilter: Record<string, boolean>;
}

export interface SowingCategory {
  key: string;
  color: string;
  label: string;
}