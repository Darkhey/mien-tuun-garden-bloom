
import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ChefHat } from "lucide-react";
import type { Recipe } from "@/types/content";

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "einfach":
      return "bg-green-100 text-green-800";
    case "mittel":
      return "bg-yellow-100 text-yellow-800";
    case "schwer":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getSeasonColor(season: string) {
  switch (season) {
    case "frühling":
      return "border-green-200 bg-green-50 text-green-800";
    case "sommer":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "herbst":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "winter":
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "border-sage-200 bg-sage-50 text-sage-800";
  }
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index = 0 }) => (
  <article
    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col animate-fade-in"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="relative">
      <Link to={`/rezepte/${recipe.slug}`} className="block">
        <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
      </Link>
      <div className="absolute top-3 left-3 flex gap-2">
        {recipe.season && (
          <span className={`px-3 py-1 border rounded-full text-xs font-semibold shadow-sm ${getSeasonColor(recipe.season)} capitalize`}>
            {recipe.season}
          </span>
        )}
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      {recipe.category && (
        <p className="text-sage-600 text-sm font-medium mb-1">{recipe.category}</p>
      )}
      <h3 className="text-xl font-serif font-bold text-earth-800 mb-2 h-14 line-clamp-2">
        <Link to={`/rezepte/${recipe.slug}`} className="hover:text-sage-700 transition-colors">
          {recipe.title}
        </Link>
      </h3>
      <p className="text-earth-600 mb-4 text-sm line-clamp-3 flex-grow">{recipe.description}</p>
      
      <div className="grid grid-cols-3 gap-2 my-2 text-sm text-earth-600 border-t border-b border-gray-100 py-3">
        <div className="flex flex-col items-center text-center">
          <Clock className="h-5 w-5 mb-1 text-sage-500" />
          <span className="font-semibold">{recipe.totalTime > 0 ? `${recipe.totalTime} min` : 'N/A'}</span>
          <span className="text-xs text-gray-500">Gesamt</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Users className="h-5 w-5 mb-1 text-sage-500" />
          <span className="font-semibold">{recipe.servings > 0 ? `${recipe.servings}` : 'N/A'}</span>
           <span className="text-xs text-gray-500">Portionen</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <ChefHat className="h-5 w-5 mb-1 text-sage-500" />
          <span className="font-semibold capitalize">{recipe.difficulty}</span>
          <span className="text-xs text-gray-500">Niveau</span>
        </div>
      </div>
      
      <div className="mt-auto pt-2">
        <Link
          to={`/rezepte/${recipe.slug}`}
          className="block w-full bg-sage-600 text-white text-center py-2.5 rounded-lg font-semibold hover:bg-sage-700 transition-colors duration-200"
        >
          Zum Rezept
        </Link>
      </div>
    </div>
  </article>
);

export default RecipeCard;
