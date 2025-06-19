
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, Play, Trash2, Plus, Settings, AlertCircle } from "lucide-react";
import { scheduledJobService, JobConfig, JobExecution } from "@/services/ScheduledJobService";
import { cronJobService } from "@/services/CronJobService";
import { useToast } from "@/hooks/use-toast";

const SimpleScheduledJobManager: React.FC = () => {
  const [jobs, setJobs] = useState<JobConfig[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    job_type: 'content_generation' as const,
    function_name: 'generate-blog-post',
    schedule: 'daily',
    enabled: true
  });
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
        enabled: job.enabled
      }));

      const transformedExecutions = executionsData.map(exec => ({
        id: exec.id,
        cron_job_id: exec.cron_job_id,
        execution_id: exec.execution_id,
        status: exec.status as any,
        started_at: exec.started_at,
        completed_at: exec.completed_at,
        duration_ms: exec.duration_ms,
        output: exec.output,
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

  const handleExecuteJob = async (jobId: string) => {
    try {
      console.log(`[JobManager] Executing job manually: ${jobId}`);
      
      const result = await cronJobService.executeJobManually(jobId);
      
      if (result.success) {
        await loadData();
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
    } catch (error) {
      console.error('[JobManager] Failed to execute job:', error);
      toast({
        title: "Fehler",
        description: "Job konnte nicht ausgeführt werden",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Job löschen möchten?')) return;

    try {
      await cronJobService.deleteCronJob(jobId);
      await loadData();
      
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
      await loadData();
      
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
    if (!newJob.name) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Job-Namen ein",
        variant: "destructive"
      });
      return;
    }

    try {
      const cronExpression = scheduledJobService.generateCronPattern(newJob.schedule);
      
      await cronJobService.createCronJob({
        name: newJob.name,
        description: newJob.description,
        cron_expression: cronExpression,
        job_type: newJob.job_type,
        function_name: newJob.function_name,
        function_payload: {},
        enabled: newJob.enabled
      });

      await loadData();
      setShowCreateForm(false);
      setNewJob({
        name: '',
        description: '',
        job_type: 'content_generation',
        function_name: 'generate-blog-post',
        schedule: 'daily',
        enabled: true
      });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Job-Manager</h2>
          <p className="text-gray-600">Verwalten Sie automatisierte Aufgaben und deren Ausführung</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Job
        </Button>
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
                />
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Funktion</label>
                <Select value={newJob.function_name} onValueChange={(value) => setNewJob({...newJob, function_name: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate-blog-post">Blog-Artikel generieren</SelectItem>
                    <SelectItem value="generate-recipe">Rezept generieren</SelectItem>
                    <SelectItem value="auto-blog-post">Auto Blog-Post</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="flex gap-2">
              <Button onClick={handleCreateJob}>Job erstellen</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Abbrechen</Button>
            </div>
          </CardContent>
        </Card>
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
                      <Badge variant={job.enabled ? "default" : "outline"}>
                        {job.enabled ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Badge variant="secondary">{job.job_type}</Badge>
                    </div>
                    {job.description && (
                      <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Zeitplan: {parseCronPattern(job.cron_expression)}</span>
                      <span>Funktion: {job.function_name}</span>
                      <span>Status: {job.status}</span>
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
                      disabled={!job.enabled}
                    >
                      <Play className="h-4 w-4" />
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
                          <Badge variant={exec.status === 'completed' ? 'default' : exec.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                            {exec.status}
                          </Badge>
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
    </div>
  );
};

export default SimpleScheduledJobManager;
