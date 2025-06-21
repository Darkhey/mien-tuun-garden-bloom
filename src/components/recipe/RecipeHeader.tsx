
import React from "react";
import { Card } from "@/components/ui/card";
import { getRecipeImageUrl } from "@/utils/recipe";
import RecipeRating from "./RecipeRating";
import SaveRecipeButton from "./SaveRecipeButton";

interface RecipeHeaderProps {
  recipe: any;
  userId: string | null;
  slug: string;
}

// Universal garden fallback image
const GARDEN_FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";

const RecipeHeader: React.FC<RecipeHeaderProps> = ({ recipe, userId, slug }) => {
  const [imgError, setImgError] = React.useState(false);

  // Bild-Fallback: Zeige recipe.image_url, dann ggf. recipe.image
  const recipeImage =
    !imgError && recipe.image_url
      ? getRecipeImageUrl(recipe.image_url)
      : GARDEN_FALLBACK_IMAGE;

  return (
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
        <div className="flex items-center gap-4">
          <RecipeRating recipeId={slug} userId={userId} />
          <SaveRecipeButton recipeSlug={slug} userId={userId} />
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
  );
};

export default RecipeHeader;
