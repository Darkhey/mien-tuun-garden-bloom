
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download,
  RefreshCw,
  TrendingUp,
  Zap,
  Database,
  Brain,
  Server,
  AlertCircle
} from "lucide-react";
import { systemPerformanceAnalyzer } from "@/services/SystemPerformanceAnalyzer";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticReport {
  summary: any;
  systemHealth: any;
  issues: any[];
  recommendations: any[];
  metrics: any;
}

const SystemDiagnosticsDashboard: React.FC = () => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const runFullAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      console.log("[Diagnostics] Starting full system analysis...");
      const diagnosticReport = await systemPerformanceAnalyzer.generateDiagnosticReport();
      setReport(diagnosticReport);
      setLastUpdate(new Date());
      
      toast({
        title: "Analyse abgeschlossen",
        description: `${diagnosticReport.issues.length} Issues identifiziert, ${diagnosticReport.recommendations.length} Empfehlungen erstellt`,
        variant: diagnosticReport.summary.criticalIssues > 0 ? "destructive" : "default"
      });
    } catch (error: any) {
      console.error("[Diagnostics] Analysis failed:", error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsAnalyzing(false);
  };

  const exportReport = async (format: 'json' | 'markdown') => {
    try {
      const reportData = await systemPerformanceAnalyzer.exportReport(format);
      const blob = new Blob([reportData], { 
        type: format === 'json' ? 'application/json' : 'text/markdown' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-diagnostic-report-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report exportiert",
        description: `Diagnostic Report als ${format.toUpperCase()} heruntergeladen`
      });
    } catch (error: any) {
      toast({
        title: "Export fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'destructive';
      case 'short-term': return 'destructive';
      case 'medium-term': return 'secondary';
      case 'long-term': return 'outline';
      default: return 'outline';
    }
  };

  useEffect(() => {
    // Initiale Analyse beim Laden
    runFullAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Diagnostics</h1>
            <p className="text-gray-600">Umfassende KI-System-Performance-Analyse</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runFullAnalysis} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analysiere...' : 'Analyse starten'}
          </Button>
          {report && (
            <>
              <Button 
                variant="outline" 
                onClick={() => exportReport('markdown')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Markdown
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportReport('json')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                JSON
              </Button>
            </>
          )}
        </div>
      </div>

      {lastUpdate && (
        <div className="text-sm text-gray-500">
          Letzte Aktualisierung: {lastUpdate.toLocaleString('de-DE')}
        </div>
      )}

      {report && (
        <>
          {/* System Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.summary.systemStatus)}
                  <div>
                    <p className="text-sm text-gray-600">System Status</p>
                    <p className="text-lg font-semibold capitalize">{report.summary.systemStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ø Response Time</p>
                    <p className="text-lg font-semibold">{report.summary.averageResponseTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-lg font-semibold">{report.summary.errorRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Quality Score</p>
                    <p className="text-lg font-semibold">{report.summary.qualityScore}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="recommendations">Empfehlungen</TabsTrigger>
              <TabsTrigger value="metrics">Metriken</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Kritische Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.summary.criticalIssues === 0 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Keine kritischen Issues gefunden</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span>{report.summary.criticalIssues} kritische Issues identifiziert</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sofortmaßnahmen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.summary.immediateActions === 0 ? (
                      <div className="text-gray-600">Keine Sofortmaßnahmen erforderlich</div>
                    ) : (
                      <div className="text-red-600 font-medium">
                        {report.summary.immediateActions} Sofortmaßnahmen erforderlich
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <div className="grid gap-4">
                {report.systemHealth.components.map((component: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {component.component === 'Database' && <Database className="h-5 w-5" />}
                          {component.component === 'Edge Functions' && <Server className="h-5 w-5" />}
                          {component.component === 'AI Services' && <Brain className="h-5 w-5" />}
                          {component.component === 'Storage' && <Zap className="h-5 w-5" />}
                          <div>
                            <h3 className="font-medium">{component.component}</h3>
                            <p className="text-sm text-gray-600">{component.details}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {component.responseTime && (
                            <span className="text-sm text-gray-500">{component.responseTime}ms</span>
                          )}
                          {getStatusIcon(component.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {report.issues.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Issues gefunden</h3>
                    <p className="text-gray-600">Das System läuft ohne erkennbare Probleme.</p>
                  </CardContent>
                </Card>
              ) : (
                report.issues.map((issue: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{issue.description}</CardTitle>
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Kategorie:</strong> {issue.category}</p>
                        <p><strong>Impact:</strong> {issue.impact}</p>
                        <p><strong>Häufigkeit:</strong> {issue.frequency}</p>
                        <p><strong>Letztes Auftreten:</strong> {new Date(issue.lastSeen).toLocaleString('de-DE')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {report.recommendations.map((recommendation: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <Badge variant={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-700">{recommendation.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Kategorie:</strong> {recommendation.category}
                        </div>
                        <div>
                          <strong>Geschätzter Aufwand:</strong> {recommendation.estimatedEffort}
                        </div>
                        <div>
                          <strong>Erwarteter Impact:</strong> {recommendation.expectedImpact}
                        </div>
                        <div>
                          <strong>Abhängigkeiten:</strong> {recommendation.dependencies.join(', ') || 'Keine'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metriken</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Response Time</span>
                        <span>{report.metrics.averageResponseTime}ms</span>
                      </div>
                      <Progress value={Math.min(100, (report.metrics.averageResponseTime / 5000) * 100)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Error Rate</span>
                        <span>{report.metrics.errorRate}%</span>
                      </div>
                      <Progress value={report.metrics.errorRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Quality Score</span>
                        <span>{report.metrics.averageQualityScore}/100</span>
                      </div>
                      <Progress value={report.metrics.averageQualityScore} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Load</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">Normal</div>
                      <div className="text-sm text-gray-600">System läuft im normalen Bereich</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Performance verbessert sich</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!report && !isAnalyzing && (
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Analyse verfügbar</h3>
            <p className="text-gray-600 mb-4">Starten Sie eine System-Analyse, um detaillierte Informationen zu erhalten.</p>
            <Button onClick={runFullAnalysis}>
              Analyse starten
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemDiagnosticsDashboard;
