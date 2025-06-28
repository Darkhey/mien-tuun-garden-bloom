import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, Play, Trash2, Plus, Settings, AlertCircle, Pause, RefreshCw, Calendar, Database, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { scheduledJobService, JobConfig, JobExecution } from "@/services/ScheduledJobService";
import { cronJobService } from "@/services/CronJobService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SimpleScheduledJobManager: React.FC = () => {
  const [jobs, setJobs] = useState<JobConfig[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [executingJobId, setExecutingJobId] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    job_type: 'content_generation' as const,
    function_name: 'generate-blog-post',
    schedule: 'daily',
    enabled: true
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("[JobManager] Loading jobs and executions...");
      
      // Use cronJobService since it has the actual implementation
      const [jobsData, executionsData] = await Promise.all([
        cronJobService.getCronJobs(),
        cronJobService.getJobLogs(undefined, 20)
      ]);

      // Transform to our expected format
      const transformedJobs = jobsData.map(job => ({
        id: job.id,
        name: job.name,
        description: job.description || '',
        cron_expression: job.cron_expression,
        job_type: job.job_type as any,
        function_name: job.function_name,
        function_payload: job.function_payload as Record<string, any>,
        status: job.status as any,
        enabled: job.enabled,
        schedule_pattern: job.cron_expression,
        schedule_type: 'cron',
        is_active: job.enabled,
        target_table: job.function_payload?.target_table || '',
        last_run_at: job.last_run_at,
        next_run_at: job.next_run_at
      }));

      // Fix the output type transformation
      const transformedExecutions = executionsData.map(exec => ({
        id: exec.id,
        cron_job_id: exec.cron_job_id,
        execution_id: exec.execution_id,
        status: exec.status as any,
        started_at: exec.started_at,
        completed_at: exec.completed_at,
        duration_ms: exec.duration_ms,
        output: (exec.output && typeof exec.output === 'object') ? exec.output as Record<string, any> : {},
        error_message: exec.error_message,
        retry_attempt: exec.retry_attempt
      }));

      setJobs(transformedJobs);
      setExecutions(transformedExecutions);
      
      console.log(`[JobManager] Loaded ${transformedJobs.length} jobs and ${transformedExecutions.length} executions`);
    } catch (error) {
      console.error('[JobManager] Failed to load data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const validateJobForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newJob.name.trim()) {
      errors.name = "Name ist erforderlich";
    }
    
    if (!newJob.function_name.trim()) {
      errors.function_name = "Funktion ist erforderlich";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleExecuteJob = async (jobId: string) => {
    try {
      setExecutingJobId(jobId);
      console.log(`[JobManager] Executing job manually: ${jobId}`);
      
      // Check if job is enabled before execution
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        toast({
          title: "Fehler",
          description: "Job nicht gefunden",
          variant: "destructive"
        });
        setExecutingJobId(null);
        return;
      }

      if (!job.enabled) {
        toast({
          title: "Job ist deaktiviert",
          description: "Bitte aktivieren Sie den Job zuerst, bevor Sie ihn ausführen",
          variant: "destructive"
        });
        setExecutingJobId(null);
        return;
      }
      
      const result = await cronJobService.executeJobManually(jobId);
      
      if (result.success) {
        await refreshData();
        toast({
          title: "Erfolg",
          description: "Job wurde manuell ausgeführt"
        });
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Job konnte nicht ausgeführt werden",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('[JobManager] Failed to execute job:', error);
      
      // Better error handling for specific error types
      let errorMessage = "Job konnte nicht ausgeführt werden";
      if (error.message?.includes("Job is disabled")) {
        errorMessage = "Job ist deaktiviert. Bitte aktivieren Sie den Job zuerst.";
      } else if (error.message?.includes("not found")) {
        errorMessage = "Job wurde nicht gefunden";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setExecutingJobId(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Job löschen möchten?')) return;

    try {
      await cronJobService.deleteCronJob(jobId);
      await refreshData();
      
      toast({
        title: "Erfolg",
        description: "Job wurde gelöscht"
      });
    } catch (error) {
      console.error('[JobManager] Failed to delete job:', error);
      toast({
        title: "Fehler",
        description: "Job konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleToggleJob = async (jobId: string, enabled: boolean) => {
    try {
      await cronJobService.toggleCronJob(jobId, enabled);
      await refreshData();
      
      toast({
        title: "Erfolg",
        description: `Job wurde ${enabled ? 'aktiviert' : 'deaktiviert'}`
      });
    } catch (error) {
      console.error('[JobManager] Failed to toggle job:', error);
      toast({
        title: "Fehler",
        description: "Job-Status konnte nicht geändert werden",
        variant: "destructive"
      });
    }
  };

  const handleCreateJob = async () => {
    if (!validateJobForm()) {
      return;
    }

    try {
      const cronExpression = cronJobService.generateCronPattern(newJob.schedule);
      
      if (!cronJobService.validateCronExpression(cronExpression)) {
        toast({
          title: "Fehler",
          description: "Ungültiger Cron-Ausdruck",
          variant: "destructive"
        });
        return;
      }
      
      await cronJobService.createCronJob({
        name: newJob.name,
        description: newJob.description,
        cron_expression: cronExpression,
        job_type: newJob.job_type,
        function_name: newJob.function_name,
        function_payload: {},
        enabled: newJob.enabled
      });

      await refreshData();
      setShowCreateForm(false);
      setNewJob({
        name: '',
        description: '',
        job_type: 'content_generation',
        function_name: 'generate-blog-post',
        schedule: 'daily',
        enabled: true
      });
      setValidationErrors({});

      toast({
        title: "Erfolg",
        description: "Job wurde erstellt"
      });
    } catch (error) {
      console.error('[JobManager] Failed to create job:', error);
      toast({
        title: "Fehler",
        description: "Job konnte nicht erstellt werden",
        variant: "destructive"
      });
    }
  };

  const parseCronPattern = (pattern: string): string => {
    return cronJobService.parseCronExpression(pattern);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'paused': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getExecutionStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'running': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'outline';
      default: return 'outline';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Job-Manager</h2>
          <p className="text-gray-600">Verwalten Sie automatisierte Aufgaben und deren Ausführung</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Aktualisieren
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Job
          </Button>
        </div>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neuen Job erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newJob.name}
                  onChange={(e) => setNewJob({...newJob, name: e.target.value})}
                  placeholder="Job Name"
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Typ</label>
                <Select value={newJob.job_type} onValueChange={(value: any) => setNewJob({...newJob, job_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content_generation">Content-Generierung</SelectItem>
                    <SelectItem value="seo_optimization">SEO-Optimierung</SelectItem>
                    <SelectItem value="performance_analysis">Performance-Analyse</SelectItem>
                    <SelectItem value="cleanup">Bereinigung</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Zeitplan</label>
                <Select value={newJob.schedule} onValueChange={(value) => setNewJob({...newJob, schedule: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="hourly">Stündlich</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Funktion</label>
                <Select 
                  value={newJob.function_name} 
                  onValueChange={(value) => setNewJob({...newJob, function_name: value})}
                >
                  <SelectTrigger className={validationErrors.function_name ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate-blog-post">Blog-Artikel generieren</SelectItem>
                    <SelectItem value="generate-recipe">Rezept generieren</SelectItem>
                    <SelectItem value="auto-blog-post">Auto Blog-Post</SelectItem>
                    <SelectItem value="content-automation-executor">Content Automation</SelectItem>
                    <SelectItem value="ai-content-insights">Content Insights</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.function_name && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.function_name}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Input
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                placeholder="Beschreibung (optional)"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={newJob.enabled}
                onChange={(e) => setNewJob({...newJob, enabled: e.target.checked})}
                className="rounded border-gray-300 text-sage-600 shadow-sm focus:border-sage-300 focus:ring focus:ring-sage-200 focus:ring-opacity-50"
              />
              <label htmlFor="enabled" className="text-sm font-medium">
                Job aktivieren
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateJob}>Job erstellen</Button>
              <Button variant="outline" onClick={() => {
                setShowCreateForm(false);
                setValidationErrors({});
              }}>Abbrechen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-sage-600" />
                <div>
                  <p className="text-sm text-gray-600">Gesamt Jobs</p>
                  <p className="text-lg font-semibold">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Aktive Jobs</p>
                  <p className="text-lg font-semibold">{jobs.filter(j => j.enabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Letzte Ausführung</p>
                  <p className="text-lg font-semibold">
                    {executions.length > 0 
                      ? new Date(executions[0].started_at).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Keine'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Lade Jobs...</p>
            </CardContent>
          </Card>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">{job.name}</h3>
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                      <Badge variant={job.enabled ? "default" : "outline"}>
                        {job.enabled ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Badge variant="secondary">{job.job_type}</Badge>
                      {!job.enabled && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Deaktiviert
                        </Badge>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Zeitplan: {parseCronPattern(job.cron_expression)}</span>
                      <span>Funktion: {job.function_name}</span>
                      <span>Status: {job.status}</span>
                      {job.last_run_at && (
                        <span>Letzte Ausführung: {new Date(job.last_run_at).toLocaleString('de-DE')}</span>
                      )}
                      {job.next_run_at && (
                        <span>Nächste Ausführung: {new Date(job.next_run_at).toLocaleString('de-DE')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleJob(job.id!, !job.enabled)}
                    >
                      {job.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecuteJob(job.id!)}
                      disabled={!job.enabled || executingJobId === job.id}
                      title={!job.enabled ? "Job ist deaktiviert" : "Job manuell ausführen"}
                    >
                      {executingJobId === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteJob(job.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Recent executions for this job */}
                {executions.filter(e => e.cron_job_id === job.id).slice(0, 3).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-gray-600 mb-2">Letzte Ausführungen:</p>
                    <div className="space-y-1">
                      {executions.filter(e => e.cron_job_id === job.id).slice(0, 3).map(exec => (
                        <div key={exec.id} className="flex items-center justify-between text-xs">
                          <span>{new Date(exec.started_at).toLocaleString('de-DE')}</span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={getExecutionStatusBadgeVariant(exec.status)} 
                              className="text-xs"
                            >
                              {exec.status}
                            </Badge>
                            {exec.duration_ms && (
                              <span className="text-gray-500">{formatDuration(exec.duration_ms)}</span>
                            )}
                            {exec.error_message && (
                              <span className="text-red-500 text-xs" title={exec.error_message}>
                                <AlertCircle className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine geplanten Jobs</h3>
              <p className="text-gray-500 mb-4">Erstellen Sie einen neuen Job, um automatisch Content zu generieren.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                Neuen Job erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Executions */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Letzte Ausführungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executions.slice(0, 5).map((execution) => {
                const job = jobs.find(j => j.id === execution.cron_job_id);
                return (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {execution.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : execution.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : execution.status === 'running' ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium">{job?.name || `Job ${execution.cron_job_id?.slice(-8)}`}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(execution.started_at).toLocaleString('de-DE')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getExecutionStatusBadgeVariant(execution.status)}>
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
                          <AlertCircle className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Alert className="bg-blue-50 border-blue-200">
        <Settings className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700 text-sm">
          <p className="font-medium mb-1">Über den Job-Manager</p>
          <p>Mit dem Job-Manager können Sie wiederkehrende Aufgaben automatisieren. Jobs werden nach dem angegebenen Zeitplan ausgeführt und können jederzeit manuell gestartet werden.</p>
          <p className="mt-1">Verfügbare Funktionen: Blog-Artikel generieren, Rezepte erstellen, Content-Optimierung und mehr.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SimpleScheduledJobManager;