import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Pause, AlertTriangle, CheckCircle, RefreshCw, Loader2, BarChart3, Activity } from "lucide-react";
import SimpleScheduledJobManager from "../SimpleScheduledJobManager";
import { scheduledJobService } from "@/services/ScheduledJobService";
import { cronJobService } from "@/services/CronJobService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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
  const [healthStatus, setHealthStatus] = useState<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastSuccessfulRun: Date | null;
  }>({
    status: 'healthy',
    issues: [],
    lastSuccessfulRun: null
  });

  useEffect(() => {
    loadJobStats();
  }, []);

  const loadJobStats = async () => {
    try {
      setLoading(true);
      console.log("[ScheduledJobs] Loading job statistics...");
      
      const [scheduledStats, cronStats, healthStatus] = await Promise.all([
        scheduledJobService.getJobStats(),
        cronJobService.getJobStats(),
        cronJobService.getJobHealthStatus()
      ]);

      setStats({
        scheduledJobs: scheduledStats.totalJobs || 0,
        cronJobs: cronStats.totalJobs,
        activeJobs: cronStats.activeJobs,
        recentExecutions: cronStats.lastExecutions.slice(0, 5),
        successRate: cronStats.successRate
      });

      setHealthStatus(healthStatus);

      console.log("[ScheduledJobs] Statistics loaded:", stats);
      console.log("[ScheduledJobs] Health status:", healthStatus);
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

  const getHealthStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const getLastSuccessfulRunText = (date: Date | null) => {
    if (!date) return 'Keine erfolgreiche Ausführung';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `Vor ${diffMins} Minuten`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Vor ${diffHours} Stunden`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `Vor ${diffDays} Tagen`;
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

      {/* System Health Status */}
      {!loading && stats.cronJobs > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System-Gesundheit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getHealthStatusColor(healthStatus.status)}`}></div>
                <div>
                  <h4 className="font-medium">
                    {healthStatus.status === 'healthy' ? 'System gesund' : 
                     healthStatus.status === 'warning' ? 'Warnungen vorhanden' : 
                     'Kritische Probleme'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {healthStatus.status === 'healthy' ? 'Alle Jobs funktionieren normal' : 
                     healthStatus.status === 'warning' ? 'Einige Jobs benötigen Aufmerksamkeit' : 
                     'Dringende Maßnahmen erforderlich'}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-medium">
                    Letzte erfolgreiche Ausführung
                  </div>
                  <div className="text-xs text-gray-500">
                    {healthStatus.lastSuccessfulRun ? getLastSuccessfulRunText(healthStatus.lastSuccessfulRun) : 'Keine'}
                  </div>
                </div>
              </div>

              {/* Success Rate Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Erfolgsrate</span>
                  <span>{stats.successRate}%</span>
                </div>
                <Progress value={stats.successRate} className="h-2" />
              </div>

              {/* Issues List */}
              {healthStatus.issues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Erkannte Probleme:</h4>
                  <ul className="space-y-1">
                    {healthStatus.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Performance */}
      {!loading && stats.cronJobs > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System-Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Job-Auslastung</h4>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={stats.activeJobs / (stats.cronJobs || 1) * 100} 
                    className="h-2 flex-1" 
                  />
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {Math.round(stats.activeJobs / (stats.cronJobs || 1) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {stats.activeJobs} von {stats.cronJobs} Jobs aktiv
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Ausführungserfolg</h4>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={stats.successRate} 
                    className="h-2 flex-1" 
                  />
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {stats.successRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Basierend auf den letzten 10 Ausführungen
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">System-Gesundheit</h4>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={
                      healthStatus.status === 'healthy' ? 100 :
                      healthStatus.status === 'warning' ? 50 : 20
                    } 
                    className={`h-2 flex-1 ${
                      healthStatus.status === 'healthy' ? 'bg-green-500' :
                      healthStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {healthStatus.status === 'healthy' ? 'Gut' :
                     healthStatus.status === 'warning' ? 'Mittel' : 'Schlecht'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {healthStatus.issues.length} Probleme erkannt
                </p>
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
      {!loading && healthStatus.status === 'critical' && (
        <Alert className="border-red-200 bg-red-50 mb-6">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-700">Kritische Probleme erkannt</AlertTitle>
          <AlertDescription className="text-red-700">
            <p className="text-sm mt-1">Die folgenden kritischen Probleme wurden erkannt:</p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              {healthStatus.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
            <p className="text-sm mt-2 font-medium">Bitte beheben Sie diese Probleme umgehend, um Datenverlust oder Systemausfälle zu vermeiden.</p>
          </AlertDescription>
        </Alert>
      )}

      {!loading && healthStatus.status === 'warning' && (
        <Alert className="border-yellow-200 bg-yellow-50 mb-6">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-700">Warnungen erkannt</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <p className="text-sm mt-1">Die folgenden Warnungen wurden erkannt:</p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              {healthStatus.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <SimpleScheduledJobManager />
    </div>
  );
};

export default ScheduledJobsView;