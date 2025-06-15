
import React from "react";

const SEASONS = ["Frühling", "Sommer", "Herbst", "Winter"];

interface BlogFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedSeason: string;
  setSelectedSeason: (s: string) => void;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
}

const BlogFilter: React.FC<BlogFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSeason,
  setSelectedSeason,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <>
      <div className="max-w-md mx-auto relative mb-8">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.35-4.35"></path></svg>
        <input
          type="text"
          placeholder="Artikel durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
        />
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
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
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button
          onClick={() => setSelectedSeason("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedSeason === ""
              ? 'bg-sage-600 text-white'
              : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
          }`}
        >
          Alle Jahreszeiten
        </button>
        {SEASONS.map((season) => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSeason === season
                ? 'bg-sage-600 text-white'
                : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
            }`}
          >
            {season}
          </button>
        ))}
      </div>
    </>
  );
};

export default BlogFilter;

