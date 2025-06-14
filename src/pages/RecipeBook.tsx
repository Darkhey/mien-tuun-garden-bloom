import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import SavedRecipeCard from "@/components/recipe/SavedRecipeCard";

const fetchSavedRecipes = async (userId: string) => {
    const { data: saved, error: savedError } = await supabase
      .from('saved_recipes')
      .select('recipe_slug')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (savedError) throw savedError;
    if (!saved || saved.length === 0) return [];

    const recipeSlugs = saved.map(s => s.recipe_slug);

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .in("slug", recipeSlugs);

    if (error) throw error;
    
    const orderedRecipes = recipeSlugs.map(slug => data.find(recipe => recipe.slug === slug)).filter(Boolean);
    
    return orderedRecipes as typeof data;
};

const RecipeBook = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setAuthLoading(true);
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ["saved-recipes", userId], 
    queryFn: () => fetchSavedRecipes(userId!),
    enabled: !!userId,
  });

  function getIngredientsCount(ingredients: any): number {
    if (Array.isArray(ingredients)) return ingredients.length;
    try {
      const parsed = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
      if (Array.isArray(parsed)) return parsed.length;
    } catch (e) {}
    return 0;
  }

  function getRecipeImageUrl(imagePath: string | null): string {
    if (!imagePath) return "/placeholder.svg";
    return SUPABASE_STORAGE_URL + imagePath;
  }
  
  const renderContent = () => {
    if (authLoading || (isLoading && userId)) {
        return <div className="text-center py-16 text-earth-500">Lade dein Rezeptbuch...</div>;
    }
    
    if (error) {
        return <div className="text-center py-16 text-destructive-600">Fehler beim Laden der Rezepte!</div>;
    }

    if (!userId) {
        return (
            <div className="py-24 text-center text-sage-500 text-xl flex flex-col items-center gap-4">
              <p>Melde dich an, um dein persönliches Rezeptbuch zu sehen.</p>
              <Button asChild>
                <Link to="/auth">Jetzt anmelden oder registrieren</Link>
              </Button>
            </div>
        );
    }
    
    if (recipes && recipes.length > 0) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {recipes.map((r) => {
              if (!r) return null;
              return <SavedRecipeCard key={r.id} recipe={r} />;
            })}
          </div>
        );
    }

    if (recipes && recipes.length === 0) {
       return (
            <div className="py-24 text-center text-sage-500 text-xl flex flex-col items-center gap-4">
              <p>Du hast noch keine Rezepte gespeichert.</p>
               <Button asChild variant="secondary">
                <Link to="/rezepte">Jetzt Rezepte entdecken</Link>
              </Button>
            </div>
          );
    }

    return null;
  }

  return (
    <Layout title="Mein Rezeptbuch">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-earth-800 mb-8 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-sage-600" />
          Mein Rezeptbuch
        </h1>
        {renderContent()}
      </section>
    </Layout>
  );
};
export default RecipeBook;
