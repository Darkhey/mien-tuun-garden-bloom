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

const GARDEN_FALLBACK_IMAGE = "/lovable-uploads/2a3ad273-430b-4675-b1c4-33dbaac0b6cf.png";

const RecipeHeader: React.FC<RecipeHeaderProps> = ({ recipe, userId, slug }) => {
  const [imgError, setImgError] = React.useState(false);

  const recipeImage =
    !imgError && recipe.image_url
      ? getRecipeImageUrl(recipe.image_url)
      : GARDEN_FALLBACK_IMAGE;

  return (
    <Card className="p-0 overflow-hidden bg-card border-border shadow-sm rounded-2xl mb-8">
      <img
        src={recipeImage}
        alt={recipe.title}
        className="w-full h-64 object-cover"
        onError={() => setImgError(true)}
      />
      <div className="px-6 sm:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">
          {recipe.title}
        </h1>
        <div className="flex items-center gap-4">
          <RecipeRating recipeId={slug} userId={userId} />
          <SaveRecipeButton recipeSlug={slug} userId={userId} />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-t border-border">
        {((recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)) > 0 && (
          <div className="bg-card p-3 text-center">
            <p className="font-bold text-foreground">
              {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
            </p>
            <p className="text-muted-foreground text-sm">Gesamt</p>
          </div>
        )}
        {recipe.servings && (
          <div className="bg-card p-3 text-center">
            <p className="font-bold text-foreground">{recipe.servings}</p>
            <p className="text-muted-foreground text-sm">Portionen</p>
          </div>
        )}
        {recipe.difficulty && (
          <div className="bg-card p-3 text-center">
            <p className="font-bold text-foreground capitalize">{recipe.difficulty}</p>
            <p className="text-muted-foreground text-sm">Niveau</p>
          </div>
        )}
        {recipe.season && (
          <div className="bg-card p-3 text-center">
            <p className="font-bold text-foreground capitalize">{recipe.season}</p>
            <p className="text-muted-foreground text-sm">Saison</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecipeHeader;
