import React from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/utils/slugify";
import BlogRecipeCreateButton from "./BlogRecipeCreateButton";
import BlogRecipeSuccessMessage from "./BlogRecipeSuccessMessage";

type BlogPostToRecipeSectionProps = {
  post: {
    title: string;
    content: string;
    featuredImage: string;
    slug: string;
    category: string;
  };
};

const BlogPostToRecipeSection: React.FC<BlogPostToRecipeSectionProps> = ({ post }) => {
  const [saving, setSaving] = React.useState(false);
  const [savedRecipeSlug, setSavedRecipeSlug] = React.useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const { toast } = useToast();

  // Session abfragen
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session?.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleCreateRecipe = async () => {
    setSaving(true);
    setSavedRecipeSlug(null);
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
      if (!recipe) throw new Error("Keine Rezept-Antwort erhalten.");

      const recipeSlug =
        (recipe && typeof recipe.slug === "string" && recipe.slug.length > 0)
          ? recipe.slug
          : slugify(recipe?.title || post.title);

      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");

      let instructions = recipe.instructions ?? null;
      if (instructions && Array.isArray(instructions)) {
        instructions = instructions.map((s: any, i: number) =>
          typeof s === "string"
            ? { step: i + 1, text: s }
            : typeof s === "object" && s !== null
              ? { step: i + 1, ...(s.text ? { text: s.text } : {}), ...(s.description ? { description: s.description } : {}), ...(s.image ? { image: s.image } : {}), ...(s.time ? { time: s.time } : {}) }
              : { step: i + 1, text: String(s) }
        );
      }

      // --- Bild generieren via Edge Function (OpenAI Dall-E) ---
      let recipeImageUrl = recipe.image || post.featuredImage;
      try {
        // Nur generieren, wenn noch kein Bild vorhanden oder das Bild das original Blogbild ist
        if (!recipe.image || recipe.image === post.featuredImage) {
          const imgResp = await fetch(
            "https://ublbxvpmoccmegtwaslh.functions.supabase.co/generate-recipe-image",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: recipe.title,
                description: recipe.description,
                ingredients: recipe.ingredients,
                category: post.category,
              }),
            }
          );
          if (imgResp.ok) {
            const imgData = await imgResp.json();
            if (imgData && imgData.imageUrl) {
              recipeImageUrl = imgData.imageUrl;
            }
          }
        }
      } catch (imgErr) {
        // Bildgenerierung darf fehlschlagen, kein Abbruch
        console.warn("Konnte kein KI-Bild generieren:", imgErr);
      }

      const insertObj = {
        user_id: user.data.user.id,
        title: recipe.title,
        slug: recipeSlug,
        image_url: recipeImageUrl,
        description: recipe.description || "",
        ingredients: recipe.ingredients ?? null,
        instructions: instructions,
        source_blog_slug: post.slug,
        status: 'veröffentlicht',
      };
      const { error } = await supabase.from("recipes").insert([insertObj]);
      if (error) throw error;

      setSavedRecipeSlug(recipeSlug);

      toast({
        title: "Rezept erstellt!",
        description: "Das Rezept wurde erfolgreich in dein Rezeptbuch übernommen.",
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
        <BlogRecipeCreateButton
          disabled={!isLoggedIn || saving}
          loading={saving}
          onClick={handleCreateRecipe}
        />
      </div>
      {!isLoggedIn && (
        <div className="text-xs text-sage-700 mt-1 pl-1">Bitte einloggen, um ein Rezept zu erstellen.</div>
      )}
      {savedRecipeSlug && <BlogRecipeSuccessMessage slug={savedRecipeSlug} />}
    </div>
  );
};

export default BlogPostToRecipeSection;
