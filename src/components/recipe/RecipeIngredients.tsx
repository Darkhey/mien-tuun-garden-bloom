
import React from "react";
import IngredientList from "@/components/IngredientList";

interface RecipeIngredientsProps {
  ingredients: any[];
  servings: number;
  setServings: (servings: number) => void;
  baseServings: number;
  onAskAlternative: (ingredient: string) => void;
  alternativeBubbles: {
    [ingredient: string]: { alternative: string | null; explanation: string | null } | undefined;
  };
  onCloseBubble: (ingredient: string) => void;
  loadingAlt: string | null;
}

const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({
  ingredients,
  servings,
  setServings,
  baseServings,
  onAskAlternative,
  alternativeBubbles,
  onCloseBubble,
  loadingAlt,
}) => {
  if (ingredients.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-earth-800 mb-2 flex items-center gap-2">
        <span>
          <svg
            className="w-6 h-6 text-sage-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318A4.5 4.5 0 018.5 4.5h7A4.5 4.5 0 0120 8.5v7a4.5 4.5 0 01-4.5 4.5h-7A4.5 4.5 0 014 15.5v-7c0-1.123.409-2.142 1.106-2.929z"
            ></path>
          </svg>
        </span>
        Zutaten
        <div className="ml-auto flex items-center gap-2 bg-sage-50 rounded-full px-3">
          <span className="text-sm text-sage-700">Portionen:</span>
          <button
            className="px-2 py-0.5 rounded-l bg-sage-100 hover:bg-sage-200 font-bold"
            onClick={() => setServings(Math.max(servings - 1, 1))}
          >
            -
          </button>
          <span className="px-2">{servings}</span>
          <button
            className="px-2 py-0.5 rounded-r bg-sage-100 hover:bg-sage-200 font-bold"
            onClick={() => setServings(servings + 1)}
          >
            +
          </button>
        </div>
      </h2>
      <IngredientList
        ingredients={ingredients}
        servings={servings}
        baseServings={baseServings}
        onAskAlternative={onAskAlternative}
        alternativeBubbles={alternativeBubbles}
        onCloseBubble={onCloseBubble}
        loadingAlt={loadingAlt}
      />
      {loadingAlt && (
        <div className="text-xs text-sage-500">
          Alternative für "{loadingAlt}" wird gesucht ...
        </div>
      )}
    </div>
  );
};

export default RecipeIngredients;
