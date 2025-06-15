
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Plus,
  Activity,
  Timer,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Settings,
  BarChart3,
  Zap
} from "lucide-react";
import { cronJobService, CronJob, JobExecutionLog, JobTemplate } from "@/services/CronJobService";
import { useToast } from "@/hooks/use-toast";

const CronJobManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [jobLogs, setJobLogs] = useState<JobExecutionLog[]>([]);
  const [jobTemplates, setJobTemplates] = useState<JobTemplate[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  // Form state for creating/editing jobs
  const [jobForm, setJobForm] = useState({
    name: '',
    description: '',
    cron_expression: '0 9 * * *',
    job_type: 'custom' as const,
    function_name: '',
    function_payload: '{}',
    retry_count: 3,
    timeout_seconds: 300,
    tags: '',
    dependencies: '',
    conditions: '{}'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobs, logs, templates, stats] = await Promise.all([
        cronJobService.getCronJobs(),
        cronJobService.getJobLogs(),
        cronJobService.getJobTemplates(),
        cronJobService.getJobStatistics()
      ]);

      setCronJobs(jobs);
      setJobLogs(logs);
      setJobTemplates(templates);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load cron job data:', error);
      toast({
        title: "Fehler",
        description: "Cron-Job Daten konnten nicht geladen werden",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleCreateJob = async () => {
    try {
      const jobData = {
        ...jobForm,
        function_payload: JSON.parse(jobForm.function_payload),
        tags: jobForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        dependencies: jobForm.dependencies.split(',').map(t => t.trim()).filter(Boolean),
        conditions: JSON.parse(jobForm.conditions),
        status: 'inactive' as const,
        enabled: false
      };

      await cronJobService.createCronJob(jobData);
      await loadData();
      setShowCreateForm(false);
      resetForm();
      
      toast({
        title: "Erfolg",
        description: "Cron-Job wurde erstellt"
      });
    } catch (error) {
      console.error('Failed to create job:', error);
      toast({
        title: "Fehler",
        description: "Cron-Job konnte nicht erstellt werden",
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
        description: `Cron-Job wurde ${enabled ? 'aktiviert' : 'deaktiviert'}`
      });
    } catch (error) {
      console.error('Failed to toggle job:', error);
      toast({
        title: "Fehler",
        description: "Cron-Job Status konnte nicht geändert werden",
        variant: "destructive"
      });
    }
  };

  const handleExecuteJob = async (jobId: string) => {
    try {
      await cronJobService.executeJobManually(jobId);
      await loadData();
      
      toast({
        title: "Erfolg",
        description: "Cron-Job wurde manuell ausgeführt"
      });
    } catch (error) {
      console.error('Failed to execute job:', error);
      toast({
        title: "Fehler",
        description: "Cron-Job konnte nicht ausgeführt werden",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Cron-Job löschen möchten?')) return;

    try {
      await cronJobService.deleteCronJob(jobId);
      await loadData();
      
      toast({
        title: "Erfolg",
        description: "Cron-Job wurde gelöscht"
      });
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast({
        title: "Fehler",
        description: "Cron-Job konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      const template = jobTemplates.find(t => t.id === templateId);
      if (!template) return;

      await cronJobService.createJobFromTemplate(templateId, {
        name: `${template.name} (${new Date().toLocaleDateString()})`
      });
      await loadData();
      
      toast({
        title: "Erfolg",
        description: "Cron-Job wurde aus Template erstellt"
      });
    } catch (error) {
      console.error('Failed to create job from template:', error);
      toast({
        title: "Fehler",
        description: "Cron-Job konnte nicht aus Template erstellt werden",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setJobForm({
      name: '',
      description: '',
      cron_expression: '0 9 * * *',
      job_type: 'custom',
      function_name: '',
      function_payload: '{}',
      retry_count: 3,
      timeout_seconds: 300,
      tags: '',
      dependencies: '',
      conditions: '{}'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />;
      case 'paused': return <Timer className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      'content_generation': 'bg-blue-100 text-blue-800',
      'seo_optimization': 'bg-purple-100 text-purple-800', 
      'performance_analysis': 'bg-green-100 text-green-800',
      'cleanup': 'bg-orange-100 text-orange-800',
      'backup': 'bg-gray-100 text-gray-800',
      'custom': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Lade Cron-Jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cron-Job Manager</h1>
          <p className="text-gray-600">Verwalte und überwache automatisierte Tasks</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Cron-Job
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Jobs</p>
                <p className="text-2xl font-bold">{statistics.totalJobs || 0}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Jobs</p>
                <p className="text-2xl font-bold">{statistics.activeJobs || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold">{statistics.successRate || 0}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heute ausgeführt</p>
                <p className="text-2xl font-bold">{statistics.recentExecutions || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fehlgeschlagen</p>
                <p className="text-2xl font-bold">{statistics.failedJobs || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="create">Erstellen</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4">
            {cronJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(job.status)}
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge className={getJobTypeColor(job.job_type)}>
                          {job.job_type}
                        </Badge>
                        <Switch
                          checked={job.enabled}
                          onCheckedChange={(enabled) => handleToggleJob(job.id, enabled)}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Cron: {job.cron_expression}</span>
                        <span>Funktion: {job.function_name}</span>
                        {job.last_run_at && (
                          <span>Letzte Ausführung: {new Date(job.last_run_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecuteJob(job.id)}
                        disabled={!job.enabled}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Neuen Cron-Job erstellen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={jobForm.name}
                    onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })}
                    placeholder="Job-Name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Job-Typ</label>
                  <Select
                    value={jobForm.job_type}
                    onValueChange={(value: any) => setJobForm({ ...jobForm, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content_generation">Content-Generierung</SelectItem>
                      <SelectItem value="seo_optimization">SEO-Optimierung</SelectItem>
                      <SelectItem value="performance_analysis">Performance-Analyse</SelectItem>
                      <SelectItem value="cleanup">Bereinigung</SelectItem>
                      <SelectItem value="backup">Backup</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Beschreibung</label>
                <Textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Job-Beschreibung"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cron-Ausdruck</label>
                  <Input
                    value={jobForm.cron_expression}
                    onChange={(e) => setJobForm({ ...jobForm, cron_expression: e.target.value })}
                    placeholder="0 9 * * *"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {cronJobService.parseCronExpression(jobForm.cron_expression)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Funktionsname</label>
                  <Input
                    value={jobForm.function_name}
                    onChange={(e) => setJobForm({ ...jobForm, function_name: e.target.value })}
                    placeholder="auto-blog-post"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Payload (JSON)</label>
                <Textarea
                  value={jobForm.function_payload}
                  onChange={(e) => setJobForm({ ...jobForm, function_payload: e.target.value })}
                  placeholder='{"category": "auto", "count": 1}'
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Wiederholungen</label>
                  <Input
                    type="number"
                    value={jobForm.retry_count}
                    onChange={(e) => setJobForm({ ...jobForm, retry_count: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Timeout (Sekunden)</label>
                  <Input
                    type="number"
                    value={jobForm.timeout_seconds}
                    onChange={(e) => setJobForm({ ...jobForm, timeout_seconds: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (kommagetrennt)</label>
                  <Input
                    value={jobForm.tags}
                    onChange={(e) => setJobForm({ ...jobForm, tags: e.target.value })}
                    placeholder="content, auto"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cron-Job erstellen
                </Button>
                <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4">
            {jobTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                        {template.is_system_template && (
                          <Badge variant="secondary">System</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Cron: {template.default_cron_expression}</span>
                        <span>Funktion: {template.function_name}</span>
                        <span>Verwendet: {template.usage_count}x</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCreateFromTemplate(template.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Erstellen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ausführungsprotokoll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="font-medium">{log.execution_id}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(log.started_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {log.duration_ms && (
                        <div className="text-sm">{Math.round(log.duration_ms / 1000)}s</div>
                      )}
                      {log.error_message && (
                        <div className="text-xs text-red-600">{log.error_message}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CronJobManager;
