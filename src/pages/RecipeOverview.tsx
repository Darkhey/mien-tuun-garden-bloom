import React, { useState, useMemo } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from '@tanstack/react-query';
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeFilter from "@/components/recipes/RecipeFilter";
import AdPlaceholder from "@/components/AdPlaceholder";
import NewsletterSignup from "@/components/NewsletterSignup";
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Sprout } from 'lucide-react';

const categories = ['Alle', 'Süßes & Kuchen', 'Suppen & Eintöpfe', 'Salate & Vorspeisen', 'Konservieren', 'Hauptgerichte', 'Beilagen'];
const seasons = ['Alle', 'frühling', 'sommer', 'herbst', 'winter', 'ganzjährig'];
const difficulties = ['Alle', 'einfach', 'mittel', 'schwer'];

const fetchRecipes = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .in('status', ['veröffentlicht', 'published'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const RecipeOverview = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedSeason, setSelectedSeason] = useState<string>('Alle');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: recipeRows = [], isLoading, error } = useQuery({
    queryKey: ["all-recipes"],
    queryFn: fetchRecipes,
    staleTime: 5 * 60 * 1000,
  });

  const filteredRecipes = useMemo(() => {
    return recipeRows.filter((r) => {
      if (selectedCategory !== 'Alle' && r.category !== selectedCategory) return false;
      if (selectedSeason !== 'Alle' && r.season !== selectedSeason) return false;
      if (selectedDifficulty !== 'Alle' && r.difficulty !== selectedDifficulty) return false;
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
    <>
      <Helmet>
        <title>Saisonale Rezepte aus Garten & Region | Mien Tuun</title>
        <meta name="description" content="Kreative Rezepte mit saisonalen Zutaten aus dem eigenen Garten. Einfach, nachhaltig und lecker – von Marianne aus Ostfriesland." />
        <meta name="keywords" content="Rezepte, saisonal kochen, Gartenrezepte, nachhaltig, vegetarisch, Ostfriesland, Kräuterküche" />
        <meta property="og:title" content="Saisonale Rezepte aus Garten & Region | Mien Tuun" />
        <meta property="og:description" content="Kreative Rezepte mit saisonalen Zutaten aus dem eigenen Garten. Einfach, nachhaltig und lecker." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary to-background py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 garden-badge mb-4 text-sm">
            <Sprout className="w-4 h-4" /> Mariannes Küche
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Saisonale Rezepte aus Garten & Region
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lass dich inspirieren von einfachen, saisonalen Rezepten – frisch aus meinem Garten direkt auf deinen Teller!
          </p>
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

      {/* Recipes Grid + Ads */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-muted rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">Fehler beim Laden der Rezepte.</p>
              <p className="text-muted-foreground mt-2">Bitte versuche es später erneut.</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.slice(0, 3).map((recipe, index) => (
                  <RecipeCard recipe={recipe} index={index} key={recipe.id} />
                ))}
              </div>

              {/* Ad slot after first row */}
              {filteredRecipes.length > 3 && (
                <div className="my-10">
                  <AdPlaceholder
                    text="🌿 Werbung – Unterstütze Mien Tuun"
                    className="max-w-3xl mx-auto"
                  />
                </div>
              )}

              {filteredRecipes.length > 3 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRecipes.slice(3, 6).map((recipe, index) => (
                    <RecipeCard recipe={recipe} index={index} key={recipe.id} />
                  ))}
                </div>
              )}

              {/* Affiliate / product recommendation */}
              {filteredRecipes.length > 6 && (
                <div className="my-10 bg-card rounded-2xl border border-border p-6 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Empfehlung</p>
                  <h3 className="text-lg font-serif font-bold text-foreground mb-2">Mariannes Lieblings-Küchenhelfer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Entdecke die Küchenutensilien, die ich täglich benutze – ausgewählt für nachhaltiges Kochen.
                  </p>
                  <AdPlaceholder text="Affiliate-Produktempfehlungen" className="max-w-2xl mx-auto" />
                </div>
              )}

              {filteredRecipes.length > 6 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {filteredRecipes.slice(6).map((recipe, index) => (
                    <RecipeCard recipe={recipe} index={index} key={recipe.id} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-2xl mb-2">🥕</p>
              <p className="text-foreground text-lg font-medium mb-2">
                Keine Rezepte gefunden
              </p>
              <p className="text-muted-foreground">
                Versuche andere Filter oder Suchbegriffe.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            🌱 Neue Rezepte direkt ins Postfach
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Jeden Monat saisonale Rezepte und Gartentipps – kostenlos.
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* Cross-link to Rezeptbuch */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between bg-card rounded-2xl border border-border p-6 gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Dein persönliches Rezeptbuch</h3>
              <p className="text-sm text-muted-foreground">Speichere deine Lieblingsrezepte an einem Ort.</p>
            </div>
          </div>
          <Link
            to="/mein-rezeptbuch"
            className="inline-flex items-center bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium text-sm hover:opacity-90 transition whitespace-nowrap"
          >
            Zum Rezeptbuch <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default RecipeOverview;
