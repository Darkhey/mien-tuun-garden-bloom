import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Pause, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import SimpleScheduledJobManager from "../SimpleScheduledJobManager";
import { scheduledJobService } from "@/services/ScheduledJobService";
import { cronJobService } from "@/services/CronJobService";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ScheduledJobsView: React.FC = () => {
  const [stats, setStats] = useState({
    scheduledJobs: 0,
    cronJobs: 0,
    activeJobs: 0,
    recentExecutions: [],
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobStats();
  }, []);

  const loadJobStats = async () => {
    try {
      setLoading(true);
      console.log("[ScheduledJobs] Loading job statistics...");
      
      const [scheduledStats, cronStats] = await Promise.all([
        scheduledJobService.getJobStats(),
        cronJobService.getJobStats()
      ]);

      setStats({
        scheduledJobs: scheduledStats.totalJobs || 0,
        cronJobs: cronStats.totalJobs,
        activeJobs: cronStats.activeJobs,
        recentExecutions: cronStats.lastExecutions.slice(0, 5),
        successRate: cronStats.successRate
      });

      console.log("[ScheduledJobs] Statistics loaded:", stats);
    } catch (error) {
      console.error("[ScheduledJobs] Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await loadJobStats();
    setRefreshing(false);
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

  const formatDuration = (ms?: number): string => {
    if (!ms) return 'N/A';
    
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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
        <Button onClick={refreshStats} variant="outline" className="ml-auto" disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
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
                  {stats.successRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      {!loading && stats.cronJobs > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stats.activeJobs > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <h4 className="font-medium">Automatisierung</h4>
                    <p className="text-sm text-gray-600">
                      {stats.activeJobs > 0 ? 'Aktiv' : 'Inaktiv'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {stats.activeJobs} aktive Jobs
                  </div>
                  <div className="text-xs text-gray-500">
                    von {stats.cronJobs} gesamt
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stats.successRate >= 80 ? 'bg-green-500' : stats.successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <div>
                    <h4 className="font-medium">System-Gesundheit</h4>
                    <p className="text-sm text-gray-600">
                      {stats.successRate >= 80 ? 'Ausgezeichnet' : stats.successRate >= 50 ? 'Gut' : 'Probleme'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {stats.successRate}% Erfolgsrate
                  </div>
                  <div className="text-xs text-gray-500">
                    letzte 10 Ausführungen
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Executions */}
      {!loading && stats.recentExecutions && stats.recentExecutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Letzte Ausführungen
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        {formatDuration(execution.duration_ms)}
                      </span>
                    )}
                    {execution.error_message && (
                      <span 
                        className="text-red-500 text-xs cursor-help" 
                        title={execution.error_message}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning if issues detected */}
      {!loading && stats.successRate < 50 && (
        <Alert className="border-orange-200 bg-orange-50 mb-6">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <p className="font-medium">Achtung: Probleme mit der Job-Ausführung erkannt</p>
            <p className="text-sm mt-1">Die Erfolgsrate der letzten Ausführungen ist niedrig. Überprüfen Sie die Fehlerprotokolle und stellen Sie sicher, dass alle erforderlichen Ressourcen verfügbar sind.</p>
          </AlertDescription>
        </Alert>
      )}

      <SimpleScheduledJobManager />
    </div>
  );
};

export default ScheduledJobsView;