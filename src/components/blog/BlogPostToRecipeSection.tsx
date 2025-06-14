
import React, { useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/utils/slugify";

/**
 * Helper: robustly extract array from maybe-string/array
 */
function parseArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  return [];
}

type BlogPostToRecipeSectionProps = {
  post: {
    title: string;
    content: string;
    featuredImage: string;
    slug: string;
  };
};

const BlogPostToRecipeSection: React.FC<BlogPostToRecipeSectionProps> = ({ post }) => {
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const { toast } = useToast();

  // KI Vorschau holen
  const handlePreviewRecipe = async () => {
    setSaving(true);
    setPreview(null);
    try {
      const resp = await fetch(
        `https://ublbxvpmoccmegtwaslh.functions.supabase.co/blog-to-recipe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: post.title,
            content: post.content,
            image: post.featuredImage,
          }),
        }
      );
      if (!resp.ok) throw new Error("Fehler bei der KI-Antwort");
      const { recipe } = await resp.json();
      setPreview(recipe);
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: String(err.message || err),
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  // Speichern (in DB übernehmen)
  const handleSaveRecipe = async () => {
    setSaving(true);
    try {
      // Hole KI-Extrakt
      let recipe = preview;
      if (!recipe) {
        const resp = await fetch(
          `https://ublbxvpmoccmegtwaslh.functions.supabase.co/blog-to-recipe`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: post.title,
              content: post.content,
              image: post.featuredImage,
            }),
          }
        );
        if (!resp.ok) throw new Error("Fehler bei der KI-Antwort");
        const data = await resp.json();
        recipe = data.recipe;
      }

      // Slug generieren: bevorzugt KI-Antwort, sonst aus Titel generieren
      const recipeSlug =
        (recipe && typeof recipe.slug === "string" && recipe.slug.length > 0)
          ? recipe.slug
          : slugify(recipe?.title || post.title);

      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");

      // Insert
      const insertObj = {
        user_id: user.data.user.id,
        title: recipe.title,
        slug: recipeSlug,
        image_url: recipe.image || post.featuredImage,
        description: recipe.description || "",
        ingredients: recipe.ingredients ?? null,
        instructions: recipe.instructions ?? null,
        source_blog_slug: post.slug,
      };

      const { error } = await supabase.from("recipes").insert([insertObj]);
      if (error) throw error;

      toast({
        title: "Rezept gespeichert!",
        description: "Das Rezept wurde in dein Rezeptbuch übernommen.",
      });
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: String(err.message || err),
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 flex gap-4 flex-col">
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={handlePreviewRecipe}
          disabled={saving}
          className="bg-sage-500 text-white px-6 py-2 rounded-full hover:bg-sage-600 transition-colors flex items-center gap-2"
        >
          {saving && <Loader className="animate-spin h-4 w-4" />}
          Vorschau KI-Rezept
        </button>
        <button
          onClick={handleSaveRecipe}
          disabled={saving}
          className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors flex items-center gap-2"
        >
          {saving && <Loader className="animate-spin h-4 w-4" />}
          Als Rezept speichern
        </button>
      </div>

      {/* Vorschau (alles dynamisch) */}
      {preview && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="font-serif text-2xl font-bold text-earth-800 mb-4 flex gap-2 items-center">
            <span>🎉</span> Vorschau auf das extrahierte Rezept
          </h3>
          <div className="mb-2">
            <div className="text-sage-800 text-lg font-bold">{preview.title}</div>
            {preview.image && (
              <img src={preview.image} className="my-3 w-full max-h-64 object-cover rounded-md" />
            )}
            <div className="mb-2 text-sage-700">{preview.description}</div>
          </div>
          {/* Zutaten */}
          {preview.ingredients && parseArray(preview.ingredients).length > 0 && (
            <div className="mb-3">
              <div className="font-semibold">Zutaten:</div>
              <ul className="pl-4 list-disc">
                {parseArray(preview.ingredients).map((ing: any, idx: number) =>
                  <li key={idx}>
                    {typeof ing === "string"
                      ? ing
                      : ing.name + (ing.amount ? ` (${ing.amount} ${ing.unit || ""})` : "")}
                  </li>
                )}
              </ul>
            </div>
          )}
          {/* Schritte */}
          {preview.instructions && parseArray(preview.instructions).length > 0 && (
            <div className="mb-3">
              <div className="font-semibold">Schritte:</div>
              <ol className="list-decimal pl-6">
                {parseArray(preview.instructions).map((step: any, idx: number) =>
                  <li key={idx}>{typeof step === "string" ? step : (step.text || JSON.stringify(step))}</li>
                )}
              </ol>
            </div>
          )}
          {/* Tipps */}
          {preview.tips && parseArray(preview.tips).length > 0 && (
            <div>
              <div className="font-semibold">Tipps:</div>
              <ul className="pl-4 list-disc">
                {parseArray(preview.tips).map((tip: any, idx: number) =>
                  <li key={idx}>{typeof tip === "string" ? tip : JSON.stringify(tip)}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPostToRecipeSection;
