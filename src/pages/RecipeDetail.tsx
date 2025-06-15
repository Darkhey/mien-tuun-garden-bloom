
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
import { getRecipeImageUrl } from "@/utils/recipe";

// Hilfsfunktion: Parsing und Normalisierung von Arrays (Zutaten, Schritte etc.)
function parseRecipeArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return arr;
    } catch (e) { }
  }
  return [];
}

// Normalisiert ein RecipeStep-Objekt (auch Fallback für reine Strings)
function normalizeStep(step: any, idx: number): {
  id?: string;
  step: number;
  text: string;
  description?: string;
  image?: string;
  time?: number;
} {
  if (typeof step === "string") {
    return { step: idx + 1, text: step };
  }
  // Wenn image fehlt, prüfe auf evtl. image_url oder ähnliches
  let image = step.image || step.image_url || "";
  return {
    id: step.id || undefined,
    step: step.step || idx + 1,
    text: step.text || step.description || "",
    description: step.description,
    image: image && typeof image === "string" ? image : undefined,
    time: step.time ? Number(step.time) : undefined,
  };
}

// Zutaten normalisieren (Strings und Objekte unterstützen)
function normalizeIngredient(ing: any): any {
  if (typeof ing === "string") {
    return { name: ing };
  }
  return {
    ...ing,
    name: ing.name || "",
    amount:
      typeof ing.amount === "string"
        ? parseFloat(ing.amount.replace(",", "."))
        : ing.amount,
    unit: ing.unit || "",
    notes: ing.notes || "",
    group: ing.group || "",
    optional: !!ing.optional,
  };
}

// Tipps/Tricks als String-Array normalisieren
function normalizeTips(val: any): string[] {
  if (Array.isArray(val)) {
    return val.map((tip) =>
      typeof tip === "string" ? tip : (tip.text || JSON.stringify(tip))
    );
  } else if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr)
        ? arr.map((tip) =>
            typeof tip === "string" ? tip : (tip.text || JSON.stringify(tip))
          )
        : [];
    } catch {
      return [val];
    }
  }
  return [];
}

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

  // Alternativen KI-Bubbles
  const [alternativeBubbles, setAlternativeBubbles] = useState<{
    [ingredient: string]: { alternative: string | null; explanation: string | null } | undefined;
  }>({});

  async function handleAskAlternative(ingredient: string) {
    setLoadingAlt(ingredient);
    try {
      const res = await fetch("/functions/ingredient-alternatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient }),
      });
      const data = await res.json();
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

  // Bild-Fallback: Zeige recipe.image_url, dann ggf. recipe.image
  let recipeImage =
    !imgError && (recipe.image_url || recipe.image)
      ? getRecipeImageUrl(recipe.image_url || recipe.image)
      : "/placeholder.svg";

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
            src={recipeImage}
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
            {((recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)) > 0 && (
              <div className="bg-white p-3 text-center">
                <p className="font-bold text-earth-700">
                  {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                </p>
                <p className="text-gray-500 text-sm">Gesamt</p>
              </div>
            )}
            {recipe.servings && (
              <div className="bg-white p-3 text-center">
                <p className="font-bold text-earth-700">{recipe.servings}</p>
                <p className="text-gray-500 text-sm">Portionen</p>
              </div>
            )}
            {recipe.difficulty && (
              <div className="bg-white p-3 text-center">
                <p className="font-bold text-earth-700 capitalize">{recipe.difficulty}</p>
                <p className="text-gray-500 text-sm">Niveau</p>
              </div>
            )}
            {recipe.season && (
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
                <svg
                  className="w-6 h-6 text-sage-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318A4.5 4.5 0 018.5 4.5h7A4.5 4.5 0 0120 8.5v7a4.5 4.5 0 01-4.5 4.5h-7A4.5 4.5 0 014 15.5v-7c0-1.123.409-2.142 1.106-2.929z"
                  ></path>
                </svg>
              </span>
              Zutaten
              <div className="ml-auto flex items-center gap-2 bg-sage-50 rounded-full px-3">
                <span className="text-sm text-sage-700">Portionen:</span>
                <button
                  className="px-2 py-0.5 rounded-l bg-sage-100 hover:bg-sage-200 font-bold"
                  onClick={() => setServings(Math.max(servings - 1, 1))}
                >
                  -
                </button>
                <span className="px-2">{servings}</span>
                <button
                  className="px-2 py-0.5 rounded-r bg-sage-100 hover:bg-sage-200 font-bold"
                  onClick={() => setServings(servings + 1)}
                >
                  +
                </button>
              </div>
            </h2>
            <IngredientList
              ingredients={zutaten}
              servings={servings}
              baseServings={recipe.servings || 1}
              onAskAlternative={handleAskAlternative}
              alternativeBubbles={alternativeBubbles}
              onCloseBubble={handleCloseBubble}
              loadingAlt={loadingAlt}
            />
            {loadingAlt && (
              <div className="text-xs text-sage-500">
                Alternative für "{loadingAlt}" wird gesucht ...
              </div>
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
                  <svg
                    className="h-5 w-5 text-sage-600 mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
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
