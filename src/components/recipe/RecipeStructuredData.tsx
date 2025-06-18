import React from 'react';

const SUPABASE_STORAGE_URL = "https://ublbxvpmoccmegtwaslh.supabase.co/storage/v1/object/public/recipe-images/";

// Helper to parse potentially stringified JSON
function parseArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  return [];
}

type Recipe = {
  title: string;
  description: string | null;
  image_url: string | null;
  ingredients: any;
  instructions: any;
  created_at: string;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  category?: string | null;
  season?: string | null;
  tags?: string[] | null;
  author?: string | null;
  story?: string | null;
};

type RecipeStructuredDataProps = {
  recipe: Recipe;
  averageRating?: number;
  ratingCount?: number;
};

const RecipeStructuredData: React.FC<RecipeStructuredDataProps> = ({
  recipe,
  averageRating,
  ratingCount,
}) => {
  const ingredients = parseArray(recipe.ingredients).map(ing => (typeof ing === 'object' && ing.original) ? ing.original : ing.toString());
  const instructions = parseArray(recipe.instructions).map(inst => ({ "@type": "HowToStep", "text": (typeof inst === 'object' && inst.text) ? inst.text : inst.toString() }));

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    datePublished: recipe.created_at,
    description: recipe.description || recipe.story || "",
    image: recipe.image_url ? [SUPABASE_STORAGE_URL + recipe.image_url] : undefined,
    recipeIngredient: ingredients.length > 0 ? ingredients : undefined,
    recipeInstructions: instructions.length > 0 ? instructions : undefined,
    author: {
        "@type": "Person",
        name: recipe.author || "Mien Tuun" // Fallback author
    },
    recipeCategory: recipe.category || undefined,
    recipeCuisine: "German",
    keywords: recipe.tags?.join(", ") || undefined,
    recipeYield: recipe.servings?.toString() || undefined,
    prepTime: recipe.prep_time_minutes ? `PT${recipe.prep_time_minutes}M` : undefined,
    cookTime: recipe.cook_time_minutes ? `PT${recipe.cook_time_minutes}M` : undefined,
    totalTime: (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0) > 0 
      ? `PT${(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)}M` 
      : undefined
  };

  if (averageRating && ratingCount && ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: ratingCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export default RecipeStructuredData;