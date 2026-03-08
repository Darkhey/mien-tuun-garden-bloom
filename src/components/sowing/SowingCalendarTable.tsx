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

const SowingCalendarTable: React.FC<SowingCalendarTableProps> = ({ 
  plants, 
  categories,
  categoryFilter,
  onPlantSelect
}) => {
  const currentMonth = new Date().getMonth(); // 0-indexed

  const renderMonthDots = (plant: PlantData, col: number) => {
    return (
      <TooltipProvider>
        {categories.map(({ key, color, label }) => {
          let months: number[] = [];
          
          switch (key) {
            case 'directSow':
              months = plant.directSow || [];
              break;
            case 'indoor':
              months = plant.indoor || [];
              break;
            case 'plantOut':
              months = plant.plantOut || [];
              break;
            case 'harvest':
              months = plant.harvest || [];
              break;
            default:
              return null;
          }
          
          return categoryFilter[key] && months.includes(col + 1) ? (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <span
                  className={`${color} inline-block w-3.5 h-3.5 rounded-full mx-0.5 shadow-sm border-2 border-white cursor-help transition-transform hover:scale-125`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{plant.name} im {MONTHS[col]}</p>
              </TooltipContent>
            </Tooltip>
          ) : null;
        })}
      </TooltipProvider>
    );
  };

  return (
    <div className="border border-sage-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-sage-50/80 border-sage-200">
              <TableHead className="min-w-[160px] sticky left-0 bg-sage-50/80 border-r border-sage-200 font-bold text-earth-800 z-20 text-sm">
                Pflanze
              </TableHead>
              <TableHead className="min-w-[80px] text-center font-bold text-earth-800 text-sm">
                Art
              </TableHead>
              <TableHead className="min-w-[100px] text-center font-bold text-earth-800 text-sm">
                Level
              </TableHead>
              {MONTHS.map((month, i) => (
                <TableHead 
                  key={i} 
                  className={`text-center w-16 font-bold text-sm transition-colors ${
                    i === currentMonth 
                      ? 'bg-accent-100 text-accent-800 relative' 
                      : 'text-earth-800'
                  }`}
                >
                  <div className="text-xs">{month}</div>
                  {i === currentMonth && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent-500 rounded-full" />
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 group-hover:text-sage-700 transition-colors">
                          <span className="font-semibold text-earth-800 group-hover:text-sage-700">{plant.name}</span>
                          <Info className="h-3 w-3 text-sage-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm font-medium mb-1">{plant.name}</p>
                        <p className="text-xs text-muted-foreground">{plant.notes || 'Klicke für Anbautipps'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                    className={`text-center px-2 py-3 transition-colors ${
                      col === currentMonth ? 'bg-accent-50/50' : ''
                    }`}
                  >
                    <div className="flex flex-wrap gap-0.5 justify-center items-center min-h-[1.5rem]">
                      {renderMonthDots(plant, col)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Results count */}
      <div className="px-4 py-3 bg-sage-25 border-t border-sage-200 text-sm text-sage-600 flex items-center justify-between">
        <span>{plants.length} Pflanzen gefunden</span>
        <span className="text-xs">Klicke auf eine Pflanze für Anbautipps</span>
      </div>
    </div>
  );
};

export default SowingCalendarTable;
