
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap,
  BarChart3,
  Calendar,
  Workflow
} from "lucide-react";
import { automationService, AutomationRule, WorkflowTemplate, WorkflowExecution } from "@/services/AutomationService";

const AutomationDashboard: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAutomationData();
    automationService.initializeDefaults();
  }, []);

  const loadAutomationData = () => {
    setRules(automationService.getAutomationRules());
    setWorkflows(automationService.getWorkflowTemplates());
    setExecutions(automationService.getWorkflowExecutions());
    setStats(automationService.getAutomationStats());
  };

  const handleToggleRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      setRules([...rules]);
    }
  };

  const handleExecuteWorkflow = async (templateId: string) => {
    setLoading(true);
    try {
      const executionId = await automationService.executeWorkflow(templateId);
      console.log("Workflow gestartet:", executionId);
      
      // Refresh data after a short delay
      setTimeout(() => {
        loadAutomationData();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Workflow-Ausführung fehlgeschlagen:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Automation & Workflows</h1>
          <p className="text-gray-600">Phase 3: Vollautomatisierte Content-Pipeline</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Regeln</p>
                <p className="text-2xl font-bold">{stats.activeRules || 0}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageSuccessRate || 0)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heute ausgeführt</p>
                <p className="text-2xl font-bold">{stats.recentExecutions || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt-Ausführungen</p>
                <p className="text-2xl font-bold">{stats.totalExecutions || 0}</p>
              </div>
              <Workflow className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Templates</TabsTrigger>
          <TabsTrigger value="executions">Ausführungen</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Aktiv" : "Inaktiv"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleRule(rule.id)}
                        >
                          {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Trigger: {rule.trigger.type} | Aktionen: {rule.actions.length}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span>Ausführungen: {rule.runCount}</span>
                      <span>Erfolgsrate: {Math.round(rule.successRate)}%</span>
                      {rule.lastRun && (
                        <span>Letzte Ausführung: {rule.lastRun.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <Progress value={rule.successRate} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                      <Button
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Ausführen
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Badge variant="outline">{workflow.category}</Badge>
                      <Badge variant="outline">{workflow.complexity}</Badge>
                      <span>{workflow.steps.length} Schritte</span>
                      <span>~{Math.round(workflow.estimatedDuration / 60000)} Min</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow-Ausführungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => (
                  <div key={execution.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(execution.status)}`} />
                        <span className="font-medium">Execution {execution.id.slice(-8)}</span>
                        {getStatusIcon(execution.status)}
                      </div>
                      <Badge variant="outline">{execution.status}</Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Template: {workflows.find(w => w.id === execution.templateId)?.name || execution.templateId}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Aktueller Schritt: {execution.currentStep}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span>Gestartet: {execution.startTime.toLocaleString()}</span>
                      {execution.endTime && (
                        <span>Beendet: {execution.endTime.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {execution.logs.length > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium mb-1">Logs:</div>
                        {execution.logs.slice(-3).map((log, idx) => (
                          <div key={idx} className="text-gray-600">{log}</div>
                        ))}
                      </div>
                    )}
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

export default AutomationDashboard;
