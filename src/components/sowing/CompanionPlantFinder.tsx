import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import sowingCalendarService from '@/services/SowingCalendarService';
import type { CompanionPlantData } from '@/types/sowing';

interface CompanionPlantFinderProps {
  onPlantSelect: (plantName: string) => void;
}

const CompanionPlantFinder: React.FC<CompanionPlantFinderProps> = ({ onPlantSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [plants, setPlants] = useState<string[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<string[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [companionData, setCompanionData] = useState<CompanionPlantData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load all plant names on mount
  useEffect(() => {
    const loadPlants = async () => {
      const allPlants = await sowingCalendarService.getAllPlants();
      const plantNames = allPlants.map(p => p.name);
      setPlants(plantNames);
      setFilteredPlants(plantNames);
    };
    
    loadPlants();
  }, []);

  // Filter plants based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlants(plants);
      return;
    }
    
    const filtered = plants.filter(plant => 
      plant.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlants(filtered);
  }, [searchTerm, plants]);

  // Load companion plant data when a plant is selected
  useEffect(() => {
    if (!selectedPlant) {
      setCompanionData(null);
      return;
    }
    
    const loadCompanionData = async () => {
      setLoading(true);
      try {
        const data = await sowingCalendarService.getCompanionPlants(selectedPlant);
        setCompanionData(data);
        if (data) {
          onPlantSelect(selectedPlant);
        }
      } catch (error) {
        console.error('Error loading companion data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanionData();
  }, [selectedPlant, onPlantSelect]);

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-sage-600" />
          Beetnachbarn-Finder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-earth-600 mb-4">
            Finde heraus, welche Pflanzen gut nebeneinander wachsen und welche sich gegenseitig beeinträchtigen können.
          </p>
          
          <div className="relative mb-6">
            <Input
              type="search"
              placeholder="Pflanze auswählen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-4 py-2 border-sage-200 focus:border-sage-400 focus:ring-sage-400"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {filteredPlants.slice(0, 8).map(plant => (
              <Button 
                key={plant}
                variant={selectedPlant === plant ? "default" : "outline"}
                onClick={() => setSelectedPlant(plant)}
                className="justify-start"
              >
                {plant}
              </Button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-sage-500 rounded-full border-t-transparent mx-auto"></div>
            <p className="mt-2 text-sage-600">Lade Beetnachbarn...</p>
          </div>
        )}

        {companionData && !loading && (
          <div className="border rounded-lg p-6 bg-sage-50">
            <h3 className="text-xl font-serif font-bold text-earth-800 mb-4">Beetnachbarn für {companionData.plant}</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-earth-800 mb-3 flex items-center gap-2">
                  <span className="text-green-600">✓</span> Gute Nachbarn
                </h4>
                <div className="space-y-3">
                  {companionData.good.map(({plant, reason}) => (
                    <TooltipProvider key={plant}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 cursor-help transition-colors">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="font-medium">{plant}</span>
                            <Info className="h-3 w-3 text-green-600 ml-auto" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">{reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-earth-800 mb-3 flex items-center gap-2">
                  <span className="text-red-600">✗</span> Schlechte Nachbarn
                </h4>
                <div className="space-y-3">
                  {companionData.bad.map(({plant, reason}) => (
                    <TooltipProvider key={plant}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 cursor-help transition-colors">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="font-medium">{plant}</span>
                            <Info className="h-3 w-3 text-red-600 ml-auto" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">{reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedPlant && !loading && (
          <div className="text-center py-4 text-sage-600">
            Wähle eine Pflanze aus, um Beetnachbarn anzuzeigen
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanionPlantFinder;