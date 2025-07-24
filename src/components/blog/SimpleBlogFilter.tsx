import React, { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Vereinfachte Hauptkategorien (nur 4 statt 7)
const MAIN_CATEGORIES = [
  { id: 'gaertnern', name: 'Garten', icon: '🌱' },
  { id: 'gartenküche', name: 'Küche', icon: '🍅' },
  { id: 'diy-basteln', name: 'DIY', icon: '🔨' },
  { id: 'nachhaltigkeit', name: 'Nachhaltig', icon: '♻️' }
];

interface SimpleBlogFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  resultCount?: number;
  availableSearchSuggestions?: string[];
}

const SimpleBlogFilter: React.FC<SimpleBlogFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSeason,
  setSelectedSeason,
  resultCount = 0,
  availableSearchSuggestions = []
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debouncing für Live-Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Suchvorschläge basierend auf Eingabe
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return availableSearchSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
        suggestion.toLowerCase() !== searchTerm.toLowerCase()
      )
      .slice(0, 5);
  }, [searchTerm, availableSearchSuggestions]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeason('');
  };

  const hasActiveFilters = selectedCategory || selectedSeason || searchTerm;

  return (
    <div className="space-y-6">
      {/* Hauptkategorien - Immer sichtbar, prominent */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === ""
                ? 'bg-sage-600 text-white shadow-lg scale-105'
                : 'bg-white text-sage-700 hover:bg-sage-50 border border-sage-200 hover:shadow-md'
            }`}
          >
            🌿 Alle
          </button>
          {MAIN_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-sage-600 text-white shadow-lg scale-105'
                  : 'bg-white text-sage-700 hover:bg-sage-50 border border-sage-200 hover:shadow-md'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Vereinfachte Hauptsuche */}
      <div className="max-w-xl mx-auto relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Artikel durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-12 pr-12 py-3 text-base border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent shadow-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-sage-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Suchvorschläge */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 w-full bg-white border border-sage-200 rounded-lg shadow-lg mt-1 max-h-32 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(suggestion);
                  setShowSuggestions(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-sage-50 text-sm border-b border-sage-100 last:border-b-0"
              >
                <Search className="inline h-3 w-3 mr-2 text-sage-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Saisonfilter - Optional, kompakt */}
      {(selectedSeason || hasActiveFilters) && (
        <div className="flex justify-center">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-sage-600">Saison:</span>
            <button
              onClick={() => setSelectedSeason("")}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                selectedSeason === ""
                  ? 'bg-sage-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
              }`}
            >
              Alle
            </button>
            {['frühling', 'sommer', 'herbst', 'winter'].map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedSeason === season
                    ? 'bg-sage-600 text-white'
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
              >
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ergebnis-Anzeige und Filter zurücksetzen */}
      <div className="text-center space-y-2">
        <p className="text-sage-600 text-sm">
          {resultCount} Artikel gefunden
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-sage-500 hover:text-sage-700 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Filter zurücksetzen
          </Button>
        )}
      </div>
    </div>
  );
};

export default SimpleBlogFilter;