import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock, TrendingUp, Activity, RefreshCw, Play, Pause, Trash2, Plus, Settings2, Calendar, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cronJobService, type CronJob, type JobExecutionLog, type JobTemplate } from '@/services/CronJobService';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CronJobManagerProps {
  onJobCreated?: () => void;
}

export function CronJobManager({ onJobCreated }: CronJobManagerProps) {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [logs, setLogs] = useState<JobExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    successRate: 0,
    lastExecutions: []
  });

  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    cron_expression: '0 9 * * *',
    job_type: 'content_generation' as 'content_generation' | 'seo_optimization' | 'performance_analysis' | 'cleanup' | 'backup' | 'custom' | 'social_media',
    function_name: 'auto-blog-post',
    function_payload: {},
    enabled: true,
    selectedTemplate: ''
  });

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, templatesData, logsData, statsData] = await Promise.all([
        cronJobService.getAllJobs(),
        cronJobService.getJobTemplates(),
        cronJobService.getJobLogs(undefined, 20),
        cronJobService.getJobStats()
      ]);
      
      setJobs(jobsData);
      setTemplates(templatesData);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading cron job data:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Die Job-Daten konnten nicht geladen werden.",
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
        await loadData();
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

  const toggleJob = async (jobId: string, enabled: boolean) => {
    try {
      await cronJobService.toggleJob(jobId, enabled);
      toast({
        title: "Status geändert",
        description: `Job wurde ${enabled ? 'aktiviert' : 'deaktiviert'}.`
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Job-Status konnte nicht geändert werden.",
        variant: "destructive"
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Job löschen möchten?')) {
      return;
    }

    try {
      await cronJobService.deleteJob(jobId);
      toast({
        title: "Job gelöscht",
        description: "Der Job wurde erfolgreich gelöscht."
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Löschfehler",
        description: "Job konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const createJob = async () => {
    try {
      if (newJob.selectedTemplate) {
        // Create from template
        await cronJobService.createJobFromTemplate(newJob.selectedTemplate, {
          name: newJob.name || undefined,
          description: newJob.description || undefined,
          enabled: newJob.enabled
        });
      } else {
        // Create custom job
        await cronJobService.createJob({
          name: newJob.name,
          description: newJob.description,
          cron_expression: newJob.cron_expression,
          job_type: newJob.job_type,
          function_name: newJob.function_name,
          function_payload: newJob.function_payload,
          enabled: newJob.enabled
        });
      }

      toast({
        title: "Job erstellt",
        description: "Der neue Job wurde erfolgreich erstellt."
      });

      // Reset form
      setNewJob({
        name: '',
        description: '',
        cron_expression: '0 9 * * *',
        job_type: 'content_generation' as 'content_generation' | 'seo_optimization' | 'performance_analysis' | 'cleanup' | 'backup' | 'custom' | 'social_media',
        function_name: 'auto-blog-post',
        function_payload: {},
        enabled: true,
        selectedTemplate: ''
      });
      setShowCreateForm(false);
      await loadData();
      onJobCreated?.();
    } catch (error) {
      toast({
        title: "Erstellungsfehler",
        description: "Job konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewJob({
        ...newJob,
        selectedTemplate: templateId,
        name: template.name,
        description: template.description || '',
        cron_expression: template.default_cron_expression,
        job_type: template.job_type,
        function_name: template.function_name,
        function_payload: (template.default_payload as any) || {}
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cron Job Verwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie automatisierte Aufgaben und Zeitpläne
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Job erstellen
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alle Jobs</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>

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
              letzte Ausführungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              verfügbare Vorlagen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neuen Job erstellen</CardTitle>
            <CardDescription>
              Erstellen Sie einen neuen automatisierten Job oder verwenden Sie eine Vorlage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template auswählen (optional)</label>
                <Select value={newJob.selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vorlage wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Benutzerdefiniert</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  placeholder="Job Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cron Ausdruck</label>
                <Input
                  value={newJob.cron_expression}
                  onChange={(e) => setNewJob({ ...newJob, cron_expression: e.target.value })}
                  placeholder="0 9 * * *"
                />
                <p className="text-xs text-muted-foreground">
                  {cronJobService.parseCronExpression(newJob.cron_expression)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Funktion</label>
                <Select 
                  value={newJob.function_name} 
                  onValueChange={(value) => setNewJob({ ...newJob, function_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto-blog-post">Auto Blog Post</SelectItem>
                    <SelectItem value="create-strategy-article">Strategy Article</SelectItem>
                    <SelectItem value="generate-recipe">Recipe Generator</SelectItem>
                    <SelectItem value="instagram-post">Instagram Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Job Beschreibung"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newJob.enabled}
                  onChange={(e) => setNewJob({ ...newJob, enabled: e.target.checked })}
                />
                <label htmlFor="enabled" className="text-sm font-medium">
                  Sofort aktivieren
                </label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Abbrechen
                </Button>
                <Button onClick={createJob}>
                  Job erstellen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Jobs</CardTitle>
          <CardDescription>
            Übersicht aller konfigurierten Cron Jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Keine Jobs konfiguriert. Erstellen Sie Ihren ersten Job.
                </AlertDescription>
              </Alert>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{job.name}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                        {job.status}
                      </Badge>
                      {!job.enabled && (
                        <Badge variant="secondary">Deaktiviert</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.description || 'Keine Beschreibung'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Funktion: {job.function_name}</span>
                      <span>Zeitplan: {cronJobService.parseCronExpression(job.cron_expression)}</span>
                      {job.next_run_at && (
                        <span>
                          Nächste Ausführung: {formatDistanceToNow(new Date(job.next_run_at), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{job.name}</DialogTitle>
                          <DialogDescription>
                            Job Details und Ausführungshistorie
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Konfiguration</h4>
                            <div className="text-sm text-muted-foreground">
                              <p>Typ: {job.job_type}</p>
                              <p>Funktion: {job.function_name}</p>
                              <p>Cron: {job.cron_expression}</p>
                              <p>Status: {job.status}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">Letzte Ausführungen</h4>
                            <div className="space-y-2">
                              {logs
                                .filter(log => log.cron_job_id === job.id)
                                .slice(0, 5)
                                .map((log) => (
                                  <div key={log.id} className="flex justify-between text-sm">
                                    <span>{log.status}</span>
                                    <span>{formatDistanceToNow(new Date(log.started_at), { locale: de })}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      onClick={() => executeJob(job.id)}
                      variant="outline" 
                      size="sm"
                      disabled={!job.enabled}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      onClick={() => toggleJob(job.id, !job.enabled)}
                      variant="outline" 
                      size="sm"
                    >
                      {job.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button 
                      onClick={() => deleteJob(job.id)}
                      variant="outline" 
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}