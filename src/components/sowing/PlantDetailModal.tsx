import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Sun, Clock, AlertTriangle, Leaf, X } from "lucide-react";
import sowingCalendarService from '@/services/SowingCalendarService';
import type { PlantData, CompanionPlantData, PlantGrowingTips, SowingCategory } from '@/types/sowing';

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

interface PlantDetailModalProps {
  plantName: string | null;
  plants: PlantData[];
  categories: SowingCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getMonthsForCategory = (plant: PlantData, key: string): number[] => {
  switch (key) {
    case 'directSow': return plant.directSow || [];
    case 'indoor': return plant.indoor || [];
    case 'plantOut': return plant.plantOut || [];
    case 'harvest': return plant.harvest || [];
    default: return [];
  }
};

const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plantName,
  plants,
  categories,
  open,
  onOpenChange
}) => {
  const [tips, setTips] = useState<PlantGrowingTips | null>(null);
  const [companions, setCompanions] = useState<CompanionPlantData | null>(null);
  const [loading, setLoading] = useState(false);

  const plant = plants.find(p => p.name === plantName);
  const currentMonth = new Date().getMonth();

  useEffect(() => {
    if (!plantName || !open) return;
    setLoading(true);
    Promise.all([
      sowingCalendarService.getPlantGrowingTips(plantName),
      sowingCalendarService.getCompanionPlants(plantName)
    ]).then(([t, c]) => {
      setTips(t);
      setCompanions(c);
    }).finally(() => setLoading(false));
  }, [plantName, open]);

  if (!plant) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-sage-50 to-accent-50 p-6 border-b border-sage-200">
          <SheetHeader>
            <SheetTitle className="text-2xl font-serif text-earth-800 flex items-center gap-3">
              <Leaf className="h-6 w-6 text-sage-600" />
              {plant.name}
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className={`${
              plant.type === 'Gemüse' ? 'bg-green-100 text-green-700' :
              plant.type === 'Kräuter' ? 'bg-purple-100 text-purple-700' :
              plant.type === 'Obst' ? 'bg-orange-100 text-orange-700' :
              'bg-pink-100 text-pink-700'
            }`}>{plant.type}</Badge>
            <Badge variant="secondary" className={`${
              plant.difficulty === 'Einfach' ? 'bg-green-100 text-green-700' :
              plant.difficulty === 'Mittel' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {plant.difficulty === 'Einfach' ? '🌱' : plant.difficulty === 'Mittel' ? '🌿' : '🌳'} {plant.difficulty}
            </Badge>
          </div>
          {plant.notes && (
            <p className="text-sm text-earth-600 mt-2">{plant.notes}</p>
          )}
          {plant.description && (
            <p className="text-sm text-earth-600 mt-1">{plant.description}</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Timeline Bars */}
          <div>
            <h3 className="text-sm font-semibold text-earth-700 mb-3 uppercase tracking-wider">Anbau-Timeline</h3>
            <div className="space-y-2">
              {categories.map(cat => {
                const months = getMonthsForCategory(plant, cat.key);
                if (months.length === 0) return null;
                return (
                  <div key={cat.key}>
                    <span className="text-xs font-medium text-earth-600 mb-1 block">{cat.label}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 12 }, (_, i) => {
                        const active = months.includes(i + 1);
                        const isCurrent = i === currentMonth;
                        return (
                          <div key={i} className="flex-1 text-center">
                            <div className={`h-5 rounded-sm ${active ? cat.color : 'bg-sage-100'} ${
                              isCurrent ? 'ring-2 ring-accent-500 ring-offset-1' : ''
                            }`} />
                            <span className={`text-[9px] ${isCurrent ? 'font-bold text-accent-700' : 'text-sage-400'}`}>
                              {MONTHS[i]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-sage-500 rounded-full border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Growing Tips */}
              {tips && (
                <div>
                  <h3 className="text-sm font-semibold text-earth-700 mb-3 uppercase tracking-wider">Anbautipps</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { icon: <Thermometer className="h-4 w-4 text-orange-500" />, label: 'Temperatur', value: tips.temperature },
                      { icon: <Droplets className="h-4 w-4 text-blue-500" />, label: 'Gießen', value: tips.watering },
                      { icon: <Sun className="h-4 w-4 text-yellow-500" />, label: 'Licht', value: tips.light },
                      { icon: <Clock className="h-4 w-4 text-green-500" />, label: 'Timing', value: tips.timing },
                    ].map(item => (
                      <div key={item.label} className="bg-white p-3 rounded-lg border border-sage-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          {item.icon}
                          <span className="text-[10px] font-medium text-earth-500">{item.label}</span>
                        </div>
                        <p className="text-xs text-earth-800">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {tips.specificTips.length > 0 && (
                    <div className="bg-sage-50 p-3 rounded-lg border border-sage-200 mb-3">
                      <h4 className="text-xs font-semibold text-earth-700 mb-2">💡 Profi-Tipps</h4>
                      <ul className="space-y-1">
                        {tips.specificTips.map((tip, i) => (
                          <li key={i} className="text-xs text-earth-600 flex items-start gap-1.5">
                            <span className="text-sage-400 mt-0.5">•</span>{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tips.commonMistakes.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <h4 className="text-xs font-semibold text-earth-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Häufige Fehler
                      </h4>
                      <ul className="space-y-1">
                        {tips.commonMistakes.map((m, i) => (
                          <li key={i} className="text-xs text-earth-600 flex items-start gap-1.5">
                            <span className="text-red-400 mt-0.5">•</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Companion Plants */}
              {companions && (
                <div>
                  <h3 className="text-sm font-semibold text-earth-700 mb-3 uppercase tracking-wider">Beetnachbarn</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-xs font-medium text-green-700 mb-2">✓ Gute Nachbarn</h4>
                      <div className="space-y-1">
                        {companions.good.map(({ plant, reason }) => (
                          <div key={plant} className="text-xs bg-green-50 p-2 rounded border border-green-200" title={reason}>
                            <span className="font-medium">{plant}</span>
                            <p className="text-green-600 text-[10px] mt-0.5 line-clamp-1">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-red-700 mb-2">✗ Schlechte Nachbarn</h4>
                      <div className="space-y-1">
                        {companions.bad.map(({ plant, reason }) => (
                          <div key={plant} className="text-xs bg-red-50 p-2 rounded border border-red-200" title={reason}>
                            <span className="font-medium">{plant}</span>
                            <p className="text-red-600 text-[10px] mt-0.5 line-clamp-1">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PlantDetailModal;
