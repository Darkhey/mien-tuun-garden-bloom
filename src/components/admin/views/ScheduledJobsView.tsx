
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Pause, AlertTriangle, CheckCircle } from "lucide-react";
import SimpleScheduledJobManager from "../SimpleScheduledJobManager";
import { scheduledJobService } from "@/services/ScheduledJobService";
import { cronJobService } from "@/services/CronJobService";

const ScheduledJobsView: React.FC = () => {
  const [stats, setStats] = useState({
    scheduledJobs: 0,
    cronJobs: 0,
    activeJobs: 0,
    recentExecutions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobStats();
  }, []);

  const loadJobStats = async () => {
    try {
      console.log("[ScheduledJobs] Loading job statistics...");
      
      const [scheduledStats, cronStats] = await Promise.all([
        scheduledJobService.getJobStats(),
        cronJobService.getJobStats()
      ]);

      setStats({
        scheduledJobs: scheduledStats.totalJobs || 0,
        cronJobs: cronStats.totalJobs,
        activeJobs: cronStats.activeJobs,
        recentExecutions: cronStats.lastExecutions.slice(0, 5)
      });

      console.log("[ScheduledJobs] Statistics loaded:", stats);
    } catch (error) {
      console.error("[ScheduledJobs] Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Clock className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geplante Jobs & Automatisierung</h1>
          <p className="text-gray-600">Zeitgesteuerte Content-Generierung und Hintergrundprozesse</p>
        </div>
        <Button onClick={loadJobStats} variant="outline" className="ml-auto">
          Statistiken aktualisieren
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Geplante Jobs</p>
                <p className="text-lg font-semibold">{stats.scheduledJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Cron-Jobs</p>
                <p className="text-lg font-semibold">{stats.cronJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Aktive Jobs</p>
                <p className="text-lg font-semibold">{stats.activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Erfolgsrate</p>
                <p className="text-lg font-semibold">
                  {stats.recentExecutions.length > 0 
                    ? Math.round((stats.recentExecutions.filter(e => e.status === 'completed').length / stats.recentExecutions.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Letzte Ausführungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Lade Ausführungen...</div>
          ) : stats.recentExecutions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentExecutions.map((execution, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="font-medium">Job Execution #{execution.execution_id?.slice(-8)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(execution.started_at).toLocaleString('de-DE')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(execution.status) as any}>
                      {execution.status}
                    </Badge>
                    {execution.duration_ms && (
                      <span className="text-sm text-gray-500">
                        {execution.duration_ms}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Keine Ausführungen gefunden
            </div>
          )}
        </CardContent>
      </Card>

      <SimpleScheduledJobManager />
    </div>
  );
};

export default ScheduledJobsView;
