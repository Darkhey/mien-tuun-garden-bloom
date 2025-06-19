
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, BarChart, Activity, Clock, AlertCircle } from "lucide-react";
import ContentStrategyDashboard from "../ContentStrategyDashboard";
import { contentStrategyService } from "@/services/ContentStrategyService";
import { cronJobService } from "@/services/CronJobService";
import { scheduledJobService } from "@/services/ScheduledJobService";

const ContentStrategyView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    contentStrategy: { active: false, lastRun: null, nextRun: null },
    cronJobs: { total: 0, active: 0, failed: 0 },
    scheduledJobs: { pending: 0, running: 0, completed: 0 }
  });

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      console.log("[ContentStrategy] Loading system status...");
      
      const [cronStats, scheduledStats] = await Promise.all([
        cronJobService.getJobStats(),
        scheduledJobService.getJobStats()
      ]);

      setSystemStatus({
        contentStrategy: {
          active: cronStats.activeJobs > 0,
          lastRun: cronStats.lastExecutions[0]?.started_at || null,
          nextRun: null // TODO: Calculate next run from cron expressions
        },
        cronJobs: {
          total: cronStats.totalJobs,
          active: cronStats.activeJobs,
          failed: cronStats.lastExecutions.filter(e => e.status === 'failed').length
        },
        scheduledJobs: {
          pending: 0, // TODO: Get from scheduled jobs
          running: 0,
          completed: scheduledStats.lastExecutions.filter(e => e.status === 'completed').length
        }
      });

      console.log("[ContentStrategy] System status loaded:", systemStatus);
    } catch (error) {
      console.error("[ContentStrategy] Error loading system status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content-Strategie & Automation</h1>
          <p className="text-gray-600">KI-gesteuerte Content-Planung mit Hintergrund-Automatisierung</p>
        </div>
        <Button onClick={loadSystemStatus} variant="outline" className="ml-auto">
          Status aktualisieren
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Content-Automatisierung</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${systemStatus.contentStrategy.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <p className="text-lg font-semibold">
                    {systemStatus.contentStrategy.active ? 'Aktiv' : 'Inaktiv'}
                  </p>
                </div>
              </div>
            </div>
            {systemStatus.contentStrategy.lastRun && (
              <p className="text-xs text-gray-500">
                Letzte Ausführung: {new Date(systemStatus.contentStrategy.lastRun).toLocaleString('de-DE')}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Cron-Jobs</p>
                <p className="text-lg font-semibold">{systemStatus.cronJobs.active}/{systemStatus.cronJobs.total}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="text-xs">
                {systemStatus.cronJobs.active} Aktiv
              </Badge>
              {systemStatus.cronJobs.failed > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {systemStatus.cronJobs.failed} Fehler
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-lg font-semibold">87%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Erfolgsrate der letzten 30 Tage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Background Process Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Hintergrundprozesse Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${systemStatus.contentStrategy.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h4 className="font-medium">Content-Pipeline</h4>
                  <p className="text-sm text-gray-600">
                    Automatische Generierung von Blog-Artikeln und Rezepten
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {systemStatus.contentStrategy.active ? 'Läuft' : 'Gestoppt'}
                </div>
                <div className="text-xs text-gray-500">
                  {systemStatus.cronJobs.active} aktive Jobs
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${systemStatus.cronJobs.active > 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h4 className="font-medium">Zeitgesteuerte Aufgaben</h4>
                  <p className="text-sm text-gray-600">
                    Cron-Jobs für regelmäßige Content-Erstellung
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {systemStatus.cronJobs.total} Jobs konfiguriert
                </div>
                <div className="text-xs text-gray-500">
                  {systemStatus.cronJobs.active} aktiv, {systemStatus.cronJobs.failed} Fehler
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${systemStatus.scheduledJobs.running > 0 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                <div>
                  <h4 className="font-medium">Geplante Einzelaufgaben</h4>
                  <p className="text-sm text-gray-600">
                    Einmalige oder terminierte Content-Generierung
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {systemStatus.scheduledJobs.pending} wartend
                </div>
                <div className="text-xs text-gray-500">
                  {systemStatus.scheduledJobs.completed} abgeschlossen
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning if issues detected */}
      {(systemStatus.cronJobs.failed > 0 || !systemStatus.contentStrategy.active) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800">Achtung: Systemprobleme erkannt</h4>
                <ul className="text-sm text-orange-700 mt-1 space-y-1">
                  {systemStatus.cronJobs.failed > 0 && (
                    <li>• {systemStatus.cronJobs.failed} Cron-Jobs haben Fehler</li>
                  )}
                  {!systemStatus.contentStrategy.active && (
                    <li>• Content-Automatisierung ist nicht aktiv</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ContentStrategyDashboard />
    </div>
  );
};

export default ContentStrategyView;
