import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plane as Plant, Info } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { trefleApiService } from '@/services/TrefleApiService';
import { TreflePlant } from '@/types/trefle';

interface TreflePlantSearchProps {
  onPlantSelect: (plantId: number) => void;
}

const TreflePlantSearch: React.FC<TreflePlantSearchProps> = ({ onPlantSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['treflePlantSearch', searchTerm, page],
    queryFn: () => trefleApiService.searchPlants(searchTerm, page),
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePlantClick = (plantId: number) => {
    setSelectedPlantId(plantId);
    onPlantSelect(plantId);
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plant className="h-5 w-5 text-sage-600" />
          Pflanzen-Datenbank durchsuchen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Pflanze suchen (z.B. Tomato, Carrot, Basil)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-sage-200 focus:border-sage-400 focus:ring-sage-400"
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
              disabled={searchTerm.length < 2 || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suchen"}
            </Button>
          </div>
        </form>

        {isError && (
          <div className="text-red-500 mb-4">
            Fehler beim Suchen: {(error as Error).message}
          </div>
        )}

        {data?.plants && data.plants.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-earth-600 mb-2">
              {data.meta.total} Ergebnisse gefunden
            </div>
            
            <div className="grid gap-3">
              {data.plants.map((plant: TreflePlant) => (
                <div 
                  key={plant.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlantId === plant.id 
                      ? 'bg-sage-100 border-sage-300' 
                      : 'bg-white hover:bg-sage-50 border-sage-200'
                  }`}
                  onClick={() => handlePlantClick(plant.id)}
                >
                  <div className="flex items-start gap-3">
                    {plant.image_url ? (
                      <img 
                        src={plant.image_url} 
                        alt={plant.common_name || plant.scientific_name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-sage-100 flex items-center justify-center rounded-md">
                        <Plant className="h-8 w-8 text-sage-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-earth-800">
                        {plant.common_name || plant.scientific_name}
                      </h4>
                      {plant.common_name && (
                        <p className="text-sm text-earth-500 italic">
                          {plant.scientific_name}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {plant.family_common_name || plant.family}
                        </Badge>
                        {plant.year && (
                          <Badge variant="outline" className="text-xs">
                            {plant.year}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Info className="h-4 w-4 text-sage-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            
            {data.meta.total > data.plants.length && (
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Zurück
                </Button>
                <span className="text-sm text-earth-600 self-center">
                  Seite {page} von {data.meta.last_page}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= data.meta.last_page || isLoading}
                >
                  Weiter
                </Button>
              </div>
            )}
          </div>
        ) : searchTerm.length >= 2 && !isLoading ? (
          <div className="text-center py-8 text-earth-500">
            Keine Pflanzen gefunden. Versuche einen anderen Suchbegriff.
          </div>
        ) : searchTerm.length < 2 ? (
          <div className="text-center py-8 text-earth-500">
            Gib mindestens 2 Zeichen ein, um zu suchen.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TreflePlantSearch;