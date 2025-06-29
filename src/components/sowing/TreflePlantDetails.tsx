import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, Droplets, Sun, Ruler, Plant, Calendar, Info, AlertCircle, Check } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { trefleApiService } from '@/services/TrefleApiService';
import { TreflePlantDetails as TreflePlantDetailsType } from '@/types/trefle';

interface TreflePlantDetailsProps {
  plantId: number | null;
  onAddToCalendar: (plant: any) => void;
}

const TreflePlantDetails: React.FC<TreflePlantDetailsProps> = ({ plantId, onAddToCalendar }) => {
  const { data: plant, isLoading, isError } = useQuery({
    queryKey: ['treflePlantDetails', plantId],
    queryFn: () => trefleApiService.getPlantDetails(plantId!),
    enabled: !!plantId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleAddToCalendar = () => {
    if (plant) {
      const formattedPlant = trefleApiService.mapToSowingCalendarFormat(plant);
      onAddToCalendar(formattedPlant);
    }
  };

  if (!plantId) {
    return (
      <Card className="border-sage-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plant className="h-5 w-5 text-sage-600" />
            Pflanzendetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-earth-500">
            Wähle eine Pflanze aus, um Details anzuzeigen
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-sage-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plant className="h-5 w-5 text-sage-600" />
            Pflanzendetails werden geladen...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-sage-500 rounded-full border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !plant) {
    return (
      <Card className="border-sage-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Fehler beim Laden der Pflanzendetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Die Pflanzendetails konnten nicht geladen werden. Bitte versuche es später erneut.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMonthName = (month: number): string => {
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return months[month - 1];
  };

  return (
    <Card className="border-sage-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plant className="h-5 w-5 text-sage-600" />
          {plant.common_name || plant.scientific_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            {plant.image_url ? (
              <img 
                src={plant.image_url} 
                alt={plant.common_name || plant.scientific_name} 
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-sage-100 flex items-center justify-center rounded-lg">
                <Plant className="h-16 w-16 text-sage-400" />
              </div>
            )}
            
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {plant.family_common_name || plant.family}
                </Badge>
                {plant.specifications.edible && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Essbar
                  </Badge>
                )}
                {plant.specifications.vegetable && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Gemüse
                  </Badge>
                )}
                {plant.specifications.medicinal && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Medizinisch
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-earth-500 italic">
                {plant.scientific_name}
              </p>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {plant.growth.minimum_temperature?.deg_c !== null && (
                <div className="flex items-center gap-2 p-2 bg-sage-50 rounded-lg">
                  <Thermometer className="h-5 w-5 text-sage-600" />
                  <div>
                    <p className="text-xs text-earth-500">Mindesttemperatur</p>
                    <p className="font-medium">{plant.growth.minimum_temperature?.deg_c}°C</p>
                  </div>
                </div>
              )}
              
              {plant.growth.soil_humidity !== null && (
                <div className="flex items-center gap-2 p-2 bg-sage-50 rounded-lg">
                  <Droplets className="h-5 w-5 text-sage-600" />
                  <div>
                    <p className="text-xs text-earth-500">Bodenfeuchtigkeit</p>
                    <p className="font-medium">{plant.growth.soil_humidity}/10</p>
                  </div>
                </div>
              )}
              
              {plant.growth.light !== null && (
                <div className="flex items-center gap-2 p-2 bg-sage-50 rounded-lg">
                  <Sun className="h-5 w-5 text-sage-600" />
                  <div>
                    <p className="text-xs text-earth-500">Lichtbedarf</p>
                    <p className="font-medium">{plant.growth.light}/10</p>
                  </div>
                </div>
              )}
              
              {plant.growth.row_spacing?.cm !== null && (
                <div className="flex items-center gap-2 p-2 bg-sage-50 rounded-lg">
                  <Ruler className="h-5 w-5 text-sage-600" />
                  <div>
                    <p className="text-xs text-earth-500">Reihenabstand</p>
                    <p className="font-medium">{plant.growth.row_spacing?.cm} cm</p>
                  </div>
                </div>
              )}
            </div>
            
            {plant.specifications.edible_part && (
              <div className="p-3 bg-sage-50 rounded-lg">
                <h4 className="font-medium text-earth-800 mb-1 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Essbare Teile
                </h4>
                <div className="flex flex-wrap gap-1">
                  {plant.specifications.edible_part.map(part => (
                    <Badge key={part} variant="outline" className="text-xs">
                      {part}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {plant.growth.growth_months && plant.growth.growth_months.length > 0 && (
              <div className="p-3 bg-sage-50 rounded-lg">
                <h4 className="font-medium text-earth-800 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Wachstumsmonate
                </h4>
                <div className="flex flex-wrap gap-1">
                  {plant.growth.growth_months.map(month => (
                    <Badge key={month} variant="outline" className="text-xs">
                      {getMonthName(month)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {plant.specifications.edible_use && (
              <div className="p-3 bg-sage-50 rounded-lg">
                <h4 className="font-medium text-earth-800 mb-1">Verwendung</h4>
                <p className="text-sm text-earth-600">{plant.specifications.edible_use}</p>
              </div>
            )}
            
            <Button 
              onClick={handleAddToCalendar}
              className="w-full mt-4 bg-sage-600 hover:bg-sage-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Zum Aussaatkalender hinzufügen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreflePlantDetails;