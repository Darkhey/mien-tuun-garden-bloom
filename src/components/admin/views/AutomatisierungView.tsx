
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Settings, Activity } from "lucide-react";
import AutomationDashboard from "../AutomationDashboard";
import { adminStatsService } from "@/services/AdminStatsService";

const AutomatisierungView: React.FC = () => {
  const [stats, setStats] = useState({ active: 0, today: 0, success: 0 });

  useEffect(() => {
    adminStatsService.getAutomationStats().then(res => {
      setStats({ active: res.activeWorkflows, today: res.executionsToday, success: res.successRate });
    });
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Zap className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatisierung</h1>
          <p className="text-gray-600">Verwalte automatisierte Prozesse und Workflows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aktive Workflows</p>
                <p className="text-lg font-semibold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Ausführungen heute</p>
                <p className="text-lg font-semibold">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Erfolgsrate</p>
                <p className="text-lg font-semibold">{stats.success}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AutomationDashboard />
    </div>
  );
};

export default AutomatisierungView;
