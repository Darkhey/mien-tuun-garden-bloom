import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Plane as Plant, Search, AlertTriangle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TreflePlantSearch from './TreflePlantSearch';
import TreflePlantDetails from './TreflePlantDetails';
import { trefleApiService } from '@/services/TrefleApiService';

interface TrefleIntegrationProps {
  onAddPlant: (plant: any) => void;
}

const TrefleIntegration: React.FC<TrefleIntegrationProps> = ({ onAddPlant }) => {
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [syncingDatabase, setSyncingDatabase] = useState(false);
  const { toast } = useToast();

  const handlePlantSelect = (plantId: number) => {
    setSelectedPlantId(plantId);
  };

  const handleAddToCalendar = (plant: any) => {
    onAddPlant(plant);
    toast({
      title: "Pflanze hinzugefügt",
      description: `${plant.name} wurde zum Aussaatkalender hinzugefügt.`,
    });
  };

  const handleSyncDatabase = async () => {
    setSyncingDatabase(true);
    try {
      const result = await trefleApiService.syncToDatabase();
      
      if (result.success) {
        toast({
          title: "Datenbank synchronisiert",
          description: result.message,
        });
      } else {
        toast({
          title: "Synchronisierung fehlgeschlagen",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing database:', error);
      toast({
        title: "Fehler",
        description: `Synchronisierung fehlgeschlagen: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSyncingDatabase(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Plant className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-earth-800">Trefle Pflanzen-Datenbank</h2>
            <p className="text-earth-600">Suche und füge Pflanzen aus der Trefle API hinzu</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleSyncDatabase}
          disabled={syncingDatabase}
          className="flex items-center gap-2"
        >
          {syncingDatabase ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-sage-500 rounded-full border-t-transparent"></div>
              Synchronisiere...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Datenbank synchronisieren
            </>
          )}
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Search className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Suche nach Pflanzen in der Trefle-Datenbank und füge sie zum Aussaatkalender hinzu. Die Daten werden automatisch in das richtige Format konvertiert.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TreflePlantSearch onPlantSelect={handlePlantSelect} />
        <TreflePlantDetails plantId={selectedPlantId} onAddToCalendar={handleAddToCalendar} />
      </div>

      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-700">
          Hinweis: Die Trefle API enthält hauptsächlich englischsprachige Daten. Die Übersetzung und Anpassung an deutsche Gartenbedingungen erfolgt automatisch, kann aber ungenau sein.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TrefleIntegration;