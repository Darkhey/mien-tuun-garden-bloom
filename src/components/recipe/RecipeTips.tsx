
import React from "react";

interface RecipeTipsProps {
  tips: string[];
}

const RecipeTips: React.FC<RecipeTipsProps> = ({ tips }) => {
  if (tips.length === 0) return null;

  return (
    <div className="mt-8 bg-accent-50 rounded-xl p-6">
      <h3 className="text-xl font-serif font-bold text-earth-800 mb-4 flex items-center">
        <span className="mr-2">💡</span>
        Tipps & Tricks
      </h3>
      <ul className="space-y-3">
        {tips.map((tip: string, i: number) => (
          <li key={i} className="flex items-start">
            <svg
              className="h-5 w-5 text-sage-600 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span className="text-earth-700">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeTips;
