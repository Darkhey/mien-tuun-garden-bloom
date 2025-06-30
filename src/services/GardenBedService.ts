import { supabase } from '@/integrations/supabase/client';
import type { GardenBed } from '@/types/garden';

class GardenBedService {
  async getBedsForUser(userId: string): Promise<GardenBed[]> {
    if (!userId?.trim()) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('garden_beds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching beds:', error);
      throw new Error(error.message);
    }
    return data as GardenBed[];
  }

  async createBed(userId: string, name: string, description = ''): Promise<GardenBed> {
    if (!userId?.trim()) {
      throw new Error('User ID is required');
    }

    if (!name?.trim()) {
      throw new Error('Bed name is required');
    }

    const { data, error } = await supabase
      .from('garden_beds')
      .insert({ user_id: userId, name: name.trim(), description: description.trim(), plants: [] })
      .select()
      .single();
    if (error) {
      console.error('Error creating bed:', error);
      throw new Error(error.message);
    }
    return data as GardenBed;
  }

  async updateBed(id: string, updates: Partial<GardenBed>): Promise<GardenBed> {
    if (!id?.trim()) {
      throw new Error('Bed ID is required');
    }

    const allowedFields = ['name', 'description', 'plants'] as const;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) =>
        allowedFields.includes(key as typeof allowedFields[number])
      )
    );

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const { data, error } = await supabase
      .from('garden_beds')
      .update(filteredUpdates)
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
    if (!id?.trim()) {
      throw new Error('Bed ID is required');
    }

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
    if (!bedId?.trim() || !plantId?.trim()) {
      throw new Error('Bed ID and Plant ID are required');
    }

    const { data: updated, error } = await supabase.rpc('add_plant_to_bed', {
      bed_id: bedId,
      plant_id: plantId
    });

    if (error) {
      console.error('Error updating bed plants:', error);
      throw new Error(error.message);
    }
    return updated as GardenBed;
  }

  async removePlantFromBed(bedId: string, plantId: string): Promise<GardenBed> {
    if (!bedId?.trim() || !plantId?.trim()) {
      throw new Error('Bed ID and Plant ID are required');
    }

    const { data: updated, error } = await supabase.rpc('remove_plant_from_bed', {
      bed_id: bedId,
      plant_id: plantId
    });

    if (error) {
      console.error('Error updating bed plants:', error);
      throw new Error(error.message);
    }
    return updated as GardenBed;
  }
}

export const gardenBedService = new GardenBedService();
export default gardenBedService;

