import React from 'react';
import { Sprout, Home, ArrowUpFromLine, Apple } from 'lucide-react';
import type { PlantData } from '@/types/sowing';

interface SowingCalendarStatsProps {
  plants: PlantData[];
}

const SowingCalendarStats: React.FC<SowingCalendarStatsProps> = ({ plants }) => {
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  const directSowCount = plants.filter(p => p.directSow?.includes(currentMonth)).length;
  const indoorCount = plants.filter(p => p.indoor?.includes(currentMonth)).length;
  const plantOutCount = plants.filter(p => p.plantOut?.includes(currentMonth)).length;
  const harvestCount = plants.filter(p => p.harvest?.includes(currentMonth)).length;

  const stats = [
    { icon: Sprout, label: 'Aussaat', count: directSowCount, color: 'text-green-600 bg-green-50 border-green-200' },
    { icon: Home, label: 'Vorziehen', count: indoorCount, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { icon: ArrowUpFromLine, label: 'Auspflanzen', count: plantOutCount, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { icon: Apple, label: 'Ernten', count: harvestCount, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      {stats.map(s => (
        <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${s.color}`}>
          <s.icon className="h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <span className="text-lg font-bold leading-none">{s.count}</span>
            <span className="text-xs ml-1 opacity-75">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SowingCalendarStats;
