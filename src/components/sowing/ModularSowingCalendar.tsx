import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Leaf, Sprout, Database, Printer, Zap, Heart, CalendarDays, Focus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import SowingCalendarTable from './SowingCalendarTable';
import SowingCalendarFilters from './SowingCalendarFilters';
import SowingCalendarLegend from './SowingCalendarLegend';
import SowingCalendarStats from './SowingCalendarStats';
import CompanionPlantFinder from './CompanionPlantFinder';
import PlantGrowingTipsCard from './PlantGrowingTipsCard';
import PlantDetailModal from './PlantDetailModal';
import TrefleIntegration from './TrefleIntegration';
import { usePlantFavorites } from './usePlantFavorites';
import { downloadICal } from '@/utils/icalExport';
import sowingCalendarService from '@/services/SowingCalendarService';
import type { PlantData, SowingCategory } from '@/types/sowing';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const CATEGORIES: SowingCategory[] = [
  { key: "directSow", color: "bg-green-500", label: "Aussaat draußen" },
  { key: "indoor", color: "bg-blue-500", label: "Vorziehen" },
  { key: "plantOut", color: "bg-yellow-500", label: "Auspflanzen" },
  { key: "harvest", color: "bg-orange-500", label: "Ernte" },
];

const ModularSowingCalendar: React.FC = () => {
  const isMobile = useIsMobile();
  const { isAdmin } = useIsAdmin();

  // State for filters
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedSeason, setSelectedSeason] = useState('Alle');
  const [selectedType, setSelectedType] = useState('Alle');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Alle');
  const [categoryFilter, setCategoryFilter] = useState<Record<string, boolean>>({
    directSow: true, indoor: true, plantOut: true, harvest: true,
  });

  // State for data
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for tabs & detail modal
  const [activeTab, setActiveTab] = useState('kalender');
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingTips, setLoadingTips] = useState(false);
  const [plantTips, setPlantTips] = useState(null);
  const { toast } = useToast();

  // Favorites
  const { toggleFavorite, isFavorite, showOnlyFavorites, setShowOnlyFavorites, count: favCount } = usePlantFavorites();

  // Month focus mode
  const [monthFocus, setMonthFocus] = useState(false);

  // Companion highlighting
  const [hoveredPlant, setHoveredPlant] = useState<string | null>(null);

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

  // Load plant tips when a plant is selected (for tips tab)
  useEffect(() => {
    if (!selectedPlant) { setPlantTips(null); return; }
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

  // Filter plants
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      if (showOnlyFavorites && !isFavorite(plant.id)) return false;
      if (search && !plant.name.toLowerCase().includes(search.toLowerCase())) return false;

      if (selectedMonth !== 'ALL') {
        const monthIndex = MONTHS_SHORT.indexOf(selectedMonth) + 1;
        const anyCategory = CATEGORIES.some(cat =>
          categoryFilter[cat.key] &&
          (() => {
            const months = cat.key === 'directSow' ? plant.directSow :
                          cat.key === 'indoor' ? plant.indoor :
                          cat.key === 'plantOut' ? plant.plantOut :
                          cat.key === 'harvest' ? plant.harvest : [];
            return Array.isArray(months) && months.includes(monthIndex);
          })()
        );
        if (!anyCategory) return false;
      }

      if (selectedSeason !== 'Alle' && !plant.season.includes(selectedSeason)) return false;
      if (selectedType !== 'Alle' && plant.type !== selectedType) return false;
      if (selectedDifficulty !== 'Alle' && plant.difficulty !== selectedDifficulty) return false;

      return true;
    });
  }, [plants, search, selectedMonth, selectedSeason, selectedType, selectedDifficulty, categoryFilter, showOnlyFavorites, isFavorite]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedMonth('ALL');
    setSelectedSeason('Alle');
    setSelectedType('Alle');
    setSelectedDifficulty('Alle');
    setCategoryFilter({ directSow: true, indoor: true, plantOut: true, harvest: true });
    setShowOnlyFavorites(false);
    setMonthFocus(false);
  };

  const handleSowNow = () => {
    const currentMonthShort = MONTHS_SHORT[new Date().getMonth()];
    setSelectedMonth(currentMonthShort);
    setCategoryFilter({ directSow: true, indoor: true, plantOut: true, harvest: false });
    setSearch('');
    setSelectedSeason('Alle');
    setSelectedType('Alle');
    setSelectedDifficulty('Alle');
  };

  const handlePlantSelect = (plantName: string) => {
    setSelectedPlant(plantName);
    setDetailModalOpen(true);
  };

  const handleAddPlant = async (plant: PlantData) => {
    try {
      await sowingCalendarService.addPlant(plant);
      const updatedPlants = await sowingCalendarService.getAllPlants();
      setPlants(updatedPlants);
      toast({ title: "Pflanze hinzugefügt", description: `${plant.name} wurde erfolgreich zum Aussaatkalender hinzugefügt.` });
    } catch (error) {
      toast({ title: "Fehler", description: `Fehler beim Hinzufügen: ${(error as Error)?.message || 'Unbekannter Fehler'}`, variant: "destructive" });
    }
  };

  const handlePrint = () => window.print();

  const handleICalExport = () => {
    downloadICal(filteredPlants, CATEGORIES);
    toast({ title: "Kalender exportiert", description: `${filteredPlants.length} Pflanzen als .ics-Datei heruntergeladen.` });
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
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  const tabs = [
    { value: 'kalender', label: 'Aussaatkalender', icon: Calendar },
    { value: 'beetnachbarn', label: 'Beetnachbarn', icon: Leaf },
    { value: 'tipps', label: 'Anbautipps', icon: Sprout },
    ...(isAdmin ? [{ value: 'trefle', label: 'Trefle API', icon: Database }] : []),
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full mb-8 ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} overflow-x-auto`}>
          {tabs.map(tab => (
            <TooltipProvider key={tab.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value={tab.value} className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-4">
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <span className={isMobile ? 'sr-only' : ''}>{tab.label}</span>
                  </TabsTrigger>
                </TooltipTrigger>
                {isMobile && (
                  <TooltipContent><p>{tab.label}</p></TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </TabsList>

        <TabsContent value="kalender">
          <div className="mb-8">
            {/* Statistics bar */}
            <SowingCalendarStats plants={plants} />

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button onClick={handleSowNow} size="sm" className="bg-accent-500 hover:bg-accent-600 text-white rounded-full gap-1.5 shadow-sm">
                <Zap className="h-4 w-4" /> Jetzt säen
              </Button>
              <Button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                size="sm"
                variant={showOnlyFavorites ? "default" : "outline"}
                className={`rounded-full gap-1.5 ${showOnlyFavorites ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
              >
                <Heart className={`h-4 w-4 ${showOnlyFavorites ? 'fill-white' : ''}`} />
                Favoriten{favCount > 0 ? ` (${favCount})` : ''}
              </Button>
              <Button
                onClick={() => setMonthFocus(!monthFocus)}
                size="sm"
                variant={monthFocus ? "default" : "outline"}
                className="rounded-full gap-1.5"
              >
                <Focus className="h-4 w-4" />
                <span className="hidden sm:inline">Monats-Fokus</span>
              </Button>
              <Button onClick={handleICalExport} size="sm" variant="outline" className="rounded-full gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">iCal Export</span>
              </Button>
              <Button onClick={handlePrint} size="sm" variant="outline" className="rounded-full gap-1.5 print:hidden">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Drucken</span>
              </Button>
            </div>

            <SowingCalendarFilters
              search={search} setSearch={setSearch}
              selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
              selectedSeason={selectedSeason} setSelectedSeason={setSelectedSeason}
              selectedType={selectedType} setSelectedType={setSelectedType}
              selectedDifficulty={selectedDifficulty} setSelectedDifficulty={setSelectedDifficulty}
              categories={CATEGORIES}
              categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
              onReset={handleResetFilters}
            />

            <SowingCalendarTable
              plants={filteredPlants}
              categories={CATEGORIES}
              categoryFilter={categoryFilter}
              onPlantSelect={handlePlantSelect}
              monthFocus={monthFocus}
              hoveredPlant={hoveredPlant}
              onHoverPlant={setHoveredPlant}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            <SowingCalendarLegend categories={CATEGORIES} />
          </div>
        </TabsContent>

        <TabsContent value="beetnachbarn">
          <CompanionPlantFinder onPlantSelect={handlePlantSelect} />
        </TabsContent>

        <TabsContent value="tipps">
          <PlantGrowingTipsCard plantName={selectedPlant || ''} tips={plantTips} loading={loadingTips} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="trefle">
            <TrefleIntegration onAddPlant={handleAddPlant} />
          </TabsContent>
        )}
      </Tabs>

      <PlantDetailModal
        plantName={selectedPlant}
        plants={plants}
        categories={CATEGORIES}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
};

export default ModularSowingCalendar;
