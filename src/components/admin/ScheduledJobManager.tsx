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
import { scheduledJobService, JobConfig, JobExecution } from "@/services/ScheduledJobService";
import { useToast } from "@/hooks/use-toast";

const ScheduledJobManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState<JobConfig[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobConfig | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const { toast } = useToast();

  // Form state for creating/editing jobs
  const [jobForm, setJobForm] = useState<Omit<JobConfig, 'id'>>({
    name: '',
    description: '',
    schedule_pattern: '0 9 * * *',
    schedule_type: 'daily',
    target_table: '',
    template_data: {},
    is_active: true
  });

  // Schedule options for form
  const [scheduleOptions, setScheduleOptions] = useState({
    hour: '9',
    minute: '0',
    dayOfWeek: '1',
    dayOfMonth: '1',
    customPattern: '0 9 * * *'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobs, executions, stats, tables] = await Promise.all([
        scheduledJobService.getJobConfigs(),
        scheduledJobService.getJobExecutions(),
        scheduledJobService.getJobStats(),
        scheduledJobService.getAvailableTargetTables()
      ]);

      setJobs(jobs);
      setExecutions(executions);
      setStatistics(stats);
      setAvailableTables(tables);
    } catch (error) {
      console.error('Failed to load scheduled job data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleCreateJob = async () => {
    try {
      // Generate cron pattern based on schedule type
      let cronPattern = jobForm.schedule_pattern;
      if (jobForm.schedule_type !== 'custom') {
        cronPattern = scheduledJobService.generateCronPattern(jobForm.schedule_type, {
          hour: parseInt(scheduleOptions.hour),
          minute: parseInt(scheduleOptions.minute),
          dayOfWeek: parseInt(scheduleOptions.dayOfWeek),
          dayOfMonth: parseInt(scheduleOptions.dayOfMonth)
        });
      } else {
        cronPattern = scheduleOptions.customPattern;
      }

      // Validate template data
      let templateData = {};
      try {
        templateData = typeof jobForm.template_data === 'string' 
          ? JSON.parse(jobForm.template_data as string)
          : jobForm.template_data;
      } catch (e) {
        throw new Error('Invalid template data JSON');
      }

      const jobData: Omit<JobConfig, 'id'> = {
        ...jobForm,
        schedule_pattern: cronPattern,
        template_data: templateData
      };

      await scheduledJobService.createJobConfig(jobData);
      await loadData();
      setShowCreateForm(false);
      resetForm();
      
      toast({
        title: "Erfolg",
        description: "Geplanter Job wurde erstellt"
      });
    } catch (error) {
      console.error('Failed to create job:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleJob = async (jobId: string, enabled: boolean) => {
    try {
      await scheduledJobService.toggleJobActive(jobId, enabled);
      await loadData();
      
      toast({
        title: "Erfolg",
        description: `Job wurde ${enabled ? 'aktiviert' : 'deaktiviert'}`
      });
    } catch (error) {
      console.error('Failed to toggle job:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExecuteJob = async (jobId: string) => {
    try {
      await scheduledJobService.runJobManually(jobId);
      await loadData();
      
      toast({
        title: "Erfolg",
        description: "Job wurde manuell ausgeführt"
      });
    } catch (error) {
      console.error('Failed to execute job:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Job löschen möchten?')) return;

    try {
      await scheduledJobService.deleteJobConfig(jobId);
      await loadData();
      
      toast({
        title: "Erfolg",
        description: "Job wurde gelöscht"
      });
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setJobForm({
      name: '',
      description: '',
      schedule_pattern: '0 9 * * *',
      schedule_type: 'daily',
      target_table: '',
      template_data: {},
      is_active: true
    });
    setScheduleOptions({
      hour: '9',
      minute: '0',
      dayOfWeek: '1',
      dayOfMonth: '1',
      customPattern: '0 9 * * *'
    });
  };

  const handleScheduleTypeChange = (type: string) => {
    setJobForm(prev => ({ ...prev, schedule_type: type as any }));
    
    // Update the schedule pattern based on the type
    const pattern = scheduledJobService.generateCronPattern(type, {
      hour: parseInt(scheduleOptions.hour),
      minute: parseInt(scheduleOptions.minute),
      dayOfWeek: parseInt(scheduleOptions.dayOfWeek),
      dayOfMonth: parseInt(scheduleOptions.dayOfMonth),
      pattern: scheduleOptions.customPattern
    });
    
    setJobForm(prev => ({ ...prev, schedule_pattern: pattern }));
  };

  const updateSchedulePattern = () => {
    if (jobForm.schedule_type === 'custom') {
      setJobForm(prev => ({ ...prev, schedule_pattern: scheduleOptions.customPattern }));
      return;
    }
    
    const pattern = scheduledJobService.generateCronPattern(jobForm.schedule_type, {
      hour: parseInt(scheduleOptions.hour),
      minute: parseInt(scheduleOptions.minute),
      dayOfWeek: parseInt(scheduleOptions.dayOfWeek),
      dayOfMonth: parseInt(scheduleOptions.dayOfMonth)
    });
    
    setJobForm(prev => ({ ...prev, schedule_pattern: pattern }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial_success': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTemplateData = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return JSON.stringify({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Geplante Jobs</h1>
          <p className="text-gray-600">Verwalte und überwache automatisierte Eintragsgeneration</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer geplanter Job
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-600">Letzte Ausführungen</p>
                <p className="text-2xl font-bold">{statistics.lastExecutions?.length || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="create">Erstellen</TabsTrigger>
          <TabsTrigger value="logs">Ausführungslogs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge variant={job.is_active ? "default" : "outline"}>
                          {job.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                        <Switch
                          checked={job.is_active}
                          onCheckedChange={(enabled) => handleToggleJob(job.id!, enabled)}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Zeitplan: {scheduledJobService.parseCronPattern(job.schedule_pattern)}</span>
                        <span>Tabelle: {job.target_table}</span>
                        {job.last_run_at && (
                          <span>Letzte Ausführung: {new Date(job.last_run_at).toLocaleString()}</span>
                        )}
                        {job.next_run_at && (
                          <span>Nächste Ausführung: {new Date(job.next_run_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecuteJob(job.id!)}
                        disabled={!job.is_active}
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
                        onClick={() => handleDeleteJob(job.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {jobs.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine geplanten Jobs</h3>
                  <p className="text-gray-500 mb-4">Erstelle einen neuen Job, um automatisch Einträge zu generieren.</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    Neuen Job erstellen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Neuen geplanten Job erstellen</CardTitle>
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
                  <label className="text-sm font-medium">Zieltabelle</label>
                  <Select
                    value={jobForm.target_table}
                    onValueChange={(value) => setJobForm({ ...jobForm, target_table: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tabelle auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map(table => (
                        <SelectItem key={table} value={table}>{table}</SelectItem>
                      ))}
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

              <div>
                <label className="text-sm font-medium">Zeitplan-Typ</label>
                <Select
                  value={jobForm.schedule_type}
                  onValueChange={handleScheduleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {jobForm.schedule_type === 'daily' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Stunde</label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={scheduleOptions.hour}
                      onChange={(e) => {
                        setScheduleOptions({ ...scheduleOptions, hour: e.target.value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minute</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={scheduleOptions.minute}
                      onChange={(e) => {
                        setScheduleOptions({ ...scheduleOptions, minute: e.target.value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    />
                  </div>
                </div>
              )}

              {jobForm.schedule_type === 'weekly' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Wochentag</label>
                    <Select
                      value={scheduleOptions.dayOfWeek}
                      onValueChange={(value) => {
                        setScheduleOptions({ ...scheduleOptions, dayOfWeek: value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    >
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
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={scheduleOptions.hour}
                      onChange={(e) => {
                        setScheduleOptions({ ...scheduleOptions, hour: e.target.value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minute</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={scheduleOptions.minute}
                      onChange={(e) => {
                        setScheduleOptions({ ...scheduleOptions, minute: e.target.value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    />
                  </div>
                </div>
              )}

              {jobForm.schedule_type === 'monthly' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tag des Monats</label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={scheduleOptions.dayOfMonth}
                      onChange={(e) => {
                        setScheduleOptions({ ...scheduleOptions, dayOfMonth: e.target.value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stunde</label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={scheduleOptions.hour}
                      onChange={(e) => {
                        setScheduleOptions({ ...scheduleOptions, hour: e.target.value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minute</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={scheduleOptions.minute}
                      onChange={(e) => {
                        setScheduleOptions({ ...scheduleOptions, minute: e.target.value });
                        setTimeout(updateSchedulePattern, 0);
                      }}
                    />
                  </div>
                </div>
              )}

              {jobForm.schedule_type === 'custom' && (
                <div>
                  <label className="text-sm font-medium">Cron-Ausdruck</label>
                  <Input
                    value={scheduleOptions.customPattern}
                    onChange={(e) => {
                      setScheduleOptions({ ...scheduleOptions, customPattern: e.target.value });
                      setJobForm({ ...jobForm, schedule_pattern: e.target.value });
                    }}
                    placeholder="0 9 * * *"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Minute Stunde Tag Monat Wochentag (z.B. 0 9 * * * für täglich um 9 Uhr)
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Vorlagen-Daten (JSON)</label>
                <Textarea
                  value={typeof jobForm.template_data === 'object' 
                    ? formatTemplateData(jobForm.template_data) 
                    : jobForm.template_data as string}
                  onChange={(e) => setJobForm({ ...jobForm, template_data: e.target.value })}
                  placeholder='{"title": "Automatischer Eintrag", "content": "Inhalt..."}'
                  rows={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Definiere die Daten für den zu erstellenden Eintrag im JSON-Format.
                  Verwende "id": "auto" für automatisch generierte IDs.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={jobForm.is_active}
                  onCheckedChange={(checked) => setJobForm({ ...jobForm, is_active: checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Job aktivieren
                </label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Job erstellen
                </Button>
                <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ausführungsprotokolle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {executions.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <div className="font-medium">Job: {jobs.find(j => j.id === execution.job_id)?.name || execution.job_id}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(execution.started_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        Erstellt: {execution.entries_created} | Fehlgeschlagen: {execution.entries_failed}
                      </div>
                      {execution.duration_ms && (
                        <div className="text-xs text-gray-500">{Math.round(execution.duration_ms / 1000)}s</div>
                      )}
                      {execution.error_details && (
                        <div className="text-xs text-red-600 max-w-md truncate" title={execution.error_details}>
                          {execution.error_details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {executions.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Keine Ausführungsprotokolle vorhanden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduledJobManager;