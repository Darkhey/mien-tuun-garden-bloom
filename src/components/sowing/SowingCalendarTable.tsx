import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import SowingCalendarMobileCards from './SowingCalendarMobileCards';
import type { PlantData, SowingCategory } from '@/types/sowing';

const MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];

interface SowingCalendarTableProps {
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

const SowingCalendarTable: React.FC<SowingCalendarTableProps> = ({ 
  plants, 
  categories,
  categoryFilter,
  onPlantSelect
}) => {
  const isMobile = useIsMobile();
  const currentMonth = new Date().getMonth(); // 0-indexed

  // On mobile, show card view
  if (isMobile) {
    return (
      <SowingCalendarMobileCards
        plants={plants}
        categories={categories}
        categoryFilter={categoryFilter}
        onPlantSelect={onPlantSelect}
      />
    );
  }

  // Render colored bar segments instead of dots
  const renderMonthCell = (plant: PlantData, col: number) => {
    const activeCategories = categories.filter(cat => {
      if (!categoryFilter[cat.key]) return false;
      const months = getMonthsForCategory(plant, cat.key);
      return months.includes(col + 1);
    });

    if (activeCategories.length === 0) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col gap-0.5 items-center cursor-help">
              {activeCategories.map(cat => (
                <div
                  key={cat.key}
                  className={`${cat.color} w-full h-2 rounded-sm shadow-sm`}
                />
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

  return (
    <>
      <div className="border border-sage-200 rounded-xl overflow-hidden bg-white shadow-sm print:shadow-none print:border-gray-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-sage-50/80 border-sage-200">
                <TableHead className="min-w-[160px] sticky left-0 bg-sage-50/80 border-r border-sage-200 font-bold text-earth-800 z-20 text-sm">
                  Pflanze
                </TableHead>
                <TableHead className="min-w-[80px] text-center font-bold text-earth-800 text-sm print:min-w-0">
                  Art
                </TableHead>
                <TableHead className="min-w-[100px] text-center font-bold text-earth-800 text-sm print:min-w-0">
                  Level
                </TableHead>
                {MONTHS.map((month, i) => (
                  <TableHead 
                    key={i} 
                    className={`text-center w-16 font-bold text-sm transition-colors print:w-auto ${
                      i === currentMonth 
                        ? 'bg-accent-100 text-accent-800 relative' 
                        : 'text-earth-800'
                    }`}
                  >
                    <div className="text-xs">{month}</div>
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
                  <TableCell colSpan={15} className="text-center text-muted-foreground py-12">
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
                  }`}
                  onClick={() => onPlantSelect?.(plant.name)}
                >
                  <TableCell className="sticky left-0 bg-inherit border-r border-sage-200 z-10">
                    <div className="flex items-center gap-2 group-hover:text-sage-700 transition-colors">
                      <span className="font-semibold text-earth-800 group-hover:text-sage-700">{plant.name}</span>
                      <Info className="h-3 w-3 text-sage-400 opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plant.type === 'Gemüse' 
                        ? 'bg-green-100 text-green-700' 
                        : plant.type === 'Kräuter'
                        ? 'bg-purple-100 text-purple-700'
                        : plant.type === 'Obst'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {plant.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plant.difficulty === 'Einfach' 
                        ? 'bg-green-100 text-green-700' 
                        : plant.difficulty === 'Mittel'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {plant.difficulty === 'Einfach' ? '🌱 Einfach' : plant.difficulty === 'Mittel' ? '🌿 Mittel' : '🌳 Schwer'}
                    </span>
                  </TableCell>
                  {Array.from({ length: 12 }, (_, col) => (
                    <TableCell 
                      key={col} 
                      className={`text-center px-1 py-2 transition-colors ${
                        col === currentMonth ? 'bg-accent-50/50' : ''
                      }`}
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
          <span className="text-xs">Klicke auf eine Pflanze für Details</span>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          table { font-size: 10px; }
          th, td { padding: 2px 4px !important; }
        }
      `}</style>
    </>
  );
};

export default SowingCalendarTable;
