import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import ScheduledJobManager from "../ScheduledJobManager";

const ScheduledJobsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Clock className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geplante Jobs</h1>
          <p className="text-gray-600">Automatisierte Eintragsgeneration mit pg_cron</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Zeitplan-Typen</p>
                <p className="text-lg font-semibold">Täglich, Wöchentlich, Monatlich</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Automatisierung</p>
                <p className="text-lg font-semibold">Einträge nach Vorlage erstellen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ScheduledJobManager />
    </div>
  );
};

export default ScheduledJobsView;