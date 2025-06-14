
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Timer } from "lucide-react";

type Ingredient = {
  id?: string;
  amount?: number;
  unit?: string;
  name: string;
  notes?: string;
  group?: string;
};

type Props = {
  ingredients: Ingredient[];
  servings?: number;
  baseServings?: number;
  onAskAlternative?: (ingredient: string) => void;
};

const IngredientList: React.FC<Props> = ({
  ingredients,
  servings = 1,
  baseServings = 1,
  onAskAlternative,
}) => {
  if (!ingredients.length) return null;
  const factor = Math.max(servings / (baseServings || 1), 0.01);

  return (
    <ul className="space-y-3 mb-6 w-full">
      {ingredients.map((ing, i) => (
        <li key={i} className="flex items-center gap-3 group">
          <span className="bg-sage-100 rounded-full w-12 h-8 flex justify-center items-center font-semibold text-sage-800 text-sm">
            {ing.amount !== undefined && !isNaN(ing.amount)
              ? `${(ing.amount * factor).toLocaleString("de-DE", {
                  maximumFractionDigits: 1,
                })} ${ing.unit || ""}`.trim()
              : ""}
          </span>
          <span className="text-earth-700 flex-1">{ing.name}</span>
          <button
            className="ml-2 px-2 py-1 text-xs rounded bg-accent-50 text-accent-700 border border-accent-100 hover:bg-accent-100 transition-colors hidden group-hover:block"
            type="button"
            title="Alternative anzeigen"
            onClick={() => onAskAlternative?.(ing.name)}
          >
            Alternative?
          </button>
          {ing.notes && (
            <span className="ml-2 italic text-xs text-sage-500">
              {ing.notes}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default IngredientList;
