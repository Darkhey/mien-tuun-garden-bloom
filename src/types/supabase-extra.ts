import type { Database } from '@/integrations/supabase/types'

export interface SowingCalendarRow {
  id: string
  name: string
  type: 'Gemüse' | 'Obst' | 'Kräuter' | 'Blumen'
  season: string[]
  direct_sow: number[]
  indoor: number[]
  plant_out: number[]
  harvest: number[]
  difficulty: 'Einfach' | 'Mittel' | 'Schwer'
  notes: string | null
  description: string | null
  image_url: string | null
  companion_plants: string[] | null
  avoid_plants: string[] | null
  growing_tips: string[] | null
  common_problems: string[] | null
  created_at: string
  updated_at: string
}

export interface CompanionPlantRow {
  id: string
  plant: string
  good: Array<{ plant: string; reason: string }>
  bad: Array<{ plant: string; reason: string }>
  created_at: string
  updated_at: string
}

export interface PlantGrowingTipsRow {
  id: string
  plant: string
  temperature: string | null
  watering: string | null
  light: string | null
  timing: string | null
  difficulty: 'Einfach' | 'Mittel' | 'Schwer'
  specific_tips: string[] | null
  common_mistakes: string[] | null
  created_at: string
  updated_at: string
}

export type ExtendedDatabase = Omit<Database, 'public'> & {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      sowing_calendar: {
        Row: SowingCalendarRow
        Insert: SowingCalendarRow
        Update: Partial<SowingCalendarRow>
      }
      companion_plants: {
        Row: CompanionPlantRow
        Insert: CompanionPlantRow
        Update: Partial<CompanionPlantRow>
      }
      plant_growing_tips: {
        Row: PlantGrowingTipsRow
        Insert: PlantGrowingTipsRow
        Update: Partial<PlantGrowingTipsRow>
      }
    }
  }
}
