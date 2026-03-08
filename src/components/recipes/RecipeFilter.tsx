import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RecipeFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  seasons: string[];
  selectedSeason: string;
  setSelectedSeason: (v: string) => void;
  difficulties: string[];
  selectedDifficulty: string;
  setSelectedDifficulty: (v: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

const RecipeFilter: React.FC<RecipeFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  seasons,
  selectedSeason,
  setSelectedSeason,
  difficulties,
  selectedDifficulty,
  setSelectedDifficulty,
  searchTerm,
  setSearchTerm,
}) => (
  <div className="space-y-6">
    {/* Search */}
    <div className="max-w-md mx-auto relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Rezepte durchsuchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 rounded-full"
      />
    </div>
    {/* Filters */}
    <div className="grid md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          <Filter className="h-3.5 w-3.5 inline mr-1" />
          Kategorie
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2.5 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Saison</label>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="w-full p-2.5 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
        >
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season === "Alle" ? season : season.charAt(0).toUpperCase() + season.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Schwierigkeit</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="w-full p-2.5 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty === "Alle" ? difficulty : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default RecipeFilter;
