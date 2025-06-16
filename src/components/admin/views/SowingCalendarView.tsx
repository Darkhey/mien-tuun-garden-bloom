
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sprout, Sun } from "lucide-react";
import SowingCalendar from "../SowingCalendar";

const SowingCalendarView: React.FC = () => {
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
                <p className="text-lg font-semibold">Winter</p>
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
                <p className="text-lg font-semibold">15 Arten</p>
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
                <p className="text-lg font-semibold">In 3 Tagen</p>
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
