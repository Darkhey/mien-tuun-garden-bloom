import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { PlantData, SowingCategory } from '@/types/sowing';

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

interface SowingCalendarMobileCardsProps {
  plants: PlantData[];
  categories: SowingCategory[];
  categoryFilter: Record<string, boolean>;
  onPlantSelect?: (plantName: string) => void;
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

const SowingCalendarMobileCards: React.FC<SowingCalendarMobileCardsProps> = ({
  plants,
  categories,
  categoryFilter,
  onPlantSelect
}) => {
  const currentMonth = new Date().getMonth(); // 0-indexed

  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Info className="h-8 w-8 opacity-50" />
        <p className="text-lg font-medium">Keine Pflanzen gefunden</p>
        <p className="text-sm">Passe deine Filter an oder setze sie zurück.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">{plants.length} Pflanzen gefunden</p>
      {plants.map((plant) => (
        <Card
          key={plant.id}
          className="border-sage-200 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
          onClick={() => onPlantSelect?.(plant.name)}
        >
          <CardContent className="p-4">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-earth-800">{plant.name}</span>
                <Info className="h-3.5 w-3.5 text-sage-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  plant.type === 'Gemüse' ? 'bg-green-100 text-green-700' :
                  plant.type === 'Kräuter' ? 'bg-purple-100 text-purple-700' :
                  plant.type === 'Obst' ? 'bg-orange-100 text-orange-700' :
                  'bg-pink-100 text-pink-700'
                }`}>{plant.type}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  plant.difficulty === 'Einfach' ? 'bg-green-100 text-green-700' :
                  plant.difficulty === 'Mittel' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {plant.difficulty === 'Einfach' ? '🌱' : plant.difficulty === 'Mittel' ? '🌿' : '🌳'} {plant.difficulty}
                </span>
              </div>
            </div>

            {/* Month timeline bars */}
            <div className="space-y-1.5">
              {categories.filter(cat => categoryFilter[cat.key]).map(cat => {
                const months = getMonthsForCategory(plant, cat.key);
                if (months.length === 0) return null;

                return (
                  <div key={cat.key} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-earth-600 w-16 shrink-0 truncate">{cat.label}</span>
                    <div className="flex-1 flex gap-px">
                      {Array.from({ length: 12 }, (_, i) => {
                        const active = months.includes(i + 1);
                        const isCurrent = i === currentMonth;
                        return (
                          <div
                            key={i}
                            className={`h-4 flex-1 rounded-sm relative transition-colors ${
                              active ? cat.color : 'bg-sage-100'
                            } ${isCurrent ? 'ring-1 ring-accent-500 ring-offset-1' : ''}`}
                            title={`${MONTHS[i]}${active ? ` – ${cat.label}` : ''}`}
                          >
                            {isCurrent && (
                              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-500 rounded-full" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Month labels row */}
            <div className="flex gap-px mt-1 pl-[calc(4rem+0.5rem)]">
              {MONTHS.map((m, i) => (
                <span
                  key={i}
                  className={`flex-1 text-center text-[8px] ${
                    i === currentMonth ? 'font-bold text-accent-700' : 'text-sage-400'
                  }`}
                >
                  {m.charAt(0)}
                </span>
              ))}
            </div>

            {/* Notes */}
            {plant.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{plant.notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SowingCalendarMobileCards;
