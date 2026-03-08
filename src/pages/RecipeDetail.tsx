import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RecipeStructuredData from "@/components/recipe/RecipeStructuredData";
import RecipeComments from "@/components/recipe/RecipeComments";
import RecipeHeader from "@/components/recipe/RecipeHeader";
import RecipeIngredients from "@/components/recipe/RecipeIngredients";
import RecipeInstructions from "@/components/recipe/RecipeInstructions";
import RecipeTips from "@/components/recipe/RecipeTips";
import AdPlaceholder from "@/components/AdPlaceholder";
import NewsletterSignup from "@/components/NewsletterSignup";
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
  const { slug } = useParams();
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

  const [alternativeBubbles, setAlternativeBubbles] = useState<{
    [ingredient: string]: { alternative: string | null; explanation: string | null } | undefined;
  }>({});

  async function handleAskAlternative(ingredient: string) {
    setLoadingAlt(ingredient);
    try {
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
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Lädt Rezeptdetails...</p>
      </div>
    );
  if (error)
    return (
      <div className="py-24 text-center">
        <p className="text-destructive text-lg">Fehler beim Laden!</p>
        <Link to="/rezepte" className="text-primary mt-4 inline-block">← Zurück zur Übersicht</Link>
      </div>
    );
  if (!recipe)
    return (
      <div className="py-24 text-center">
        <p className="text-2xl mb-2">🥕</p>
        <p className="text-muted-foreground text-lg">Rezept nicht gefunden.</p>
        <Link to="/rezepte" className="text-primary mt-4 inline-block">← Zurück zur Übersicht</Link>
      </div>
    );

  const zutatenRaw = recipe.ingredients;
  const zutaten = parseRecipeArray(zutatenRaw).map(normalizeIngredient);

  const schritteRaw = recipe.instructions;
  const schritte = parseRecipeArray(schritteRaw).map(normalizeStep);

  let tipps: string[] = [];
  if ("tips" in recipe && (Array.isArray((recipe as any).tips) || typeof (recipe as any).tips === "string")) {
    tipps = normalizeTips((recipe as any).tips);
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <>
      <Helmet>
        <title>{recipe.title} – Rezept | Mien Tuun</title>
        <meta name="description" content={recipe.description || `${recipe.title} – ein saisonales Rezept von Marianne aus Ostfriesland.`} />
        <meta property="og:title" content={`${recipe.title} – Rezept | Mien Tuun`} />
        <meta property="og:description" content={recipe.description || recipe.title} />
        {recipe.image_url && <meta property="og:image" content={recipe.image_url} />}
      </Helmet>

      <RecipeStructuredData
        recipe={recipe}
        averageRating={recipeRating.average ?? undefined}
        ratingCount={recipeRating.count}
      />

      <section className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/rezepte"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Rezeptübersicht
        </Link>

        <RecipeHeader recipe={recipe} userId={userId} slug={slug!} />

        {/* Description */}
        {recipe.description && (
          <div className="mb-8 text-foreground/80 leading-relaxed bg-card rounded-xl p-5 border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="italic">{recipe.description}</p>
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

        {/* Ad between ingredients and instructions */}
        <div className="my-8">
          <AdPlaceholder text="🌿 Anzeige" className="max-w-lg mx-auto" />
        </div>

        <RecipeInstructions instructions={schritte} />

        <RecipeTips tips={tipps} />

        {/* Affiliate recommendation after recipe */}
        <div className="my-10 bg-secondary/30 rounded-2xl p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Empfehlung</p>
          <h3 className="text-lg font-serif font-bold text-foreground mb-2">
            Das brauchst du für dieses Rezept
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mariannes empfohlene Küchenhelfer und Zutaten-Quellen.
          </p>
          <AdPlaceholder text="Affiliate-Produktempfehlungen" className="max-w-lg mx-auto" />
        </div>

        {/* Newsletter CTA */}
        <div className="my-8 bg-card rounded-2xl p-6 border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <span className="text-lg">🍳</span> Mehr Rezepte direkt ins Postfach
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Jeden Monat neue saisonale Rezepte – kostenlos & jederzeit abbestellbar.
          </p>
          <NewsletterSignup />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <RecipeComments recipeId={slug!} userId={userId} />
      </section>
    </>
  );
};

export default RecipeDetail;
