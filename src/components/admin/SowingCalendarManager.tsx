
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Edit, Trash2, Save, X, Calendar, Search, Leaf, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { PlantData, CompanionPlantData, PlantGrowingTips } from '@/types/sowing';

const SowingCalendarManager: React.FC = () => {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [companionPlants, setCompanionPlants] = useState<CompanionPlantData[]>([]);
  const [growingTips, setGrowingTips] = useState<PlantGrowingTips[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlant, setEditingPlant] = useState<PlantData | null>(null);
  const [editingCompanion, setEditingCompanion] = useState<CompanionPlantData | null>(null);
  const [editingTips, setEditingTips] = useState<PlantGrowingTips | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('plants');
  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load plants
      const { data: plantsData, error: plantsError } = await supabase
        .from('sowing_calendar')
        .select('*')
        .order('name');
      
      if (plantsError) throw plantsError;
      
      // Transform database format to interface format
      const transformedPlants = Array.isArray(plantsData) ? plantsData.map((plant: any) => ({
        id: plant.id,
        name: plant.name,
        type: plant.type,
        season: plant.season || [],
        directSow: plant.direct_sow || [],
        indoor: plant.indoor || [],
        plantOut: plant.plant_out || [],
        harvest: plant.harvest || [],
        difficulty: plant.difficulty,
        notes: plant.notes || '',
        description: plant.description || '',
        companionPlants: plant.companion_plants || [],
        avoidPlants: plant.avoid_plants || [],
        growingTips: plant.growing_tips || [],
        commonProblems: plant.common_problems || []
      })) : [];
      
      setPlants(transformedPlants);

      // Load companion plants
      const { data: companionData, error: companionError } = await supabase
        .from('companion_plants')
        .select('*')
        .order('plant');
      
      if (companionError) throw companionError;
      
      // Transform database format to interface format  
      const transformedCompanions = Array.isArray(companionData) ? companionData.map((companion: any) => ({
        plant: companion.plant,
        good: companion.good || [],
        bad: companion.bad || []
      })) : [];
      
      setCompanionPlants(transformedCompanions);

      // Load growing tips
      const { data: tipsData, error: tipsError } = await supabase
        .from('plant_growing_tips')
        .select('*')
        .order('plant');
      
      if (tipsError) throw tipsError;
      
      // Transform database format to interface format
      const transformedTips = Array.isArray(tipsData) ? tipsData.map((tip: any) => ({
        plant: tip.plant,
        temperature: tip.temperature,
        watering: tip.watering,
        light: tip.light,
        timing: tip.timing,
        difficulty: tip.difficulty,
        specificTips: tip.specific_tips || [],
        commonMistakes: tip.common_mistakes || []
      })) : [];
      
      setGrowingTips(transformedTips);
    } catch (err) {
      console.error('Error loading data:', err);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Plant CRUD operations
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
      notes: '',
      description: '',
      companionPlants: [],
      avoidPlants: [],
      growingTips: [],
      commonProblems: []
    });
    setIsCreating(true);
    setActiveTab('plants');
  };

  const handleEditPlant = (plant: PlantData) => {
    setEditingPlant({...plant});
    setIsCreating(false);
    setActiveTab('plants');
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
      
      loadData();
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
            direct_sow: editingPlant.directSow || [],
            indoor: editingPlant.indoor || [],
            plant_out: editingPlant.plantOut || [],
            harvest: editingPlant.harvest || [],
            difficulty: editingPlant.difficulty,
            notes: editingPlant.notes,
            description: editingPlant.description,
            companion_plants: editingPlant.companionPlants || [],
            avoid_plants: editingPlant.avoidPlants || [],
            growing_tips: editingPlant.growingTips || [],
            common_problems: editingPlant.commonProblems || []
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
            direct_sow: editingPlant.directSow || [],
            indoor: editingPlant.indoor || [],
            plant_out: editingPlant.plantOut || [],
            harvest: editingPlant.harvest || [],
            difficulty: editingPlant.difficulty,
            notes: editingPlant.notes,
            description: editingPlant.description,
            companion_plants: editingPlant.companionPlants || [],
            avoid_plants: editingPlant.avoidPlants || [],
            growing_tips: editingPlant.growingTips || [],
            common_problems: editingPlant.commonProblems || []
          })
          .eq('id', editingPlant.id);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Pflanze wurde aktualisiert"
        });
      }
      
      setEditingPlant(null);
      loadData();
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

  // Companion plants CRUD operations
  const handleCreateCompanion = () => {
    setEditingCompanion({
      plant: '',
      good: [],
      bad: []
    });
    setIsCreating(true);
    setActiveTab('companions');
  };

  const handleEditCompanion = (companion: CompanionPlantData) => {
    setEditingCompanion({...companion});
    setIsCreating(false);
    setActiveTab('companions');
  };

  const handleDeleteCompanion = async (plant: string) => {
    if (!confirm(`Sind Sie sicher, dass Sie die Beetnachbarn für "${plant}" löschen möchten?`)) return;
    
    try {
      const { error } = await supabase
        .from('companion_plants')
        .delete()
        .eq('plant', plant);
      
      if (error) throw error;
      
      toast({
        title: "Erfolg",
        description: "Beetnachbarn wurden gelöscht"
      });
      
      loadData();
    } catch (err) {
      console.error('Error deleting companion plants:', err);
      toast({
        title: "Fehler",
        description: "Beetnachbarn konnten nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleSaveCompanion = async () => {
    if (!editingCompanion) return;
    
    setIsSaving(true);
    try {
      // Format good and bad companions as JSON strings
      const goodJson = JSON.stringify(editingCompanion.good);
      const badJson = JSON.stringify(editingCompanion.bad);
      
      if (isCreating) {
        // Create new companion relationship
        const { error } = await supabase
          .from('companion_plants')
          .insert([{
            plant: editingCompanion.plant,
            good: goodJson,
            bad: badJson
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Neue Beetnachbarn wurden erstellt"
        });
      } else {
        // Update existing companion relationship
        const { error } = await supabase
          .from('companion_plants')
          .update({
            good: goodJson,
            bad: badJson
          })
          .eq('plant', editingCompanion.plant);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Beetnachbarn wurden aktualisiert"
        });
      }
      
      setEditingCompanion(null);
      loadData();
    } catch (err) {
      console.error('Error saving companion plants:', err);
      toast({
        title: "Fehler",
        description: "Beetnachbarn konnten nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Growing tips CRUD operations
  const handleCreateTips = () => {
    setEditingTips({
      plant: '',
      temperature: '',
      watering: '',
      light: '',
      timing: '',
      difficulty: 'Mittel',
      specificTips: [],
      commonMistakes: []
    });
    setIsCreating(true);
    setActiveTab('tips');
  };

  const handleEditTips = (tips: PlantGrowingTips) => {
    setEditingTips({...tips});
    setIsCreating(false);
    setActiveTab('tips');
  };

  const handleDeleteTips = async (plant: string) => {
    if (!confirm(`Sind Sie sicher, dass Sie die Anbautipps für "${plant}" löschen möchten?`)) return;
    
    try {
      const { error } = await supabase
        .from('plant_growing_tips')
        .delete()
        .eq('plant', plant);
      
      if (error) throw error;
      
      toast({
        title: "Erfolg",
        description: "Anbautipps wurden gelöscht"
      });
      
      loadData();
    } catch (err) {
      console.error('Error deleting growing tips:', err);
      toast({
        title: "Fehler",
        description: "Anbautipps konnten nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleSaveTips = async () => {
    if (!editingTips) return;
    
    setIsSaving(true);
    try {
      if (isCreating) {
        // Create new growing tips
        const { error } = await supabase
          .from('plant_growing_tips')
          .insert([{
            plant: editingTips.plant,
            temperature: editingTips.temperature,
            watering: editingTips.watering,
            light: editingTips.light,
            timing: editingTips.timing,
            difficulty: editingTips.difficulty,
            specific_tips: editingTips.specificTips,
            common_mistakes: editingTips.commonMistakes
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Neue Anbautipps wurden erstellt"
        });
      } else {
        // Update existing growing tips
        const { error } = await supabase
          .from('plant_growing_tips')
          .update({
            temperature: editingTips.temperature,
            watering: editingTips.watering,
            light: editingTips.light,
            timing: editingTips.timing,
            difficulty: editingTips.difficulty,
            specific_tips: editingTips.specificTips,
            common_mistakes: editingTips.commonMistakes
          })
          .eq('plant', editingTips.plant);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Anbautipps wurden aktualisiert"
        });
      }
      
      setEditingTips(null);
      loadData();
    } catch (err) {
      console.error('Error saving growing tips:', err);
      toast({
        title: "Fehler",
        description: "Anbautipps konnten nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Input handlers
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

  const handleStringArrayInputChange = (field: string, value: string) => {
    if (!editingPlant) return;
    
    try {
      const arrayValue = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
      setEditingPlant({
        ...editingPlant,
        [field]: arrayValue
      });
    } catch (err) {
      console.error('Error parsing string array input:', err);
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

  const handleCompanionInputChange = (field: keyof CompanionPlantData, value: any) => {
    if (!editingCompanion) return;
    
    setEditingCompanion({
      ...editingCompanion,
      [field]: value
    });
  };

  const handleTipsInputChange = (field: keyof PlantGrowingTips, value: any) => {
    if (!editingTips) return;
    
    setEditingTips({
      ...editingTips,
      [field]: value
    });
  };

  const handleTipsArrayInputChange = (field: 'specificTips' | 'commonMistakes', value: string) => {
    if (!editingTips) return;
    
    try {
      const arrayValue = value.split('\n').map(v => v.trim()).filter(v => v.length > 0);
      setEditingTips({
        ...editingTips,
        [field]: arrayValue
      });
    } catch (err) {
      console.error('Error parsing tips array input:', err);
    }
  };

  // Filter data based on search term
  const filteredPlants = plants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanions = companionPlants.filter(companion => 
    companion.plant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTips = growingTips.filter(tips => 
    tips.plant.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="text-gray-600">Verwalten Sie die Pflanzen, Beetnachbarn und Anbautipps im Aussaatkalender</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreatePlant}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Pflanze
          </Button>
          <Button onClick={handleCreateCompanion} variant="outline">
            <Leaf className="h-4 w-4 mr-2" />
            Neue Beetnachbarn
          </Button>
          <Button onClick={handleCreateTips} variant="outline">
            <Sprout className="h-4 w-4 mr-2" />
            Neue Anbautipps
          </Button>
        </div>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plants">Pflanzen</TabsTrigger>
          <TabsTrigger value="companions">Beetnachbarn</TabsTrigger>
          <TabsTrigger value="tips">Anbautipps</TabsTrigger>
        </TabsList>

        {/* Plants Tab */}
        <TabsContent value="plants">
          {/* Edit Plant Form */}
          {editingPlant && (
            <Card className="mb-6">
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
                      rows={2}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Beschreibung</label>
                    <Textarea
                      value={editingPlant.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Gute Beetnachbarn (kommagetrennt)</label>
                    <Textarea
                      value={(editingPlant.companionPlants || []).join(', ')}
                      onChange={(e) => handleStringArrayInputChange('companionPlants', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Schlechte Beetnachbarn (kommagetrennt)</label>
                    <Textarea
                      value={(editingPlant.avoidPlants || []).join(', ')}
                      onChange={(e) => handleStringArrayInputChange('avoidPlants', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Anbautipps (kommagetrennt)</label>
                    <Textarea
                      value={(editingPlant.growingTips || []).join(', ')}
                      onChange={(e) => handleStringArrayInputChange('growingTips', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Häufige Probleme (kommagetrennt)</label>
                    <Textarea
                      value={(editingPlant.commonProblems || []).join(', ')}
                      onChange={(e) => handleStringArrayInputChange('commonProblems', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setEditingPlant(null)}>
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
        </TabsContent>

        {/* Companion Plants Tab */}
        <TabsContent value="companions">
          {/* Edit Companion Form */}
          {editingCompanion && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {isCreating ? 'Neue Beetnachbarn erstellen' : `Beetnachbarn bearbeiten: ${editingCompanion.plant}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pflanze</label>
                    <Input
                      value={editingCompanion.plant}
                      onChange={(e) => handleCompanionInputChange('plant', e.target.value)}
                      disabled={!isCreating}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Gute Beetnachbarn (JSON-Format)</label>
                    <Textarea
                      value={typeof editingCompanion.good === 'string' 
                        ? editingCompanion.good 
                        : JSON.stringify(editingCompanion.good, null, 2)}
                      onChange={(e) => handleCompanionInputChange('good', e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: [{"{"}"plant": "Pflanze", "reason": "Grund"{"}"}, ...]
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Schlechte Beetnachbarn (JSON-Format)</label>
                    <Textarea
                      value={typeof editingCompanion.bad === 'string' 
                        ? editingCompanion.bad 
                        : JSON.stringify(editingCompanion.bad, null, 2)}
                      onChange={(e) => handleCompanionInputChange('bad', e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: [{"{"}"plant": "Pflanze", "reason": "Grund"{"}"}, ...]
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setEditingCompanion(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveCompanion} disabled={isSaving}>
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

          {/* Companion Plants Table */}
          <Card>
            <CardHeader>
              <CardTitle>Beetnachbarn</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
                </div>
              ) : filteredCompanions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Keine Beetnachbarn gefunden
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pflanze</TableHead>
                        <TableHead>Gute Nachbarn</TableHead>
                        <TableHead>Schlechte Nachbarn</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanions.map((companion) => {
                        // Parse good and bad companions
                        let goodCompanions: Array<{plant: string, reason: string}> = [];
                        let badCompanions: Array<{plant: string, reason: string}> = [];
                        
                        try {
                          goodCompanions = typeof companion.good === 'string' 
                            ? JSON.parse(companion.good) 
                            : companion.good || [];
                        } catch (e) {
                          console.error('Error parsing good companions:', e);
                        }
                        
                        try {
                          badCompanions = typeof companion.bad === 'string' 
                            ? JSON.parse(companion.bad) 
                            : companion.bad || [];
                        } catch (e) {
                          console.error('Error parsing bad companions:', e);
                        }
                        
                        return (
                          <TableRow key={companion.plant}>
                            <TableCell className="font-medium">{companion.plant}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {goodCompanions.map((good, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-green-100 text-green-800 text-xs">
                                    {good.plant}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {badCompanions.map((bad, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-red-100 text-red-800 text-xs">
                                    {bad.plant}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditCompanion(companion)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteCompanion(companion.plant)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growing Tips Tab */}
        <TabsContent value="tips">
          {/* Edit Tips Form */}
          {editingTips && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {isCreating ? 'Neue Anbautipps erstellen' : `Anbautipps bearbeiten: ${editingTips.plant}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pflanze</label>
                    <Input
                      value={editingTips.plant}
                      onChange={(e) => handleTipsInputChange('plant', e.target.value)}
                      disabled={!isCreating}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Schwierigkeit</label>
                    <Select 
                      value={editingTips.difficulty} 
                      onValueChange={(value) => handleTipsInputChange('difficulty', value)}
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
                    <label className="block text-sm font-medium mb-1">Temperatur</label>
                    <Input
                      value={editingTips.temperature}
                      onChange={(e) => handleTipsInputChange('temperature', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bewässerung</label>
                    <Input
                      value={editingTips.watering}
                      onChange={(e) => handleTipsInputChange('watering', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Licht</label>
                    <Input
                      value={editingTips.light}
                      onChange={(e) => handleTipsInputChange('light', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Timing</label>
                    <Input
                      value={editingTips.timing}
                      onChange={(e) => handleTipsInputChange('timing', e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Spezifische Tipps (ein Tipp pro Zeile)</label>
                    <Textarea
                      value={editingTips.specificTips.join('\n')}
                      onChange={(e) => handleTipsArrayInputChange('specificTips', e.target.value)}
                      rows={5}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Häufige Fehler (ein Fehler pro Zeile)</label>
                    <Textarea
                      value={editingTips.commonMistakes.join('\n')}
                      onChange={(e) => handleTipsArrayInputChange('commonMistakes', e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setEditingTips(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveTips} disabled={isSaving}>
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

          {/* Growing Tips Table */}
          <Card>
            <CardHeader>
              <CardTitle>Anbautipps</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
                </div>
              ) : filteredTips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Keine Anbautipps gefunden
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pflanze</TableHead>
                        <TableHead>Schwierigkeit</TableHead>
                        <TableHead>Temperatur</TableHead>
                        <TableHead>Bewässerung</TableHead>
                        <TableHead>Licht</TableHead>
                        <TableHead>Timing</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTips.map((tips) => (
                        <TableRow key={tips.plant}>
                          <TableCell className="font-medium">{tips.plant}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              tips.difficulty === 'Einfach' ? 'bg-green-100 text-green-800' :
                              tips.difficulty === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {tips.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{tips.temperature}</TableCell>
                          <TableCell className="text-xs">{tips.watering}</TableCell>
                          <TableCell className="text-xs">{tips.light}</TableCell>
                          <TableCell className="text-xs">{tips.timing}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditTips(tips)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteTips(tips.plant)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SowingCalendarManager;
