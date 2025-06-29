import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import gardenBedService from '@/services/GardenBedService';
import { supabase } from '@/integrations/supabase/client';
import type { GardenBed } from '@/types/garden';

const GardenBedManager: React.FC = () => {
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      try {
        const userBeds = await gardenBedService.getBedsForUser(user.id);
        setBeds(userBeds);
      } catch (err) {
        console.error('Error loading beds:', err);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!userId || !name.trim()) return;
    setLoading(true);
    try {
      const bed = await gardenBedService.createBed(userId, name.trim(), description.trim());
      setBeds([...beds, bed]);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('Error creating bed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Beet wirklich löschen?')) return;
    try {
      await gardenBedService.deleteBed(id);
      setBeds(beds.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting bed:', err);
    }
  };

  if (!userId) {
    return <p className="text-center">Bitte einloggen, um Beete zu verwalten.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Neues Beet anlegen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name des Beets"
          />
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Beschreibung (optional)"
          />
          <Button onClick={handleCreate} disabled={loading}>Beet erstellen</Button>
        </CardContent>
      </Card>

      {beds.map(bed => (
        <Card key={bed.id} className="border-sage-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{bed.name}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleDelete(bed.id)}>Löschen</Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-earth-700 mb-2">{bed.description}</p>
            <p className="text-sm text-earth-500">{bed.plants.length} Pflanzen</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GardenBedManager;
