import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { SowingCategory } from '@/types/sowing';

interface SowingCalendarFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  selectedSeason: string;
  setSelectedSeason: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
  categories: SowingCategory[];
  categoryFilter: Record<string, boolean>;
  setCategoryFilter: (value: React.SetStateAction<Record<string, boolean>>) => void;
  onReset: () => void;
}

const MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];

const SEASONS = ["Alle", "Frühling", "Sommer", "Herbst", "Winter"];
const TYPES = ["Alle", "Gemüse", "Obst", "Kräuter", "Blumen"];
const DIFFICULTIES = ["Alle", "Einfach", "Mittel", "Schwer"];

const SowingCalendarFilters: React.FC<SowingCalendarFiltersProps> = ({
  search,
  setSearch,
  selectedMonth,
  setSelectedMonth,
  selectedSeason,
  setSelectedSeason,
  selectedType,
  setSelectedType,
  selectedDifficulty,
  setSelectedDifficulty,
  categories,
  categoryFilter,
  setCategoryFilter,
  onReset
}) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="max-w-md mx-auto relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
        <Input
          type="search"
          placeholder="Nach Pflanzen suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-3 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
        />
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <Button
            key={cat.key}
            type="button"
            size="sm"
            variant={categoryFilter[cat.key] ? "default" : "outline"}
            className={`gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
              categoryFilter[cat.key] 
                ? `${cat.color} text-white shadow-md hover:shadow-lg` 
                : "bg-white border-sage-200 text-sage-700 hover:bg-sage-50"
            }`}
            onClick={() =>
              setCategoryFilter(f => ({
                ...f,
                [cat.key]: !f[cat.key],
              }))
            }
          >
            <span className={`${cat.color} w-3 h-3 rounded-full border border-white shadow-sm`}></span>
            <span className="text-sm font-medium">{cat.label}</span>
          </Button>
        ))}
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-earth-700">Monat</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="border-sage-200 focus:border-sage-400">
              <SelectValue placeholder="Monat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Alle Monate</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-earth-700">Saison</label>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="border-sage-200 focus:border-sage-400">
              <SelectValue placeholder="Saison" />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-earth-700">Art</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="border-sage-200 focus:border-sage-400">
              <SelectValue placeholder="Art" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-earth-700">Schwierigkeit</label>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="border-sage-200 focus:border-sage-400">
              <SelectValue placeholder="Schwierigkeit" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter zurücksetzen
        </Button>
      </div>
    </div>
  );
};

export default SowingCalendarFilters;