
import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, ChefHat, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchRecipe = async (id: string) => {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
};

const RecipeDetail = () => {
  const { id } = useParams();
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ["recipe-detail", id],
    queryFn: () => fetchRecipe(id!),
    enabled: !!id,
  });

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

  return (
    <Layout title={recipe.title}>
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
            src={recipe.image_url || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
          <div className="px-8 py-6">
            <h1 className="text-3xl font-serif font-bold text-earth-800 mb-3">
              {recipe.title}
            </h1>
            <p className="text-earth-600 mb-3">{recipe.description}</p>
          </div>
        </Card>

        {/* Zutaten */}
        {recipe.ingredients && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4 flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-sage-600" /> Zutaten
            </h2>
            <ul className="space-y-3 mb-6">
              {recipe.ingredients.map((ing: any, i: number) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="bg-sage-100 rounded-full w-8 h-8 flex justify-center items-center font-semibold text-sage-800">
                    {ing.amount ? `${ing.amount} ${ing.unit || ""}` : ""}
                  </span>
                  <span className="text-earth-700">{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Zubereitung */}
        {recipe.instructions && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">
              Zubereitung
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-8 h-8 bg-sage-600 text-white rounded-full flex items-center justify-center font-bold text-base mt-1">
                    {i + 1}
                  </span>
                  <p className="text-earth-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tipps */}
        {recipe.tips && recipe.tips.length > 0 && (
          <div className="mt-8 bg-accent-50 rounded-xl p-6">
            <h3 className="text-xl font-serif font-bold text-earth-800 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Tipps & Tricks
            </h3>
            <ul className="space-y-3">
              {recipe.tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start">
                  <Check className="h-5 w-5 text-sage-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-earth-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default RecipeDetail;
