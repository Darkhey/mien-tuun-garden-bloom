
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { parseJsonArray, getRecipeImageUrl } from '@/utils/recipe';

type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  ingredients: any;
  source_blog_slug: string | null;
};

interface SavedRecipeCardProps {
  recipe: Recipe;
}

const SavedRecipeCard: React.FC<SavedRecipeCardProps> = ({ recipe }) => {
  const [imgError, setImgError] = React.useState(false);
  
  const ingredientsCount = parseJsonArray(recipe.ingredients).length;
  const ingredientsText = ingredientsCount > 1 
    ? `${ingredientsCount} Zutaten` 
    : ingredientsCount === 1 
    ? "1 Zutat" 
    : "Keine Zutaten";

  return (
    <Link
      to={`/rezepte/${recipe.slug}`}
      className="transition-transform transform hover:-translate-y-1"
    >
      <Card className="p-0 overflow-hidden rounded-2xl shadow group bg-white/90 hover:shadow-lg">
        <img
          src={imgError ? "/placeholder.svg" : getRecipeImageUrl(recipe.image_url)}
          alt={recipe.title}
          className="h-40 w-full object-cover group-hover:scale-105 duration-200"
          onError={() => setImgError(true)}
        />
        <div className="p-5">
          <h2 className="font-bold text-lg mb-2 font-serif text-earth-800">
            {recipe.title}
          </h2>
          <div className="text-sage-600 mb-2 line-clamp-2 text-sm">
            {recipe.description}
          </div>
          <div className="flex gap-2 text-xs text-sage-400 mt-2">
            <span>{ingredientsText}</span>
            {recipe.source_blog_slug && (
              <span className="ml-auto bg-accent-50 px-2 rounded-full">
                KI-generiert
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default SavedRecipeCard;
