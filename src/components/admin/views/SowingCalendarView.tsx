
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sprout, Sun } from "lucide-react";
import SowingCalendar, { SOWING_DATA } from "../SowingCalendar";

const month = new Date().getMonth() + 1;
const season = month >= 3 && month <= 5
  ? 'Frühling'
  : month >= 6 && month <= 8
  ? 'Sommer'
  : month >= 9 && month <= 11
  ? 'Herbst'
  : 'Winter';

function useSowingStats() {
  return useMemo(() => {
    const recommended = SOWING_DATA.filter(p =>
      p.directSow.includes(month) || p.indoor.includes(month)
    ).length;

    const allMonths = SOWING_DATA.flatMap(p => [...p.directSow, ...p.indoor, ...p.plantOut]);
    const future = allMonths.filter(m => m >= month);
    const nextMonth = future.length > 0 ? Math.min(...future) : Math.min(...allMonths);
    const diffMonths = nextMonth >= month ? nextMonth - month : 12 - month + nextMonth;
    const days = diffMonths * 30;

    return { recommended, days };
  }, []);
}

const SowingCalendarView: React.FC = () => {
  const stats = useSowingStats();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Calendar className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aussaat-Kalender</h1>
          <p className="text-gray-600">Verwalte und plane die Aussaatzeiten für verschiedene Pflanzen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aktuelle Saison</p>
                <p className="text-lg font-semibold">{season}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Empfohlene Pflanzen</p>
                <p className="text-lg font-semibold">{stats.recommended} Arten</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Nächste Aussaat</p>
                <p className="text-lg font-semibold">In {stats.days} Tagen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SowingCalendar />
    </div>
  );
};

export default SowingCalendarView;
