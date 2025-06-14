
import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ChefHat } from "lucide-react";

type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: string;
  category: string;
  season: string;
  tags: string[];
};

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
      return "bg-green-100 text-green-800";
    case "sommer":
      return "bg-yellow-100 text-yellow-800";
    case "herbst":
      return "bg-orange-100 text-orange-800";
    case "winter":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-sage-100 text-sage-800";
  }
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index = 0 }) => (
  <article
    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="relative">
      <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
      <div className="absolute top-4 left-4 flex gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeasonColor(recipe.season)}`}>
          {recipe.season}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
          {recipe.difficulty}
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="mb-2">
        <span className="text-sage-600 text-sm font-medium">{recipe.category}</span>
      </div>
      <h3 className="text-xl font-serif font-bold text-earth-800 mb-3 line-clamp-2">{recipe.title}</h3>
      <p className="text-earth-600 mb-4 line-clamp-2">{recipe.description}</p>
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-earth-500">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {recipe.totalTime}m
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {recipe.servings}
        </div>
        <div className="flex items-center">
          <ChefHat className="h-4 w-4 mr-1" />
          {recipe.difficulty}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-4">
        {recipe.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-sage-50 text-sage-700 px-2 py-1 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
      <Link
        to={`/rezepte/${recipe.slug}`}
        className="block w-full bg-sage-600 text-white text-center py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors"
      >
        Rezept anzeigen
      </Link>
    </div>
  </article>
);

export default RecipeCard;
