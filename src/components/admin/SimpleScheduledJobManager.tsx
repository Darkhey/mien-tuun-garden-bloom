import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Play, Trash2, Plus, Settings, AlertCircle, Pause, RefreshCw, Calendar, Database, CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import { scheduledJobService, JobConfig, JobExecution } from "@/services/ScheduledJobService";
import { cronJobService } from "@/services/CronJobService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SimpleScheduledJobManager: React.FC = () => {
  const [jobs, setJobs] = useState<JobConfig[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [executingJobId, setExecutingJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    job_type: 'content_generation' as const,
    function_name: 'generate-blog-post',
    schedule: 'daily',
    hour: '9',
    minute: '0',
    dayOfWeek: '1',
    dayOfMonth: '1',
    enabled: true,
    custom_pattern: '0 9 * * *'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const availableFunctions = cronJobService.getAvailableFunctions();

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
    
    if (newJob.schedule === 'custom' && !newJob.custom_pattern.trim()) {
      errors.custom_pattern = "Benutzerdefiniertes Muster ist erforderlich";
    }
    
    if (newJob.schedule === 'custom' && !cronJobService.validateCronExpression(newJob.custom_pattern)) {
      errors.custom_pattern = "Ungültiges Cron-Muster";
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
      let cronExpression = '';
      
      if (newJob.schedule === 'custom') {
        cronExpression = newJob.custom_pattern;
      } else {
        const options: Record<string, any> = {};
        
        if (newJob.schedule === 'daily' || newJob.schedule === 'weekly' || newJob.schedule === 'monthly') {
          options.hour = parseInt(newJob.hour);
          options.minute = parseInt(newJob.minute);
        }
        
        if (newJob.schedule === 'weekly') {
          options.dayOfWeek = parseInt(newJob.dayOfWeek);
        }
        
        if (newJob.schedule === 'monthly') {
          options.dayOfMonth = parseInt(newJob.dayOfMonth);
        }
        
        cronExpression = cronJobService.generateCronPattern(newJob.schedule, options);
      }
      
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
        hour: '9',
        minute: '0',
        dayOfWeek: '1',
        dayOfMonth: '1',
        enabled: true,
        custom_pattern: '0 9 * * *'
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

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleViewJobDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowJobDetails(true);
  };

  const getSelectedJob = () => {
    return jobs.find(job => job.id === selectedJobId);
  };

  const getJobExecutions = () => {
    return executions.filter(exec => exec.cron_job_id === selectedJobId);
  };

  const getFunctionDescription = (functionName: string): string => {
    const func = availableFunctions.find(f => f.name === functionName);
    return func ? func.description : functionName;
  };

  const getNextRunTime = (job: JobConfig): string => {
    if (!job.next_run_at) {
      return 'Nicht geplant';
    }
    
    try {
      const nextRun = new Date(job.next_run_at);
      const now = new Date();
      
      // If next run is in the past
      if (nextRun < now) {
        return 'Überfällig';
      }
      
      // Calculate time difference
      const diffMs = nextRun.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `In ${diffMins} Minuten`;
      }
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `In ${diffHours} Stunden`;
      }
      
      const diffDays = Math.floor(diffHours / 24);
      return `In ${diffDays} Tagen`;
    } catch (error) {
      console.error('Error calculating next run time:', error);
      return formatDateTime(job.next_run_at);
    }
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
                    {availableFunctions.map(func => (
                      <SelectItem key={func.name} value={func.name}>
                        {func.name} - {func.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.function_name && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.function_name}</p>
                )}
              </div>
            </div>

            {/* Schedule options based on selected schedule type */}
            {newJob.schedule === 'daily' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stunde</label>
                  <Select value={newJob.hour} onValueChange={(value) => setNewJob({...newJob, hour: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 24}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Minute</label>
                  <Select value={newJob.minute} onValueChange={(value) => setNewJob({...newJob, minute: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 60}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {newJob.schedule === 'weekly' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Tag</label>
                  <Select value={newJob.dayOfWeek} onValueChange={(value) => setNewJob({...newJob, dayOfWeek: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sonntag</SelectItem>
                      <SelectItem value="1">Montag</SelectItem>
                      <SelectItem value="2">Dienstag</SelectItem>
                      <SelectItem value="3">Mittwoch</SelectItem>
                      <SelectItem value="4">Donnerstag</SelectItem>
                      <SelectItem value="5">Freitag</SelectItem>
                      <SelectItem value="6">Samstag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Stunde</label>
                  <Select value={newJob.hour} onValueChange={(value) => setNewJob({...newJob, hour: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 24}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Minute</label>
                  <Select value={newJob.minute} onValueChange={(value) => setNewJob({...newJob, minute: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 60}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {newJob.schedule === 'monthly' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Tag des Monats</label>
                  <Select value={newJob.dayOfMonth} onValueChange={(value) => setNewJob({...newJob, dayOfMonth: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 31}, (_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Stunde</label>
                  <Select value={newJob.hour} onValueChange={(value) => setNewJob({...newJob, hour: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 24}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Minute</label>
                  <Select value={newJob.minute} onValueChange={(value) => setNewJob({...newJob, minute: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 60}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {newJob.schedule === 'hourly' && (
              <div>
                <label className="text-sm font-medium">Minute</label>
                <Select value={newJob.minute} onValueChange={(value) => setNewJob({...newJob, minute: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 60}, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newJob.schedule === 'custom' && (
              <div>
                <label className="text-sm font-medium">Benutzerdefiniertes Cron-Muster</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newJob.custom_pattern}
                    onChange={(e) => setNewJob({...newJob, custom_pattern: e.target.value})}
                    placeholder="0 9 * * *"
                    className={validationErrors.custom_pattern ? "border-red-500" : ""}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cron-Format: Minute Stunde Tag Monat Wochentag</p>
                        <p>Beispiel: 0 9 * * * = Täglich um 9:00 Uhr</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {validationErrors.custom_pattern && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.custom_pattern}</p>
                )}
                {newJob.custom_pattern && cronJobService.validateCronExpression(newJob.custom_pattern) && (
                  <p className="text-xs text-green-600 mt-1">
                    {cronJobService.parseCronExpression(newJob.custom_pattern)}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                placeholder="Beschreibung (optional)"
                rows={3}
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
                      {job.next_run_at && (
                        <span>Nächste Ausführung: {getNextRunTime(job)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewJobDetails(job.id!)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
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
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-red-500 text-xs cursor-help">
                                      <AlertCircle className="h-3 w-3" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-xs">{exec.error_message}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
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

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Detaillierte Informationen und Ausführungsverlauf
            </DialogDescription>
          </DialogHeader>

          {selectedJobId && (
            <div className="space-y-6">
              {/* Job Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Allgemeine Informationen</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{getSelectedJob()?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Typ:</span>
                      <span>{getSelectedJob()?.job_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={getStatusBadgeVariant(getSelectedJob()?.status || '')}>
                        {getSelectedJob()?.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Aktiviert:</span>
                      <span>{getSelectedJob()?.enabled ? 'Ja' : 'Nein'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Funktion:</span>
                      <span>{getSelectedJob()?.function_name}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Zeitplan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cron-Ausdruck:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {getSelectedJob()?.cron_expression}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Menschenlesbar:</span>
                      <span>{parseCronPattern(getSelectedJob()?.cron_expression || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Letzte Ausführung:</span>
                      <span>{getSelectedJob()?.last_run_at ? formatDateTime(getSelectedJob()?.last_run_at) : 'Nie'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nächste Ausführung:</span>
                      <span>{getSelectedJob()?.next_run_at ? formatDateTime(getSelectedJob()?.next_run_at) : 'Nicht geplant'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {getSelectedJob()?.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Beschreibung</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {getSelectedJob()?.description}
                  </p>
                </div>
              )}

              {/* Function Details */}
              <div>
                <h3 className="text-sm font-medium mb-2">Funktionsdetails</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm mb-2">
                    <span className="font-medium">Funktion:</span> {getSelectedJob()?.function_name}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Beschreibung:</span> {getFunctionDescription(getSelectedJob()?.function_name || '')}
                  </p>
                  {getSelectedJob()?.function_payload && Object.keys(getSelectedJob()?.function_payload).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Parameter:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(getSelectedJob()?.function_payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Execution History */}
              <div>
                <h3 className="text-sm font-medium mb-2">Ausführungsverlauf</h3>
                {getJobExecutions().length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getJobExecutions().map(exec => (
                      <div key={exec.id} className="bg-gray-50 p-3 rounded flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {exec.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : exec.status === 'failed' ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : exec.status === 'running' ? (
                              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium">
                              {formatDateTime(exec.started_at)}
                            </span>
                          </div>
                          {exec.error_message && (
                            <p className="text-xs text-red-500 mt-1 ml-6">
                              Fehler: {exec.error_message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getExecutionStatusBadgeVariant(exec.status)}>
                            {exec.status}
                          </Badge>
                          {exec.duration_ms && (
                            <span className="text-xs text-gray-500">
                              {formatDuration(exec.duration_ms)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Keine Ausführungen gefunden</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleToggleJob(selectedJobId!, !getSelectedJob()?.enabled)}
                >
                  {getSelectedJob()?.enabled ? 'Deaktivieren' : 'Aktivieren'}
                </Button>
                <Button
                  onClick={() => handleExecuteJob(selectedJobId!)}
                  disabled={!getSelectedJob()?.enabled || executingJobId === selectedJobId}
                >
                  {executingJobId === selectedJobId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Wird ausgeführt...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Jetzt ausführen
                    </>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button variant="secondary">Schließen</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

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