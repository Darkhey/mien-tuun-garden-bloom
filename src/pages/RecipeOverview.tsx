import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat, Search, Filter } from 'lucide-react';

// Mock Rezept-Daten
const recipes = [
  {
    id: '1',
    slug: 'zucchini-muffins',
    title: 'Saftige Zucchini-Muffins',
    description: 'Gesunde Muffins mit Zucchini aus dem eigenen Garten - perfekt für den Nachmittagskaffee.',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&h=600&fit=crop',
    prepTime: 15,
    cookTime: 25,
    totalTime: 40,
    servings: 12,
    difficulty: 'einfach' as const,
    category: 'Süßes & Kuchen',
    season: 'sommer' as const,
    tags: ['Zucchini', 'Muffins', 'Gesund', 'Backen']
  },
  {
    id: '2',
    slug: 'kraeuteroel-selbermachen',
    title: 'Aromatisches Kräuteröl',
    description: 'Selbstgemachtes Kräuteröl mit frischen Kräutern aus dem Garten. Perfekt zum Verfeinern von Salaten.',
    image: 'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=800&h=600&fit=crop',
    prepTime: 10,
    cookTime: 0,
    totalTime: 10,
    servings: 8,
    difficulty: 'einfach' as const,
    category: 'Konservieren',
    season: 'ganzjährig' as const,
    tags: ['Kräuter', 'Öl', 'Konservieren', 'Selbermachen']
  },
  {
    id: '3',
    slug: 'kuerbissuppe-ingwer',
    title: 'Kürbis-Ingwer-Suppe',
    description: 'Wärmende Herbstsuppe mit frischem Ingwer und Kräutern. Perfekt für kalte Tage.',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&h=600&fit=crop',
    prepTime: 20,
    cookTime: 30,
    totalTime: 50,
    servings: 4,
    difficulty: 'mittel' as const,
    category: 'Suppen & Eintöpfe',
    season: 'herbst' as const,
    tags: ['Kürbis', 'Suppe', 'Ingwer', 'Herbst']
  },
  {
    id: '4',
    slug: 'tomaten-basilikum-salat',
    title: 'Tomaten-Basilikum-Salat',
    description: 'Frischer Sommersalat mit Tomaten und Basilikum direkt aus dem Garten.',
    image: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800&h=600&fit=crop',
    prepTime: 15,
    cookTime: 0,
    totalTime: 15,
    servings: 4,
    difficulty: 'einfach' as const,
    category: 'Salate & Vorspeisen',
    season: 'sommer' as const,
    tags: ['Tomaten', 'Basilikum', 'Salat', 'Frisch']
  }
];

const RecipeOverview = () => {
  // Keine lokalen Rezepte (Backend-Anbindung erforderlich)
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedSeason, setSelectedSeason] = useState<string>('Alle');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Alle', 'Süßes & Kuchen', 'Suppen & Eintöpfe', 'Salate & Vorspeisen', 'Konservieren'];
  const seasons = ['Alle', 'frühling', 'sommer', 'herbst', 'winter', 'ganzjährig'];
  const difficulties = ['Alle', 'einfach', 'mittel', 'schwer'];

  // Es gibt keine Rezepte mehr (liste ist leer)
  const filteredRecipes: any[] = [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'einfach': return 'bg-green-100 text-green-800';
      case 'mittel': return 'bg-yellow-100 text-yellow-800';
      case 'schwer': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'frühling': return 'bg-green-100 text-green-800';
      case 'sommer': return 'bg-yellow-100 text-yellow-800';
      case 'herbst': return 'bg-orange-100 text-orange-800';
      case 'winter': return 'bg-blue-100 text-blue-800';
      default: return 'bg-sage-100 text-sage-800';
    }
  };

  return (
    <Layout title={`Rezepte - ${siteConfig.title}`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 to-sage-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Saisonale Rezepte
          </h1>
          <p className="text-xl text-earth-600 mb-8">
            Entdecke köstliche Rezepte mit frischen Zutaten aus Garten und Region
          </p>
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rezepte durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
            />
          </div>
        </div>
      </section>
      {/* Filters */}
      <section className="py-8 px-4 bg-white border-b border-sage-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Category Filter */}
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
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {/* Season Filter */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Saison
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full p-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent"
              >
                {seasons.map(season => (
                  <option key={season} value={season}>
                    {season === 'Alle' ? season : season.charAt(0).toUpperCase() + season.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Schwierigkeit
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'Alle' ? difficulty : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>
      {/* Recipes Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {filteredRecipes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe, index) => (
                <article
                  key={recipe.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeasonColor(recipe.season)}`}>
                        {recipe.season}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-sage-600 text-sm font-medium">
                        {recipe.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-serif font-bold text-earth-800 mb-3 line-clamp-2">
                      {recipe.title}
                    </h3>
                    
                    <p className="text-earth-600 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-earth-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {recipe.totalTime}m
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {recipe.servings}
                      </div>
                      <div className="flex items-center">
                        <ChefHat className="h-4 w-4 mr-1" />
                        {recipe.difficulty}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-sage-50 text-sage-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link
                      to={`/rezepte/${recipe.slug}`}
                      className="block w-full bg-sage-600 text-white text-center py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors"
                    >
                      Rezept anzeigen
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-earth-500 text-lg">
                Keine Rezepte gefunden. Versuche andere Filter oder Suchbegriffe.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default RecipeOverview;
