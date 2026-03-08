import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ChefHat } from "lucide-react";
import { type Tables } from "@/integrations/supabase/types";

interface RecipeCardProps {
  recipe: Tables<'recipes'>;
  index?: number;
}

function getDifficultyColor(difficulty: string | null) {
  switch (difficulty) {
    case "einfach":
      return "bg-primary/10 text-primary";
    case "mittel":
      return "bg-accent/10 text-accent-foreground";
    case "schwer":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getSeasonEmoji(season: string | null) {
  switch (season) {
    case "frühling": return "🌱";
    case "sommer": return "☀️";
    case "herbst": return "🍂";
    case "winter": return "❄️";
    default: return "🌿";
  }
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index = 0 }) => {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <article
      className="garden-card overflow-hidden flex flex-col animate-fade-in"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="relative">
        <Link to={`/rezept/${recipe.slug}`} className="block overflow-hidden">
          <img
            src={recipe.image_url || '/placeholder.svg'}
            alt={recipe.title}
            className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-3 left-3 flex gap-2">
          {recipe.season && (
            <span className="garden-badge text-xs">
              {getSeasonEmoji(recipe.season)} {recipe.season}
            </span>
          )}
          {recipe.difficulty && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)} capitalize`}>
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        {recipe.category && (
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{recipe.category}</p>
        )}
        <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-2 leading-snug">
          <Link to={`/rezept/${recipe.slug}`} className="hover:text-primary transition-colors">
            {recipe.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mb-4 text-sm line-clamp-3 flex-grow leading-relaxed">{recipe.description}</p>
        
        <div className="grid grid-cols-3 gap-2 text-sm border-t border-border py-3">
          <div className="flex flex-col items-center text-center">
            <Clock className="h-4 w-4 mb-1 text-primary/60" />
            <span className="font-semibold text-foreground text-xs">{totalTime > 0 ? `${totalTime} min` : '–'}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="h-4 w-4 mb-1 text-primary/60" />
            <span className="font-semibold text-foreground text-xs">{recipe.servings && recipe.servings > 0 ? `${recipe.servings} Port.` : '–'}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <ChefHat className="h-4 w-4 mb-1 text-primary/60" />
            <span className="font-semibold text-foreground text-xs capitalize">{recipe.difficulty || '–'}</span>
          </div>
        </div>
        
        <div className="mt-3">
          <Link
            to={`/rezept/${recipe.slug}`}
            className="block w-full bg-primary text-primary-foreground text-center py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            Zum Rezept
          </Link>
        </div>
      </div>
    </article>
  );
}

export default RecipeCard;
