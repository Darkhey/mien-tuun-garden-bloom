import React, { useState, useMemo } from 'react';
import { Helmet } from "react-helmet";
import Layout from '@/components/Layout';
import { siteConfig } from '@/config/site.config';
import { useQuery } from '@tanstack/react-query';
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeFilter from "@/components/recipes/RecipeFilter";
import { supabase } from "@/integrations/supabase/client";

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

  // Filter-Logik
  const filteredRecipes = useMemo(() => {
    return recipeRows.filter((r) => {
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
  }, [recipeRows, selectedCategory, selectedSeason, selectedDifficulty, searchTerm]);

  return (
    <Layout>
      <Helmet>
        <title>Rezepte – saisonal, nachhaltig & lecker | Mien Tuun</title>
        <meta name="description" content="Kreative Rezepte mit saisonalen Zutaten, nachhaltige Kochideen und Inspiration für Neulinge & Hobbyköche. Entdecke abwechslungsreiche, gesunde Gerichte!" />
        <meta name="keywords" content="Rezepte, Kochen, saisonal, gesund, nachhaltig, vegetarisch, vegan, Mien Tuun, Küche, Gemüserezepte, schnelle Gerichte" />
        <meta property="og:title" content="Rezepte – saisonal, nachhaltig & lecker | Mien Tuun" />
        <meta property="og:description" content="Kreative Rezepte mit saisonalen Zutaten, nachhaltige Kochideen und Inspiration für Neulinge & Hobbyköche. Entdecke abwechslungsreiche, gesunde Gerichte!" />
      </Helmet>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 to-sage-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Saisonale Rezepte aus Garten & Region
          </h1>
          <p className="text-xl text-earth-600 mb-8">
            Lass dich inspirieren von saisonalen, einfachen & gesunden Rezepten – für mehr Genuss und Nachhaltigkeit in deiner Küche!
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
