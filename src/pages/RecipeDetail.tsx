import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RecipeStructuredData from "@/components/recipe/RecipeStructuredData";
import RecipeComments from "@/components/recipe/RecipeComments";
import RecipeHeader from "@/components/recipe/RecipeHeader";
import RecipeIngredients from "@/components/recipe/RecipeIngredients";
import RecipeInstructions from "@/components/recipe/RecipeInstructions";
import RecipeTips from "@/components/recipe/RecipeTips";
import {
  parseRecipeArray,
  normalizeStep,
  normalizeIngredient,
  normalizeTips,
} from "@/utils/recipeDataUtils";

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

  useEffect(() => {
    if (recipe?.servings) {
      setServings(recipe.servings);
    }
  }, [recipe?.servings]);

  // Alternativen KI-Bubbles
  const [alternativeBubbles, setAlternativeBubbles] = useState<{
    [ingredient: string]: { alternative: string | null; explanation: string | null } | undefined;
  }>({});

  async function handleAskAlternative(ingredient: string) {
    setLoadingAlt(ingredient);
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Nicht eingeloggt!");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingredient-alternatives`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ ingredient }),
      });

      if (!response.ok) {
        throw new Error(`Fehler bei der Anfrage: ${response.status}`);
      }

      const data = await response.json();
      setAlternativeBubbles((prev) => ({
        ...prev,
        [ingredient]: {
          alternative: data.alternative,
          explanation: data.explanation,
        },
      }));
    } catch (e) {
      toast({ title: "Fehler", description: "Alternative konnte nicht geladen werden" });
    }
    setLoadingAlt(null);
  }

  function handleCloseBubble(ingredient: string) {
    setAlternativeBubbles((prev) => {
      const nu = { ...prev };
      delete nu[ingredient];
      return nu;
    });
  }

  if (isLoading)
    return (
      <div className="py-24 text-center text-sage-500">Lädt Rezeptdetails...</div>
    );
  if (error)
    return (
      <div className="py-24 text-center text-destructive-600">
        Fehler beim Laden!
      </div>
    );
  if (!recipe)
    return (
      <div className="py-24 text-center text-sage-400">Rezept nicht gefunden.</div>
    );

  // Zutaten und Schritte inklusive Fallbacks parsen & normalisieren
  const zutatenRaw = recipe.ingredients;
  const zutaten = parseRecipeArray(zutatenRaw).map(normalizeIngredient);

  const schritteRaw = recipe.instructions;
  const schritte = parseRecipeArray(schritteRaw).map(normalizeStep);

  // Tipps & Tricks
  let tipps: string[] = [];
  if ("tips" in recipe && (Array.isArray((recipe as any).tips) || typeof (recipe as any).tips === "string")) {
    tipps = normalizeTips((recipe as any).tips);
  }

  return (
    <>
      <RecipeStructuredData
        recipe={recipe}
        averageRating={recipeRating.average ?? undefined}
        ratingCount={recipeRating.count}
      />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/rezepte"
          className="inline-flex items-center text-sage-600 hover:text-sage-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Rezeptübersicht
        </Link>

        <RecipeHeader recipe={recipe} userId={userId} slug={slug!} />

        {/* Description section */}
        {recipe.description && (
          <div className="mb-8 text-earth-700 leading-relaxed">
            <p>{recipe.description}</p>
          </div>
        )}

        <RecipeIngredients
          ingredients={zutaten}
          servings={servings}
          setServings={setServings}
          baseServings={recipe.servings || 1}
          onAskAlternative={handleAskAlternative}
          alternativeBubbles={alternativeBubbles}
          onCloseBubble={handleCloseBubble}
          loadingAlt={loadingAlt}
        />

        <RecipeInstructions instructions={schritte} />

        <RecipeTips tips={tipps} />
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <RecipeComments recipeId={slug!} userId={userId} />
      </section>
    </>
  );
};

export default RecipeDetail;