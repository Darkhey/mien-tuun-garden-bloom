
import React from "react";
import { Filter } from "lucide-react";

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
  <>
    {/* Search */}
    <div className="max-w-md mx-auto relative mb-8">
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.35-4.35"></path></svg>
      <input
        type="text"
        placeholder="Rezepte durchsuchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
      />
    </div>
    {/* Filters */}
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-earth-700 mb-2">
          <Filter className="h-4 w-4 inline mr-1" />
          Kategorie
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-earth-700 mb-2">Saison</label>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="w-full p-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent"
        >
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season === "Alle" ? season : season.charAt(0).toUpperCase() + season.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-earth-700 mb-2">Schwierigkeit</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="w-full p-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty === "Alle" ? difficulty : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  </>
);
export default RecipeFilter;
