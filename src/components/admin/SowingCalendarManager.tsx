import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Save, X, Calendar, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { PlantData } from '@/types/sowing';

const SowingCalendarManager: React.FC = () => {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlant, setEditingPlant] = useState<PlantData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load plants on mount
  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sowing_calendar')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPlants(data || []);
    } catch (err) {
      console.error('Error loading plants:', err);
      toast({
        title: "Fehler",
        description: "Pflanzen konnten nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlant = () => {
    setEditingPlant({
      id: '',
      name: '',
      type: 'Gemüse',
      season: ['Frühling'],
      directSow: [],
      indoor: [],
      plantOut: [],
      harvest: [],
      difficulty: 'Mittel',
      notes: ''
    });
    setIsCreating(true);
  };

  const handleEditPlant = (plant: PlantData) => {
    setEditingPlant({...plant});
    setIsCreating(false);
  };

  const handleDeletePlant = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Pflanze löschen möchten?')) return;
    
    try {
      const { error } = await supabase
        .from('sowing_calendar')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Erfolg",
        description: "Pflanze wurde gelöscht"
      });
      
      loadPlants();
    } catch (err) {
      console.error('Error deleting plant:', err);
      toast({
        title: "Fehler",
        description: "Pflanze konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleSavePlant = async () => {
    if (!editingPlant) return;
    
    setIsSaving(true);
    try {
      if (isCreating) {
        // Create new plant
        const { error } = await supabase
          .from('sowing_calendar')
          .insert([{
            name: editingPlant.name,
            type: editingPlant.type,
            season: editingPlant.season,
            direct_sow: editingPlant.directSow,
            indoor: editingPlant.indoor,
            plant_out: editingPlant.plantOut,
            harvest: editingPlant.harvest,
            difficulty: editingPlant.difficulty,
            notes: editingPlant.notes
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Neue Pflanze wurde erstellt"
        });
      } else {
        // Update existing plant
        const { error } = await supabase
          .from('sowing_calendar')
          .update({
            name: editingPlant.name,
            type: editingPlant.type,
            season: editingPlant.season,
            direct_sow: editingPlant.directSow,
            indoor: editingPlant.indoor,
            plant_out: editingPlant.plantOut,
            harvest: editingPlant.harvest,
            difficulty: editingPlant.difficulty,
            notes: editingPlant.notes
          })
          .eq('id', editingPlant.id);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Pflanze wurde aktualisiert"
        });
      }
      
      setEditingPlant(null);
      loadPlants();
    } catch (err) {
      console.error('Error saving plant:', err);
      toast({
        title: "Fehler",
        description: "Pflanze konnte nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlant(null);
  };

  const handleInputChange = (field: keyof PlantData, value: any) => {
    if (!editingPlant) return;
    
    setEditingPlant({
      ...editingPlant,
      [field]: value
    });
  };

  const handleArrayInputChange = (field: keyof PlantData, value: string) => {
    if (!editingPlant) return;
    
    try {
      const arrayValue = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
      setEditingPlant({
        ...editingPlant,
        [field]: arrayValue
      });
    } catch (err) {
      console.error('Error parsing array input:', err);
    }
  };

  const handleSeasonChange = (value: string) => {
    if (!editingPlant) return;
    
    const seasons = editingPlant.season || [];
    const index = seasons.indexOf(value);
    
    if (index === -1) {
      setEditingPlant({
        ...editingPlant,
        season: [...seasons, value]
      });
    } else {
      setEditingPlant({
        ...editingPlant,
        season: seasons.filter(s => s !== value)
      });
    }
  };

  const filteredPlants = plants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sage-100 rounded-lg">
            <Calendar className="h-6 w-6 text-sage-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aussaatkalender Verwaltung</h1>
            <p className="text-gray-600">Verwalten Sie die Pflanzen im Aussaatkalender</p>
          </div>
        </div>
        <Button onClick={handleCreatePlant}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Pflanze
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Pflanzen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Edit Form */}
      {editingPlant && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Neue Pflanze erstellen' : `Pflanze bearbeiten: ${editingPlant.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editingPlant.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Typ</label>
                <Select 
                  value={editingPlant.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gemüse">Gemüse</SelectItem>
                    <SelectItem value="Obst">Obst</SelectItem>
                    <SelectItem value="Kräuter">Kräuter</SelectItem>
                    <SelectItem value="Blumen">Blumen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Schwierigkeit</label>
                <Select 
                  value={editingPlant.difficulty} 
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Einfach">Einfach</SelectItem>
                    <SelectItem value="Mittel">Mittel</SelectItem>
                    <SelectItem value="Schwer">Schwer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Saison</label>
                <div className="flex flex-wrap gap-2">
                  {['Frühling', 'Sommer', 'Herbst', 'Winter'].map(season => (
                    <Badge 
                      key={season}
                      variant={editingPlant.season.includes(season) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleSeasonChange(season)}
                    >
                      {season}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Aussaat draußen (Monate, z.B. 3,4,5)</label>
                <Input
                  value={editingPlant.directSow.join(', ')}
                  onChange={(e) => handleArrayInputChange('directSow', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Vorziehen (Monate, z.B. 2,3,4)</label>
                <Input
                  value={editingPlant.indoor.join(', ')}
                  onChange={(e) => handleArrayInputChange('indoor', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Auspflanzen (Monate, z.B. 5,6)</label>
                <Input
                  value={editingPlant.plantOut.join(', ')}
                  onChange={(e) => handleArrayInputChange('plantOut', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ernte (Monate, z.B. 7,8,9)</label>
                <Input
                  value={editingPlant.harvest.join(', ')}
                  onChange={(e) => handleArrayInputChange('harvest', e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notizen</label>
                <Textarea
                  value={editingPlant.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
              <Button onClick={handleSavePlant} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pflanzen im Aussaatkalender</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Keine Pflanzen gefunden
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Schwierigkeit</TableHead>
                    <TableHead>Saison</TableHead>
                    <TableHead>Aussaat</TableHead>
                    <TableHead>Ernte</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlants.map((plant) => (
                    <TableRow key={plant.id}>
                      <TableCell className="font-medium">{plant.name}</TableCell>
                      <TableCell>{plant.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          plant.difficulty === 'Einfach' ? 'bg-green-100 text-green-800' :
                          plant.difficulty === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {plant.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {plant.season.map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plant.directSow.length > 0 ? (
                          <span className="text-xs">
                            {plant.directSow.sort((a, b) => a - b).join(', ')}
                          </span>
                        ) : plant.indoor.length > 0 ? (
                          <span className="text-xs text-blue-600">
                            Vorziehen: {plant.indoor.sort((a, b) => a - b).join(', ')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {plant.harvest.length > 0 ? (
                          <span className="text-xs">
                            {plant.harvest.sort((a, b) => a - b).join(', ')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditPlant(plant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeletePlant(plant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SowingCalendarManager;