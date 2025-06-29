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
  const renderMonthDots = (plant: PlantData, col: number) => {
    return (
      <TooltipProvider>
        {categories.map(({ key, color, label }) =>
          categoryFilter[key] && (plant[key as keyof PlantData] as number[])?.includes(col + 1) ? (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <span
                  className={`${color} inline-block w-3 h-3 rounded-full mx-0.5 shadow-sm border border-white cursor-help`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{label} für {plant.name} im {MONTHS[col]}</p>
              </TooltipContent>
            </Tooltip>
          ) : null
        )}
      </TooltipProvider>
    );
  };

  return (
    <div className="border border-sage-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-sage-50">
            <TableRow className="border-sage-200">
              <TableHead className="min-w-[140px] sticky left-0 bg-sage-50 border-r border-sage-200 font-semibold text-earth-800 z-20">
                Pflanze
              </TableHead>
              <TableHead className="min-w-[80px] text-center font-semibold text-earth-800">
                Art
              </TableHead>
              <TableHead className="min-w-[100px] text-center font-semibold text-earth-800">
                Schwierigkeit
              </TableHead>
              {MONTHS.map((month, i) => (
                <TableHead key={i} className="text-center w-16 font-semibold text-earth-800">
                  <div className="text-xs">{month}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants.length === 0 && (
              <TableRow>
                <TableCell colSpan={15} className="text-center text-sage-500 py-8 italic">
                  Keine passenden Einträge gefunden.
                </TableCell>
              </TableRow>
            )}
            {plants.map((plant, index) => (
              <TableRow 
                key={plant.id} 
                className={`hover:bg-sage-25 transition-colors duration-150 border-sage-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-sage-25/30'
                } cursor-pointer`}
                onClick={() => onPlantSelect?.(plant.name)}
              >
                <TableCell className="sticky left-0 bg-inherit border-r border-sage-200 z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          <span className="font-semibold text-earth-800">{plant.name}</span>
                          <Info className="h-3 w-3 text-sage-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm font-medium mb-1">Anbautipps:</p>
                        <p className="text-sm">{plant.notes}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    plant.type === 'Gemüse' 
                      ? 'bg-green-100 text-green-800' 
                      : plant.type === 'Kräuter'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {plant.type}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    plant.difficulty === 'Einfach' 
                      ? 'bg-green-100 text-green-800' 
                      : plant.difficulty === 'Mittel'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plant.difficulty}
                  </span>
                </TableCell>
                {Array.from({ length: 12 }, (_, col) => (
                  <TableCell key={col} className="text-center px-2 py-3">
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
    </div>
  );
};

export default SowingCalendarTable;