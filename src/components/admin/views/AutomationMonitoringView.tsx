import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cronJobService } from '@/services/CronJobService';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface JobExecutionLog {
  id: string;
  cron_job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  duration_ms?: number;
}

interface CronJob {
  id: string;
  name: string;
  status: string;
  enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  function_name: string;
}

export function AutomationMonitoringView() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [logs, setLogs] = useState<JobExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    successRate: 0,
    lastExecutions: []
  });
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, logsData, statsData] = await Promise.all([
        cronJobService.getAllJobs(),
        cronJobService.getJobLogs(undefined, 20),
        cronJobService.getJobStats()
      ]);
      
      setJobs(jobsData);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Die Automatisierungsdaten konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const executeJob = async (jobId: string) => {
    try {
      const result = await cronJobService.executeJob(jobId);
      if (result.success) {
        toast({
          title: "Job ausgeführt",
          description: "Der Job wurde erfolgreich gestartet."
        });
        await loadData(); // Refresh data
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Job konnte nicht ausgeführt werden.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ausführungsfehler",
        description: "Unerwarteter Fehler bei der Job-Ausführung.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'running': return <Activity className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automatisierung Monitor</h1>
          <p className="text-muted-foreground">
            Überwachen Sie alle automatisierten Content-Erstellungsprozesse
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              von {stats.totalJobs} gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erfolgsrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              letzte 7 Tage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Letzte Ausführung</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastExecutions.length > 0 ? 
                formatDistanceToNow(new Date(stats.lastExecutions[0].started_at), { 
                  addSuffix: true, 
                  locale: de 
                }) : 'Nie'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {stats.successRate >= 80 ? 
              <CheckCircle className="h-4 w-4 text-green-600" /> : 
              <AlertCircle className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.successRate >= 80 ? 'Gesund' : 'Probleme'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Aktive Automatisierungsjobs</CardTitle>
          <CardDescription>
            Übersicht aller konfigurierten Content-Automatisierungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.filter(job => job.enabled).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{job.name}</h3>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Funktion: {job.function_name}
                  </p>
                  {job.next_run_at && (
                    <p className="text-xs text-muted-foreground">
                      Nächste Ausführung: {formatDistanceToNow(new Date(job.next_run_at), { 
                        addSuffix: true, 
                        locale: de 
                      })}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => executeJob(job.id)}
                  variant="outline" 
                  size="sm"
                >
                  Jetzt ausführen
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Ausführungen</CardTitle>
          <CardDescription>
            Protokoll der letzten Job-Ausführungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Noch keine Ausführungen protokolliert.
                </AlertDescription>
              </Alert>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="font-medium">
                        {jobs.find(j => j.id === log.cron_job_id)?.name || 'Unbekannter Job'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(log.started_at), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                        {log.duration_ms && ` • ${log.duration_ms}ms`}
                      </p>
                      {log.error_message && (
                        <p className="text-sm text-red-600">{log.error_message}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}