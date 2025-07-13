import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Leaf, Sprout, Database, Plane as Plant } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import SowingCalendarTable from './SowingCalendarTable';
import SowingCalendarFilters from './SowingCalendarFilters';
import SowingCalendarLegend from './SowingCalendarLegend';
import CompanionPlantFinder from './CompanionPlantFinder';
import PlantGrowingTipsCard from './PlantGrowingTipsCard';
import TrefleIntegration from './TrefleIntegration';
import sowingCalendarService from '@/services/SowingCalendarService';
import type { PlantData, SowingCategory } from '@/types/sowing';

const CATEGORIES: SowingCategory[] = [
  { key: "directSow", color: "bg-green-500", label: "Aussaat draußen" },
  { key: "indoor", color: "bg-blue-500", label: "Vorziehen" },
  { key: "plantOut", color: "bg-yellow-500", label: "Auspflanzen" },
  { key: "harvest", color: "bg-orange-500", label: "Ernte" },
];

const ModularSowingCalendar: React.FC = () => {
  // State for filters
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedSeason, setSelectedSeason] = useState('Alle');
  const [selectedType, setSelectedType] = useState('Alle');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Alle');
  const [categoryFilter, setCategoryFilter] = useState<Record<string, boolean>>({
    directSow: true,
    indoor: true,
    plantOut: true,
    harvest: true,
  });
  
  // State for data
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('kalender');
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [plantTips, setPlantTips] = useState(null);
  const { toast } = useToast();

  // Load plants on mount
  useEffect(() => {
    const loadPlants = async () => {
      setLoading(true);
      try {
        const data = await sowingCalendarService.getAllPlants();
        setPlants(data);
      } catch (err) {
        console.error('Error loading plants:', err);
        setError('Fehler beim Laden der Pflanzen. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlants();
  }, []);

  // Load plant tips when a plant is selected
  useEffect(() => {
    if (!selectedPlant) {
      setPlantTips(null);
      return;
    }
    
    const loadPlantTips = async () => {
      setLoadingTips(true);
      try {
        const tips = await sowingCalendarService.getPlantGrowingTips(selectedPlant);
        setPlantTips(tips);
      } catch (err) {
        console.error('Error loading plant tips:', err);
      } finally {
        setLoadingTips(false);
      }
    };
    
    loadPlantTips();
  }, [selectedPlant]);

  // Filter plants based on search and filters
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      // Text search
      if (search && !plant.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Month filter
      if (selectedMonth !== 'ALL') {
        const monthIndex = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'].indexOf(selectedMonth) + 1;
        const anyCategory = CATEGORIES.some(cat => 
          categoryFilter[cat.key] && 
          (plant[cat.key as keyof PlantData] as number[])?.includes(monthIndex)
        );
        if (!anyCategory) return false;
      }
      
      // Season filter
      if (selectedSeason !== 'Alle' && !plant.season.includes(selectedSeason)) {
        return false;
      }
      
      // Type filter
      if (selectedType !== 'Alle' && plant.type !== selectedType) {
        return false;
      }
      
      // Difficulty filter
      if (selectedDifficulty !== 'Alle' && plant.difficulty !== selectedDifficulty) {
        return false;
      }
      
      return true;
    });
  }, [plants, search, selectedMonth, selectedSeason, selectedType, selectedDifficulty, categoryFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedMonth('ALL');
    setSelectedSeason('Alle');
    setSelectedType('Alle');
    setSelectedDifficulty('Alle');
    setCategoryFilter({
      directSow: true,
      indoor: true,
      plantOut: true,
      harvest: true,
    });
  };

  // Handle plant selection for tips
  const handlePlantSelect = (plantName: string) => {
    setSelectedPlant(plantName);
    setActiveTab('tipps');
  };

  // Handle adding a new plant from Trefle
  const handleAddPlant = async (plant: PlantData) => {
    try {
      // Add plant to database
      await sowingCalendarService.addPlant(plant);
      
      // Refresh plants list
      const updatedPlants = await sowingCalendarService.getAllPlants();
      setPlants(updatedPlants);
      
      toast({
        title: "Pflanze hinzugefügt",
        description: `${plant.name} wurde erfolgreich zum Aussaatkalender hinzugefügt.`,
      });
    } catch (error) {
      console.error('Error adding plant:', error);
      toast({
        title: "Fehler",
        description: `Fehler beim Hinzufügen der Pflanze: ${(error as Error)?.message || 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-sage-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200 max-w-3xl mx-auto">
        <AlertDescription className="text-red-700">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="kalender" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Aussaatkalender
          </TabsTrigger>
          <TabsTrigger value="beetnachbarn" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Beetnachbarn-Finder
          </TabsTrigger>
          <TabsTrigger value="tipps" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            Aussaat-Tipps
          </TabsTrigger>
          <TabsTrigger value="trefle" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Trefle API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kalender">
          <div className="mb-8">
            <SowingCalendarFilters
              search={search}
              setSearch={setSearch}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedSeason={selectedSeason}
              setSelectedSeason={setSelectedSeason}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              categories={CATEGORIES}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onReset={handleResetFilters}
            />

            <SowingCalendarTable
              plants={filteredPlants}
              categories={CATEGORIES}
              categoryFilter={categoryFilter}
              onPlantSelect={handlePlantSelect}
            />

            <SowingCalendarLegend categories={CATEGORIES} />
          </div>
        </TabsContent>

        <TabsContent value="beetnachbarn">
          <CompanionPlantFinder onPlantSelect={handlePlantSelect} />
        </TabsContent>

        <TabsContent value="tipps">
          <PlantGrowingTipsCard
            plantName={selectedPlant || ''}
            tips={plantTips}
            loading={loadingTips}
          />
        </TabsContent>

        <TabsContent value="trefle">
          <TrefleIntegration onAddPlant={handleAddPlant} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModularSowingCalendar;