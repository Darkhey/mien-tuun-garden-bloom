import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";

// Wir nutzen das Storage-Bucket!
const SUPABASE_STORAGE_URL = "https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/recipe-images/";

const fetchRecipes = async () => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const RecipeBook = () => {
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ["recipe-book"],
    queryFn: fetchRecipes,
  });

  function getIngredientsCount(ingredients: any): number {
    if (Array.isArray(ingredients)) {
      return ingredients.length;
    }
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

  return (
    <Layout title="Mein Rezeptbuch">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-earth-800 mb-8 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-sage-600" />
          Mein Rezeptbuch
        </h1>
        {isLoading && (
          <div className="text-center py-16 text-earth-500">Lade Rezepte...</div>
        )}
        {error && (
          <div className="text-center py-16 text-destructive-600">
            Fehler beim Laden der Rezepte!
          </div>
        )}
        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {recipes.map((r) => {
              const [imgError, setImgError] = React.useState(false); // Lokale Fehlerstate pro Rezept
              return (
                <Link
                  key={r.id}
                  to={`/rezepte/${r.slug}`}
                  className="transition-transform transform hover:-translate-y-1"
                >
                  <Card className="p-0 overflow-hidden rounded-2xl shadow group bg-white/90 hover:shadow-lg">
                    <img
                      src={imgError ? "/placeholder.svg" : getRecipeImageUrl(r.image_url)}
                      alt={r.title}
                      className="h-40 w-full object-cover group-hover:scale-105 duration-200"
                      onError={() => setImgError(true)}
                    />
                    <div className="p-5">
                      <h2 className="font-bold text-lg mb-2 font-serif text-earth-800">
                        {r.title}
                      </h2>
                      <div className="text-sage-600 mb-2 truncate-2">
                        {r.description}
                      </div>
                      <div className="flex gap-2 text-xs text-sage-400 mt-2">
                        <span>
                          {getIngredientsCount(r.ingredients) > 1
                            ? `${getIngredientsCount(r.ingredients)} Zutaten`
                            : getIngredientsCount(r.ingredients) === 1
                            ? "1 Zutat"
                            : "Keine Zutaten"}
                        </span>
                        {r.source_blog_slug && (
                          <span className="ml-auto bg-accent-50 px-2 rounded-full">
                            KI-generiert
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center text-sage-500 text-xl">
            Noch keine Rezepte gespeichert.
          </div>
        )}
      </section>
    </Layout>
  );
};
export default RecipeBook;
