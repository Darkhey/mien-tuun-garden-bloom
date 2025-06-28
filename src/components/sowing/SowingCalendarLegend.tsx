import React from 'react';
import type { SowingCategory } from '@/types/sowing';

interface SowingCalendarLegendProps {
  categories: SowingCategory[];
}

const SowingCalendarLegend: React.FC<SowingCalendarLegendProps> = ({ categories }) => {
  return (
    <div className="mt-4 p-4 bg-sage-25 rounded-lg border border-sage-200">
      <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm">
        {categories.map(cat => (
          <div key={cat.key} className="flex items-center gap-2">
            <span className={`${cat.color} w-3 h-3 rounded-full border border-white shadow-sm`}></span>
            <span className="text-sage-700 font-medium">{cat.label}</span>
          </div>
        ))}
      </div>
      <div className="text-center mt-3 text-xs text-sage-600">
        💡 Schwierigkeitsgrade: <span className="text-green-600 font-medium">Einfach</span> für Anfänger, 
        <span className="text-yellow-600 font-medium"> Mittel</span> mit etwas Erfahrung, 
        <span className="text-red-600 font-medium"> Schwer</span> für erfahrene Gärtner
      </div>
    </div>
  );
};

export default SowingCalendarLegend;