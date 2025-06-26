
import React, { useState } from "react";
import { Search, Filter, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type Season = 'Frühling' | 'Sommer' | 'Herbst' | 'Winter' | 'Ganzjährig';

interface BlogFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  seasons: Season[];
  selectedSeason: Season | '';
  setSelectedSeason: (s: Season | '') => void;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  sortOption: 'newest' | 'alphabetical' | 'length' | 'seo';
  setSortOption: (o: 'newest' | 'alphabetical' | 'length' | 'seo') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (d: 'asc' | 'desc') => void;
}

const BlogFilter: React.FC<BlogFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  seasons,
  selectedSeason,
  setSelectedSeason,
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  sortDirection,
  setSortDirection,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Erweiterte Tag-Liste für bessere Filterung
  const availableTags = [
    'Gartenpflege', 'Aussaat', 'Ernte', 'Kompost', 'Düngen', 'Bewässerung',
    'Schädlingsbekämpfung', 'Pflanzenschutz', 'Hochbeet', 'Gewächshaus',
    'Kräuter', 'Gemüse', 'Obst', 'Blumen', 'Stauden', 'Bäume',
    'Nachhaltigkeit', 'Bio', 'Permakultur', 'Urban Gardening',
    'DIY', 'Selbermachen', 'Upcycling', 'Werkzeuge',
    'Anfänger', 'Fortgeschritten', 'Profi-Tipps',
    'Saisonale Rezepte', 'Konservieren', 'Einkochen', 'Trocknen',
    'Bodenpflege', 'Mulchen', 'Gründüngung', 'Mischkultur'
  ];

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

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
    setSelectedCategory('');
    setSelectedSeason('');
    setSearchTerm('');
    setSelectedTags([]);
    setSortOption('newest');
    setSortDirection('desc');
  };

  const hasActiveFilters = selectedCategory || selectedSeason || searchTerm || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Erweiterte Suchleiste */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Durchsuche Titel, Inhalt, Tags, Kategorien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Schnellfilter Header */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="border-sage-200"
        >
          <Filter className="h-4 w-4 mr-2" />
          Erweiterte Filter
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-sage-600 hover:text-sage-800"
          >
            Alle Filter löschen
          </Button>
        )}
      </div>

      {/* Kategorie Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ""
              ? 'bg-sage-600 text-white'
              : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
          }`}
        >
          Alle Kategorien
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-sage-600 text-white'
                : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Erweiterte Filter */}
      {showAdvancedFilters && (
        <div className="bg-sage-25 rounded-lg p-6 space-y-6">
          {/* Saison Filter */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-3">Saison</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSeason("")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedSeason === ""
                    ? 'bg-sage-600 text-white'
                    : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
                }`}
              >
                Alle Saisons
              </button>
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedSeason === season
                      ? 'bg-sage-600 text-white'
                      : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

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
                className="mb-3"
              />
              
              {/* Tag Vorschläge */}
              {tagInput && filteredTags.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-sage-200 rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {filteredTags.slice(0, 8).map((tag) => (
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

            {/* Beliebte Tags */}
            <div>
              <p className="text-xs text-earth-500 mb-2">Beliebte Tags:</p>
              <div className="flex flex-wrap gap-1">
                {['Gartenpflege', 'Nachhaltigkeit', 'DIY', 'Kräuter', 'Anfänger', 'Bio'].map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    className="text-xs px-2 py-1 h-auto border-sage-200 hover:bg-sage-50"
                    disabled={selectedTags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
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
              <option value="length">Nach Länge</option>
              <option value="seo">SEO-Score</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="text-xs"
            >
              {sortDirection === 'asc' ? '⬆️ Aufsteigend' : '⬇️ Absteigend'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogFilter;
