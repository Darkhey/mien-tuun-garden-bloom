import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat, Search, Filter } from 'lucide-react';
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeFilter from "@/components/recipes/RecipeFilter";

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
          {/* Search & Filter ausgelagert */}
          <RecipeFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            seasons={seasons}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            difficulties={difficulties}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </section>
      {/* Recipes Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {filteredRecipes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard recipe={recipe} index={index} key={recipe.id} />
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
