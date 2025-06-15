
import React from "react";
import RecipeStep from "@/components/RecipeStep";

interface RecipeInstructionsProps {
  instructions: any[];
}

const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({ instructions }) => {
  if (instructions.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">
        Zubereitung
      </h2>
      <ol className="space-y-4">
        {instructions.map((step: any, i: number) => (
          <RecipeStep step={step} stepNumber={i + 1} key={i} />
        ))}
      </ol>
    </div>
  );
};

export default RecipeInstructions;
