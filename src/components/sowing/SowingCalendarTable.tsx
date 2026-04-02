import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Info, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import SowingCalendarMobileCards from './SowingCalendarMobileCards';
import sowingCalendarService from '@/services/SowingCalendarService';
import type { PlantData, SowingCategory, CompanionPlantData } from '@/types/sowing';

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

interface SowingCalendarTableProps {
  plants: PlantData[];
  categories: SowingCategory[];
  categoryFilter: Record<string, boolean>;
  onPlantSelect?: (plantName: string) => void;
  monthFocus?: boolean;
  hoveredPlant?: string | null;
  onHoverPlant?: (name: string | null) => void;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
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

const SowingCalendarTable: React.FC<SowingCalendarTableProps> = ({
  plants, categories, categoryFilter, onPlantSelect,
  monthFocus = false, hoveredPlant, onHoverPlant,
  isFavorite, onToggleFavorite,
}) => {
  const isMobile = useIsMobile();
  const currentMonth = new Date().getMonth(); // 0-indexed

  // Companion plant data for highlighting
  const [companionData, setCompanionData] = useState<CompanionPlantData | null>(null);

  useEffect(() => {
    if (!hoveredPlant) { setCompanionData(null); return; }
    sowingCalendarService.getCompanionPlants(hoveredPlant).then(setCompanionData).catch(() => setCompanionData(null));
  }, [hoveredPlant]);

  // Compute companion highlight sets
  const goodNeighbors = useMemo(() => new Set(companionData?.good.map(g => g.plant) || []), [companionData]);
  const badNeighbors = useMemo(() => new Set(companionData?.bad.map(b => b.plant) || []), [companionData]);

  // Month focus: show 3 months around current
  const visibleMonths = useMemo(() => {
    if (!monthFocus) return Array.from({ length: 12 }, (_, i) => i);
    const prev = (currentMonth - 1 + 12) % 12;
    const next = (currentMonth + 1) % 12;
    return [prev, currentMonth, next];
  }, [monthFocus, currentMonth]);

  // Mobile cards
  if (isMobile) {
    return (
      <SowingCalendarMobileCards
        plants={plants} categories={categories} categoryFilter={categoryFilter}
        onPlantSelect={onPlantSelect}
        isFavorite={isFavorite} onToggleFavorite={onToggleFavorite}
      />
    );
  }

  const renderMonthCell = (plant: PlantData, col: number) => {
    const activeCategories = categories.filter(cat => {
      if (!categoryFilter[cat.key]) return false;
      return getMonthsForCategory(plant, cat.key).includes(col + 1);
    });
    if (activeCategories.length === 0) return null;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col gap-0.5 items-center cursor-help">
              {activeCategories.map(cat => (
                <div key={cat.key} className={`${cat.color} w-full h-2 rounded-sm shadow-sm`} />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {activeCategories.map(cat => (
              <p key={cat.key} className="text-xs">
                <span className="font-medium">{cat.label}</span> – {plant.name} im {MONTHS[col]}
              </p>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getRowHighlight = (plantName: string) => {
    if (!hoveredPlant || hoveredPlant === plantName) return '';
    if (goodNeighbors.has(plantName)) return 'bg-green-50 border-l-4 border-l-green-400';
    if (badNeighbors.has(plantName)) return 'bg-red-50 border-l-4 border-l-red-400';
    return '';
  };

  return (
    <>
      <div className="border border-sage-200 rounded-xl overflow-hidden bg-white shadow-sm print:shadow-none print:border-gray-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-sage-50/80 border-sage-200">
                <TableHead className="min-w-[40px] text-center font-bold text-earth-800 text-sm print:hidden">♥</TableHead>
                <TableHead className="min-w-[160px] sticky left-0 bg-sage-50/80 border-r border-sage-200 font-bold text-earth-800 z-20 text-sm">
                  Pflanze
                </TableHead>
                <TableHead className="min-w-[80px] text-center font-bold text-earth-800 text-sm print:min-w-0">Art</TableHead>
                <TableHead className="min-w-[100px] text-center font-bold text-earth-800 text-sm print:min-w-0">Level</TableHead>
                {visibleMonths.map((i) => (
                  <TableHead
                    key={i}
                    className={`text-center ${monthFocus ? 'w-24' : 'w-16'} font-bold text-sm transition-colors print:w-auto ${
                      i === currentMonth ? 'bg-accent-100 text-accent-800 relative' : 'text-earth-800'
                    }`}
                  >
                    <div className="text-xs">{MONTHS[i]}</div>
                    {i === currentMonth && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent-500 rounded-full print:hidden" />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {plants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4 + visibleMonths.length} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Info className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-lg font-medium">Keine Pflanzen gefunden</p>
                      <p className="text-sm">Passe deine Filter an oder setze sie zurück.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {plants.map((plant, index) => (
                <TableRow
                  key={plant.id}
                  className={`hover:bg-sage-50 transition-colors duration-150 border-sage-100 cursor-pointer group ${
                    index % 2 === 0 ? 'bg-white' : 'bg-sage-25/30'
                  } ${getRowHighlight(plant.name)}`}
                  onMouseEnter={() => onHoverPlant?.(plant.name)}
                  onMouseLeave={() => onHoverPlant?.(null)}
                >
                  <TableCell className="text-center print:hidden">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(plant.id); }}
                      className="p-1 rounded-full hover:bg-red-50 transition-colors"
                      aria-label={isFavorite?.(plant.id) ? 'Favorit entfernen' : 'Als Favorit merken'}
                    >
                      <Heart className={`h-4 w-4 transition-colors ${
                        isFavorite?.(plant.id) ? 'fill-red-500 text-red-500' : 'text-sage-300 hover:text-red-400'
                      }`} />
                    </button>
                  </TableCell>
                  <TableCell
                    className="sticky left-0 bg-inherit border-r border-sage-200 z-10"
                    onClick={() => onPlantSelect?.(plant.name)}
                  >
                    <div className="flex items-center gap-2 group-hover:text-sage-700 transition-colors">
                      <span className="font-semibold text-earth-800 group-hover:text-sage-700">{plant.name}</span>
                      <Info className="h-3 w-3 text-sage-400 opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center" onClick={() => onPlantSelect?.(plant.name)}>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plant.type === 'Gemüse' ? 'bg-green-100 text-green-700' :
                      plant.type === 'Kräuter' ? 'bg-purple-100 text-purple-700' :
                      plant.type === 'Obst' ? 'bg-orange-100 text-orange-700' :
                      'bg-pink-100 text-pink-700'
                    }`}>{plant.type}</span>
                  </TableCell>
                  <TableCell className="text-center" onClick={() => onPlantSelect?.(plant.name)}>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plant.difficulty === 'Einfach' ? 'bg-green-100 text-green-700' :
                      plant.difficulty === 'Mittel' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {plant.difficulty === 'Einfach' ? '🌱 Einfach' : plant.difficulty === 'Mittel' ? '🌿 Mittel' : '🌳 Schwer'}
                    </span>
                  </TableCell>
                  {visibleMonths.map((col) => (
                    <TableCell
                      key={col}
                      className={`text-center px-1 py-2 transition-colors ${col === currentMonth ? 'bg-accent-50/50' : ''}`}
                      onClick={() => onPlantSelect?.(plant.name)}
                    >
                      {renderMonthCell(plant, col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="px-4 py-3 bg-sage-25 border-t border-sage-200 text-sm text-sage-600 flex items-center justify-between print:hidden">
          <span>{plants.length} Pflanzen gefunden</span>
          <div className="flex items-center gap-3 text-xs">
            {hoveredPlant && (goodNeighbors.size > 0 || badNeighbors.size > 0) && (
              <span>
                <span className="text-green-600">🟢 Gute</span> / <span className="text-red-600">🔴 Schlechte</span> Nachbarn von {hoveredPlant}
              </span>
            )}
            <span>Klicke auf eine Pflanze für Details</span>
          </div>
        </div>
      </div>

      {/* Print styles - fixed */}
      <style>{`
        @media print {
          nav, header, footer, .print\\:hidden, [class*="print:hidden"] { display: none !important; }
          body { font-size: 10px; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
          th, td { padding: 2px 4px !important; }
        }
      `}</style>
    </>
  );
};

export default SowingCalendarTable;
