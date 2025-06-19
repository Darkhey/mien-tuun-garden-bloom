
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Trash2, Plus } from "lucide-react";
import { scheduledJobService, JobConfig, JobExecution } from "@/services/ScheduledJobService";
import { useToast } from "@/hooks/use-toast";

const SimpleScheduledJobManager: React.FC = () => {
  const [jobs, setJobs] = useState<JobConfig[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, executionsData] = await Promise.all([
        scheduledJobService.getJobConfigs(),
        scheduledJobService.getJobExecutions()
      ]);

      setJobs(jobsData);
      setExecutions(executionsData);
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
        description: "Job konnte nicht ausgeführt werden",
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
        description: "Job konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Geplante Jobs</h1>
          <p className="text-gray-600">Übersicht der automatisierten Aufgaben</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Job
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
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
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Zeitplan: {scheduledJobService.parseCronPattern(job.cron_expression)}</span>
                    <span>Funktion: {job.function_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
            </CardContent>
          </Card>
        ))}

        {jobs.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine geplanten Jobs</h3>
              <p className="text-gray-500 mb-4">Erstelle einen neuen Job, um automatisch Einträge zu generieren.</p>
              <Button>
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
