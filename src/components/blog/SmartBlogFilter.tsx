
import React, { useState, useMemo } from "react";
import { Search, Filter, X, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SMART_CATEGORIES, SEASONS } from "@/utils/smartCategoryMapping";

interface SmartBlogFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
  sortOption: 'newest' | 'alphabetical' | 'relevance';
  setSortOption: (option: 'newest' | 'alphabetical' | 'relevance') => void;
  resultCount?: number;
}

const SmartBlogFilter: React.FC<SmartBlogFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSeason,
  setSelectedSeason,
  selectedTags,
  setSelectedTags,
  availableTags,
  sortOption,
  setSortOption,
  resultCount = 0
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const filteredTagSuggestions = useMemo(() => {
    if (!tagInput) return [];
    return availableTags
      .filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(tag)
      )
      .slice(0, 8);
  }, [tagInput, availableTags, selectedTags]);

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeason('');
    setSelectedTags([]);
    setSortOption('newest');
  };

  const hasActiveFilters = selectedCategory || selectedSeason || searchTerm || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Hauptsuche */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Durchsuche Artikel nach Titel, Inhalt oder Tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-12 py-4 text-lg border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Kategorie Filter - Immer sichtbar */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-earth-700 text-center">Kategorien</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === ""
                ? 'bg-sage-600 text-white shadow-md'
                : 'bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200'
            }`}
          >
            🌿 Alle Kategorien
          </button>
          {SMART_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-sage-600 text-white shadow-md'
                  : 'bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Saison Filter - Immer sichtbar */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-earth-700 text-center flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          Saison
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedSeason("")}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
              selectedSeason === ""
                ? 'bg-sage-600 text-white'
                : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
            }`}
          >
            Alle Saisons
          </button>
          {SEASONS.map((season) => (
            <button
              key={season.id}
              onClick={() => setSelectedSeason(season.id)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 flex items-center gap-1 ${
                selectedSeason === season.id
                  ? 'bg-sage-600 text-white'
                  : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
              }`}
            >
              <span>{season.icon}</span>
              {season.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter-Aktionen */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="border-sage-200"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showAdvancedFilters ? 'Weniger Filter' : 'Erweiterte Filter'}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-sage-600 hover:text-sage-800"
          >
            <X className="h-4 w-4 mr-2" />
            Filter zurücksetzen
          </Button>
        )}
      </div>

      {/* Erweiterte Filter */}
      {showAdvancedFilters && (
        <div className="bg-sage-25 rounded-lg p-6 space-y-6">
          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-3">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags
            </label>
            
            {/* Ausgewählte Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-sage-100 text-sage-800 hover:bg-sage-200"
                  >
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="ml-1 h-4 w-4 p-0 hover:bg-sage-300"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Tag suchen und hinzufügen..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              
              {/* Tag Vorschläge */}
              {filteredTagSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-sage-200 rounded-md shadow-lg max-h-32 overflow-y-auto mt-1">
                  {filteredTagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="block w-full text-left px-3 py-2 hover:bg-sage-50 text-sm"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sortierung */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-earth-700">Sortieren nach:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="border border-sage-200 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-sage-300"
            >
              <option value="newest">Neueste zuerst</option>
              <option value="alphabetical">Alphabetisch</option>
              <option value="relevance">Relevanz</option>
            </select>
          </div>
        </div>
      )}

      {/* Ergebnis-Anzeige */}
      <div className="text-center">
        <p className="text-earth-600 text-sm">
          {resultCount} Artikel gefunden
          {hasActiveFilters && ' (gefiltert)'}
        </p>
      </div>
    </div>
  );
};

export default SmartBlogFilter;
