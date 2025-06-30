import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import gardenBedService from '@/services/GardenBedService';
import { supabase } from '@/integrations/supabase/client';
import type { GardenBed } from '@/types/garden';

const GardenBedManager: React.FC = () => {
  const { toast } = useToast();

  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    if (!userId) return;

    if (!name.trim()) {
      setCreateError('Name ist erforderlich');
      return;
    }

    setCreateError(null);
    setLoading(true);
    try {
      const bed = await gardenBedService.createBed(userId, name.trim(), description.trim());
      setBeds([...beds, bed]);
      setName('');
      setDescription('');
      toast({ title: 'Beet erstellt' });
    } catch (err: any) {
      console.error('Error creating bed:', err);
      toast({ title: 'Fehler', description: err.message || 'Beet konnte nicht erstellt werden', variant: 'destructive' });
      setCreateError('Beet konnte nicht erstellt werden');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await gardenBedService.deleteBed(deleteId);
      setBeds(beds.filter(b => b.id !== deleteId));
      toast({ title: 'Beet gelöscht' });
    } catch (err: any) {
      console.error('Error deleting bed:', err);
      toast({ title: 'Fehler', description: err.message || 'Beet konnte nicht gelöscht werden', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
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
          {createError && <p className="text-sm text-destructive">{createError}</p>}
          <Button onClick={handleCreate} disabled={loading}>{loading ? 'Speichern...' : 'Beet erstellen'}</Button>
        </CardContent>
      </Card>

      {beds.map(bed => (
        <Card key={bed.id} className="border-sage-200" role="article" aria-labelledby={`bed-title-${bed.id}`}> 
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle id={`bed-title-${bed.id}`}>{bed.name}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(bed.id)}
              aria-label={`Beet ${bed.name} löschen`}
              disabled={deleting && deleteId === bed.id}
            >
              {deleting && deleteId === bed.id ? 'Lösche...' : 'Löschen'}
            </Button>
          </CardHeader>
          <CardContent>
            {bed.description && <p className="text-sm text-earth-700 mb-2">{bed.description}</p>}
            <p className="text-sm text-earth-500">{bed.plants.length} Pflanzen</p>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && !deleting && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beet löschen?</DialogTitle>
            <DialogDescription>Dieses Beet wird dauerhaft entfernt.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Abbrechen</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Lösche...' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GardenBedManager;
