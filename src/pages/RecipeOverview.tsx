
import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { useQuery } from '@tanstack/react-query';
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeFilter from "@/components/recipes/RecipeFilter";
import { supabase } from "@/integrations/supabase/client";
import type { Recipe } from '@/types/content';
import { getRecipeImageUrl, parseJsonArray } from "@/utils/recipe";

// Die Kategorien, Saisons und Schwierigkeitsgrade
const categories = ['Alle', 'Süßes & Kuchen', 'Suppen & Eintöpfe', 'Salate & Vorspeisen', 'Konservieren'];
const seasons = ['Alle', 'frühling', 'sommer', 'herbst', 'winter', 'ganzjährig'];
const difficulties = ['Alle', 'einfach', 'mittel', 'schwer'];

// Rezepte aus Supabase laden
const fetchRecipes = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Hilfsfunktion: Supabase-RecipeRow zu Frontend-Recipe mit Defaults mappen
function mapRowToRecipe(row: any): Recipe {
  const prepTime = row.prep_time_minutes || 0;
  const cookTime = row.cook_time_minutes || 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    image: getRecipeImageUrl(row.image_url),
    prepTime: prepTime,
    cookTime: cookTime,
    totalTime: prepTime + cookTime,
    servings: row.servings || 1,
    difficulty: row.difficulty || 'einfach',
    category: row.category || 'Unbekannt',
    season: row.season || 'ganzjährig',
    tags: row.tags || [],
    ingredients: parseJsonArray(row.ingredients),
    instructions: parseJsonArray(row.instructions),
    nutrition: undefined,
    tips: [],
    relatedRecipes: [],
    publishedAt: row.created_at,
    author: row.author || 'Unbekannt',
    featured: false,
    seo: {
      title: row.title,
      description: row.description || '',
      keywords: row.tags || [],
    }
  }
}

const RecipeOverview = () => {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedSeason, setSelectedSeason] = useState<string>('Alle');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  // Data fetch
  const { data: recipeRows = [], isLoading, error } = useQuery({
    queryKey: ["all-recipes"],
    queryFn: fetchRecipes,
  });

  // Umwandeln in typisierte Recipes
  const recipes = useMemo(() => recipeRows.map(mapRowToRecipe), [recipeRows]);

  // Filter-Logik
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      // Kategorie
      if (selectedCategory !== 'Alle' && r.category !== selectedCategory) return false;
      // Saison
      if (selectedSeason !== 'Alle' && r.season !== selectedSeason) return false;
      // Schwierigkeit
      if (selectedDifficulty !== 'Alle' && r.difficulty !== selectedDifficulty) return false;
      // Suchbegriff
      if (
        searchTerm &&
        !(
          r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }
      return true;
    });
  }, [recipes, selectedCategory, selectedSeason, selectedDifficulty, searchTerm]);

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
          {/* Filter UI */}
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
          {isLoading ? (
            <div className="text-center py-12 text-earth-500">Lade Rezepte...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Fehler beim Laden der Rezepte.</div>
          ) : filteredRecipes.length > 0 ? (
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
