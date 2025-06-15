import React, { useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/utils/slugify";
import { Link } from "react-router-dom";
import BlogRecipeCreateButton from "./BlogRecipeCreateButton";
import BlogRecipeSuccessMessage from "./BlogRecipeSuccessMessage";

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

/**
 * Helper: Check if the blog post content contains recipe-related keywords
 */
function isRecipeRelated(post: { title: string; content: string; category: string }): boolean {
  const recipeKeywords = [
    'zutaten', 'zutat', 'ingredients', 'ingredient',
    'rezept', 'recipe', 'kochen', 'backen', 'cooking', 'baking',
    'schritt', 'anleitung', 'instructions', 'step',
    'ml', 'gr', 'gramm', 'liter', 'tl', 'el', 'teelöffel', 'esslöffel',
    'ofen', 'pfanne', 'topf', 'mixer', 'rühren', 'mischen',
    'servieren', 'portion', 'servings'
  ];
  
  const recipeCategories = [
    'rezept', 'rezepte', 'kochen', 'backen', 'küche', 'ernährung'
  ];

  const textToCheck = `${post.title} ${post.content} ${post.category}`.toLowerCase();
  
  // Check if category is recipe-related
  if (recipeCategories.some(cat => post.category.toLowerCase().includes(cat))) {
    return true;
  }
  
  // Check if content contains multiple recipe keywords
  const keywordMatches = recipeKeywords.filter(keyword => 
    textToCheck.includes(keyword.toLowerCase())
  ).length;
  
  // Require at least 3 recipe-related keywords to consider it a recipe
  return keywordMatches >= 3;
}

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
  const { toast } = useToast();

  // Handler ausgelagert wie gehabt
  const handleCreateRecipe = async () => {
    setSaving(true);
    setSavedRecipeSlug(null);
    try {
      // Extrahiere Rezept per KI
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

      // Slug generieren
      const recipeSlug =
        (recipe && typeof recipe.slug === "string" && recipe.slug.length > 0)
          ? recipe.slug
          : slugify(recipe?.title || post.title);

      // User holen (für user_id)
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Nicht eingeloggt!");

      // Rezept in DB speichern
      const insertObj = {
        user_id: user.data.user.id,
        title: recipe.title,
        slug: recipeSlug,
        image_url: recipe.image || post.featuredImage,
        description: recipe.description || "",
        ingredients: recipe.ingredients ?? null,
        instructions: recipe.instructions ?? null,
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
          disabled={saving}
          loading={saving}
          onClick={handleCreateRecipe}
        />
      </div>
      {savedRecipeSlug && <BlogRecipeSuccessMessage slug={savedRecipeSlug} />}
    </div>
  );
};

export default BlogPostToRecipeSection;
