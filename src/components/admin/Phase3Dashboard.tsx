
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Workflow, Settings, BarChart3, Bot, Clock } from "lucide-react";
import { pipelineService, PipelineStats } from "@/services/PipelineService";
import { cronJobService } from "@/services/CronJobService";
import { automationService } from "@/services/AutomationService";
import AutomationDashboard from "./AutomationDashboard";
import ContentPipelineManager from "./ContentPipelineManager";
import CronJobManager from "./CronJobManager";

const Phase3Dashboard: React.FC = () => {
  const [stats, setStats] = useState<PipelineStats>({
    totalPipelines: 0,
    activePipelines: 0,
    totalExecutions: 0,
    successRate: 0,
    avgThroughput: 0,
    totalTimeSaved: 0
  });
  const [cronStats, setCronStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [pipelineStats, cronJobStats, automationStats] = await Promise.all([
        pipelineService.getStats(),
        cronJobService.getJobStats(),
        Promise.resolve(automationService.getAutomationStats())
      ]);

      setStats(pipelineStats);
      setCronStats(cronJobStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Automation & Workflows Hub</h1>
            <p className="text-gray-600">Lade Dashboard-Daten...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Automation & Workflows Hub</h1>
          <p className="text-gray-600">Phase 3: Vollautomatisierte Content-Pipeline & Workflow-Management</p>
        </div>
      </div>

      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Content Pipelines
          </TabsTrigger>
          <TabsTrigger value="cronjobs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Cron-Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="mt-6">
          <AutomationDashboard />
        </TabsContent>

        <TabsContent value="pipelines" className="mt-6">
          <ContentPipelineManager />
        </TabsContent>

        <TabsContent value="cronjobs" className="mt-6">
          <CronJobManager />
        </TabsContent>
      </Tabs>

      {/* Quick Stats with Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Automationen</p>
                <p className="text-2xl font-bold">{stats.activePipelines}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Laufende Pipelines</p>
                <p className="text-2xl font-bold">{stats.activePipelines}</p>
              </div>
              <Workflow className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Cron-Jobs</p>
                <p className="text-2xl font-bold">{cronStats.activeJobs || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zeitersparnis</p>
                <p className="text-2xl font-bold">{stats.totalTimeSaved}h</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status with Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>System-Status & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Automation Engine</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Betriebsbereit</span>
              </div>
              <p className="text-xs text-gray-600">Pipelines: {stats.totalPipelines}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Content Pipeline</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats.activePipelines > 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm">
                  {stats.activePipelines > 0 ? `Aktiv (${stats.activePipelines} Pipelines)` : 'Inaktiv'}
                </span>
              </div>
              <p className="text-xs text-gray-600">Durchsatz: {stats.avgThroughput} Items/Std</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Cron-Job Scheduler</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${cronStats.activeJobs > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm">
                  {cronStats.activeJobs > 0 ? `Online (${cronStats.activeJobs} Jobs)` : 'Inaktiv'}
                </span>
              </div>
              <p className="text-xs text-gray-600">Gesamt Jobs: {cronStats.totalJobs || 0}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Quality Control</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats.successRate >= 90 ? 'bg-green-500' : stats.successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">
                  {stats.successRate >= 90 ? 'Optimal' : stats.successRate >= 70 ? 'Gut' : 'Verbesserungsbedarf'}
                </span>
              </div>
              <p className="text-xs text-gray-600">Ø Quality Score: {stats.successRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase3Dashboard;
