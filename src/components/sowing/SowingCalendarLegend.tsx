import React from 'react';
import type { SowingCategory } from '@/types/sowing';

interface SowingCalendarLegendProps {
  categories: SowingCategory[];
}

const SowingCalendarLegend: React.FC<SowingCalendarLegendProps> = ({ categories }) => {
  return (
    <div className="mt-6 p-5 bg-white rounded-xl border border-sage-200 shadow-sm">
      <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center text-sm mb-4">
        {categories.map(cat => (
          <div key={cat.key} className="flex items-center gap-2.5">
            <span className={`${cat.color} w-4 h-4 rounded-full border-2 border-white shadow-sm`}></span>
            <span className="text-earth-700 font-medium">{cat.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground pt-3 border-t border-sage-100">
        <span className="flex items-center gap-1.5">
          <span className="text-base">🌱</span> Einfach – perfekt für Anfänger
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-base">🌿</span> Mittel – etwas Erfahrung hilfreich
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-base">🌳</span> Schwer – für erfahrene Gärtner
        </span>
      </div>
    </div>
  );
};

export default SowingCalendarLegend;
