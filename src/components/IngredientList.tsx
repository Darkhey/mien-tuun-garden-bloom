
import React, { useState } from "react";

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
  alternativeBubbles?: {
    [ingredient: string]: { alternative: string | null, explanation: string | null } | undefined;
  };
  onCloseBubble?: (ingredient: string) => void;
  loadingAlt?: string | null;
};

const IngredientList: React.FC<Props> = ({
  ingredients,
  servings = 1,
  baseServings = 1,
  onAskAlternative,
  alternativeBubbles = {},
  onCloseBubble,
  loadingAlt,
}) => {
  if (!ingredients.length) return null;
  const factor = Math.max(servings / (baseServings || 1), 0.01);

  return (
    <ul className="space-y-3 mb-6 w-full">
      {ingredients.map((ing, i) => (
        <li key={i} className="flex items-center gap-3 group relative">
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
            title={loadingAlt === ing.name ? "Alternative wird gesucht..." : "Alternative anzeigen"}
            onClick={() => onAskAlternative?.(ing.name)}
            disabled={!!loadingAlt}
          >
            {loadingAlt === ing.name ? "..." : "Alternative?"}
          </button>
          {ing.notes && (
            <span className="ml-2 italic text-xs text-sage-500">
              {ing.notes}
            </span>
          )}
          {alternativeBubbles[ing.name] && (
            <div className="absolute left-1/2 z-50 -translate-x-1/2 top-10 w-80 max-w-xs bg-white border border-accent-200 rounded-xl shadow-xl p-4 text-sm animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center mb-2">
                <span className="mr-2 inline-block rounded-full bg-accent-50 px-2 py-0.5 text-accent-700 text-xs font-semibold">
                  {alternativeBubbles[ing.name]?.alternative
                    ? alternativeBubbles[ing.name]?.alternative
                    : "Keine Alternative"}
                </span>
                <button
                  className="ml-auto text-xs text-sage-500 hover:text-sage-900"
                  onClick={() => onCloseBubble?.(ing.name)}
                  aria-label="Schließen"
                >
                  ×
                </button>
              </div>
              <div className="text-earth-700 leading-snug">
                {alternativeBubbles[ing.name]?.explanation}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default IngredientList;
