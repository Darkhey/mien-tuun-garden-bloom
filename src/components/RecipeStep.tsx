
import React, { useState } from "react";
import { Timer } from "lucide-react";
import TimerModal from "./TimerModal";

type Step = {
  id?: string;
  step?: number;
  text: string;
  image?: string;
  time?: number;
};

type Props = {
  step: Step;
  stepNumber: number;
};

const RecipeStep: React.FC<Props> = ({ step, stepNumber }) => {
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <li className="flex flex-col sm:flex-row items-start gap-4">
      <div className="flex flex-col items-center">
        <span className="w-8 h-8 bg-sage-600 text-white rounded-full flex items-center justify-center font-bold text-base mt-1">
          {stepNumber}
        </span>
        {step.time && (
          <button
            onClick={() => setTimerOpen(true)}
            className="mt-2 text-xs text-sage-600 underline flex items-center gap-1 hover:text-sage-800"
            type="button"
          >
            <Timer size={16} />
            Timer starten
          </button>
        )}
      </div>
      <div className="flex-1">
        <p className="text-earth-700 leading-relaxed">{step.text}</p>
        {step.image && (
          <img
            src={step.image}
            alt="Arbeitsschritt"
            className="mt-2 max-w-full rounded shadow"
          />
        )}
      </div>
      {timerOpen && step.time && (
        <TimerModal
          minutes={step.time}
          onClose={() => setTimerOpen(false)}
        />
      )}
    </li>
  );
};

export default RecipeStep;
