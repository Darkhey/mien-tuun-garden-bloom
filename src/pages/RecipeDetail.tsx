import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import IngredientList from "@/components/IngredientList";
import RecipeStep from "@/components/RecipeStep";
import { useToast } from "@/hooks/use-toast";
import RecipeStructuredData from "@/components/recipe/RecipeStructuredData";
import RecipeRating from "@/components/recipe/RecipeRating";
import RecipeComments from "@/components/recipe/RecipeComments";
import SaveRecipeButton from "@/components/recipe/SaveRecipeButton";
import { parseJsonArray, getRecipeImageUrl } from "@/utils/recipe";

const fetchRecipeBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const RecipeDetail = () => {
  const { id: slug } = useParams();
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ["recipe-detail", slug],
    queryFn: () => fetchRecipeBySlug(slug!),
    enabled: !!slug,
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [recipeRating, setRecipeRating] = useState<{
    average: number | null;
    count: number;
  }>({ average: null, count: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);
  
  useEffect(() => {
    if (!slug) return;
    const fetchRating = async () => {
      const { data, count } = await supabase
        .from("recipe_ratings")
        .select("rating", { count: "exact" })
        .eq("recipe_id", slug);
      
      if (data && data.length > 0) {
        const sum = data.reduce((acc, cur) => acc + cur.rating, 0);
        const avg = Math.round((sum / data.length) * 10) / 10;
        setRecipeRating({ average: avg, count: count || data.length });
      } else {
        setRecipeRating({ average: null, count: 0 });
      }
    };
    fetchRating();
  }, [slug]);

  const [servings, setServings] = useState(recipe?.servings || 1);
  const { toast } = useToast();
  const [loadingAlt, setLoadingAlt] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (recipe?.servings) {
        setServings(recipe.servings);
    }
  }, [recipe?.servings]);

  async function handleAskAlternative(ingredient: string) {
    setLoadingAlt(ingredient);
    try {
      const res = await fetch("/functions/ingredient-alternatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient }),
      });
      const data = await res.json();
      toast({
        title: data.alternative
          ? `"${ingredient}" Alternative`
          : "Keine Alternative",
        description: data.alternative || "Es wurde keine Alternative gefunden.",
        duration: 6000,
      });
    } catch (e) {
      toast({ title: "Fehler", description: "Alternative konnte nicht geladen werden" });
    }
    setLoadingAlt(null);
  }

  if (isLoading)
    return (
      <Layout title="Rezept">
        <div className="py-24 text-center text-sage-500">Lädt Rezeptdetails...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout title="Rezept">
        <div className="py-24 text-center text-destructive-600">
          Fehler beim Laden!
        </div>
      </Layout>
    );
  if (!recipe)
    return (
      <Layout title="Rezept">
        <div className="py-24 text-center text-sage-400">Rezept nicht gefunden.</div>
      </Layout>
    );

  const zutaten = parseJsonArray(recipe.ingredients);
  const schritte = parseJsonArray(recipe.instructions);
  let tipps: string[] = [];
  if ('tips' in recipe && (Array.isArray((recipe as any).tips) || typeof (recipe as any).tips === "string")) {
    tipps = parseJsonArray((recipe as any).tips);
  }

  return (
    <Layout title={recipe.title}>
      <RecipeStructuredData 
        recipe={recipe} 
        averageRating={recipeRating.average ?? undefined}
        ratingCount={recipeRating.count}
      />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/rezeptebuch"
          className="inline-flex items-center text-sage-600 hover:text-sage-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Rezeptbuch
        </Link>
        <Card className="p-0 overflow-hidden bg-white shadow rounded-2xl mb-8">
          <img
            src={imgError ? "/placeholder.svg" : getRecipeImageUrl(recipe.image_url)}
            alt={recipe.title}
            className="w-full h-64 object-cover"
            onError={() => setImgError(true)}
          />
          <div className="px-8 py-6">
            <h1 className="text-3xl font-serif font-bold text-earth-800 mb-3">
              {recipe.title}
            </h1>
            <p className="text-earth-600 mb-3">{recipe.description}</p>
            <div className="flex items-center gap-4">
              <RecipeRating recipeId={slug!} userId={userId} />
              <SaveRecipeButton recipeSlug={slug!} userId={userId} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200/70 border-t border-gray-200/70">
            { ((recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)) > 0 && (
            <div className="bg-white p-3 text-center">
                <p className="font-bold text-earth-700">{(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min</p>
                <p className="text-gray-500 text-sm">Gesamt</p>
            </div>
            )}
            { recipe.servings && (
            <div className="bg-white p-3 text-center">
                <p className="font-bold text-earth-700">{recipe.servings}</p>
                <p className="text-gray-500 text-sm">Portionen</p>
            </div>
            )}
            { recipe.difficulty && (
            <div className="bg-white p-3 text-center">
                <p className="font-bold text-earth-700 capitalize">{recipe.difficulty}</p>
                <p className="text-gray-500 text-sm">Niveau</p>
            </div>
            )}
            { recipe.season && (
            <div className="bg-white p-3 text-center">
                <p className="font-bold text-earth-700 capitalize">{recipe.season}</p>
                <p className="text-gray-500 text-sm">Saison</p>
            </div>
            )}
          </div>
        </Card>
        {/* Zutatenrechner */}
        {zutaten.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-2 flex items-center gap-2">
              <span>
                <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318A4.5 4.5 0 018.5 4.5h7A4.5 4.5 0 0120 8.5v7a4.5 4.5 0 01-4.5 4.5h-7A4.5 4.5 0 014 15.5v-7c0-1.123.409-2.142 1.106-2.929z"></path></svg>
              </span>
              Zutaten
              <div className="ml-auto flex items-center gap-2 bg-sage-50 rounded-full px-3">
                <span className="text-sm text-sage-700">Portionen:</span>
                <button
                  className="px-2 py-0.5 rounded-l bg-sage-100 hover:bg-sage-200 font-bold"
                  onClick={() => setServings(Math.max(servings - 1, 1))}
                >-</button>
                <span className="px-2">{servings}</span>
                <button
                  className="px-2 py-0.5 rounded-r bg-sage-100 hover:bg-sage-200 font-bold"
                  onClick={() => setServings(servings + 1)}
                >+</button>
              </div>
            </h2>
            <IngredientList
              ingredients={zutaten}
              servings={servings}
              baseServings={recipe.servings || 1}
              onAskAlternative={handleAskAlternative}
            />
            {loadingAlt && (
              <div className="text-xs text-sage-500">Alternative für "{loadingAlt}" wird gesucht ...</div>
            )}
          </div>
        )}
        {/* Zubereitung */}
        {schritte.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">
              Zubereitung
            </h2>
            <ol className="space-y-4">
              {schritte.map((step: any, i: number) => (
                <RecipeStep step={step} stepNumber={i + 1} key={i} />
              ))}
            </ol>
          </div>
        )}
        {/* Tipps */}
        {tipps.length > 0 && (
          <div className="mt-8 bg-accent-50 rounded-xl p-6">
            <h3 className="text-xl font-serif font-bold text-earth-800 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Tipps & Tricks
            </h3>
            <ul className="space-y-3">
              {tipps.map((tip: string, i: number) => (
                <li key={i} className="flex items-start">
                  <svg className="h-5 w-5 text-sage-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-earth-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <RecipeComments recipeId={slug!} userId={userId} />
      </section>
    </Layout>
  );
};

export default RecipeDetail;
