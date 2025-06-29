import { supabase } from '@/integrations/supabase/client';
import type { GardenBed } from '@/types/garden';

class GardenBedService {
  async getBedsForUser(userId: string): Promise<GardenBed[]> {
    const { data, error } = await supabase
      .from('garden_beds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    if (error) {
      console.error('Error fetching beds:', error);
      throw new Error(error.message);
    }
    return data as GardenBed[];
  }

  async createBed(userId: string, name: string, description = ''): Promise<GardenBed> {
    const { data, error } = await supabase
      .from('garden_beds')
      .insert({ user_id: userId, name, description, plants: [] })
      .select()
      .single();
    if (error) {
      console.error('Error creating bed:', error);
      throw new Error(error.message);
    }
    return data as GardenBed;
  }

  async updateBed(id: string, updates: Partial<GardenBed>): Promise<GardenBed> {
    const { data, error } = await supabase
      .from('garden_beds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating bed:', error);
      throw new Error(error.message);
    }
    return data as GardenBed;
  }

  async deleteBed(id: string): Promise<void> {
    const { error } = await supabase
      .from('garden_beds')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting bed:', error);
      throw new Error(error.message);
    }
  }

  async addPlantToBed(bedId: string, plantId: string): Promise<GardenBed> {
    const { data, error } = await supabase
      .from('garden_beds')
      .select('plants')
      .eq('id', bedId)
      .single();
    if (error) {
      console.error('Error loading bed:', error);
      throw new Error(error.message);
    }

    const plants: string[] = data?.plants || [];
    if (!plants.includes(plantId)) {
      plants.push(plantId);
    }

    const { data: updated, error: updateError } = await supabase
      .from('garden_beds')
      .update({ plants })
      .eq('id', bedId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating bed plants:', updateError);
      throw new Error(updateError.message);
    }
    return updated as GardenBed;
  }

  async removePlantFromBed(bedId: string, plantId: string): Promise<GardenBed> {
    const { data, error } = await supabase
      .from('garden_beds')
      .select('plants')
      .eq('id', bedId)
      .single();
    if (error) {
      console.error('Error loading bed:', error);
      throw new Error(error.message);
    }

    const plants: string[] = data?.plants || [];
    const filtered = plants.filter((p) => p !== plantId);

    const { data: updated, error: updateError } = await supabase
      .from('garden_beds')
      .update({ plants: filtered })
      .eq('id', bedId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating bed plants:', updateError);
      throw new Error(updateError.message);
    }
    return updated as GardenBed;
  }
}

export const gardenBedService = new GardenBedService();
export default gardenBedService;

