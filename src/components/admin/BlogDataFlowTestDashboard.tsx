
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  Database,
  FileText,
  Clock
} from "lucide-react";
import { blogDataFlowTester } from "@/services/BlogDataFlowTester";
import { useToast } from "@/hooks/use-toast";

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  successRate: number;
}

interface TestResult {
  testName: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details?: string;
  timestamp: Date;
}

const BlogDataFlowTestDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [report, setReport] = useState<string>("");
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const { toast } = useToast();

  const runCompleteTest = async () => {
    setIsRunning(true);
    try {
      console.log("[BlogDataFlowTest] Starting complete test suite...");
      
      const testResults = await blogDataFlowTester.runCompleteDataFlowTest();
      
      setSummary(testResults.summary);
      setResults(testResults.results);
      setReport(testResults.report);
      setLastRun(new Date());
      
      toast({
        title: "Test abgeschlossen",
        description: `${testResults.summary.totalTests} Tests durchgeführt. Erfolgsrate: ${testResults.summary.successRate}%`,
        variant: testResults.summary.failed > 0 ? "destructive" : "default"
      });
      
    } catch (error: any) {
      console.error("[BlogDataFlowTest] Test suite failed:", error);
      toast({
        title: "Test fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsRunning(false);
  };

  const exportReport = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-dataflow-test-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report exportiert",
      description: "Test-Report als Markdown-Datei heruntergeladen"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAIL': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PASS': return 'default';
      case 'FAIL': return 'destructive';
      case 'WARNING': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TestTube className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Datenfluss Tests</h1>
            <p className="text-gray-600">Vollständige Überprüfung der Blog-Artikel-Verwaltung</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runCompleteTest} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Tests laufen...' : 'Tests starten'}
          </Button>
          {report && (
            <Button 
              variant="outline" 
              onClick={exportReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Report exportieren
            </Button>
          )}
        </div>
      </div>

      {lastRun && (
        <div className="text-sm text-gray-500">
          Letzte Ausführung: {lastRun.toLocaleString('de-DE')}
        </div>
      )}

      {summary && (
        <>
          {/* Test Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Gesamte Tests</p>
                    <p className="text-2xl font-bold">{summary.totalTests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Erfolgreich</p>
                    <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Fehlgeschlagen</p>
                    <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Erfolgsrate</p>
                    <p className="text-2xl font-bold">{summary.successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Rate Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Test-Erfolgsrate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Erfolgsrate</span>
                  <span>{summary.successRate}%</span>
                </div>
                <Progress value={summary.successRate} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{summary.passed} erfolgreich</span>
                  <span>{summary.failed} fehlgeschlagen</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="failed">Fehler</TabsTrigger>
              <TabsTrigger value="warnings">Warnungen</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Datenbank-Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Artikel-Erstellung</span>
                        {getStatusIcon(results.find(r => r.testName === 'Artikel-Erstellung')?.status || 'WARNING')}
                      </div>
                      <div className="flex justify-between">
                        <span>Metadaten-Validierung</span>
                        {getStatusIcon(results.find(r => r.testName.includes('Metadaten'))?.status || 'WARNING')}
                      </div>
                      <div className="flex justify-between">
                        <span>Status-Änderungen</span>
                        {getStatusIcon(results.find(r => r.testName.includes('Status-Änderung'))?.status || 'WARNING')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Frontend-Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Dashboard-Sichtbarkeit</span>
                        {getStatusIcon(results.find(r => r.testName === 'Dashboard-Sichtbarkeit')?.status || 'WARNING')}
                      </div>
                      <div className="flex justify-between">
                        <span>Artikel-Bearbeitung</span>
                        {getStatusIcon(results.find(r => r.testName === 'Artikel-Bearbeitung')?.status || 'WARNING')}
                      </div>
                      <div className="flex justify-between">
                        <span>Artikel-Löschung</span>
                        {getStatusIcon(results.find(r => r.testName === 'Artikel-Löschung')?.status || 'WARNING')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              {results.filter(r => r.status === 'FAIL').length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Fehler gefunden</h3>
                    <p className="text-gray-600">Alle Tests wurden erfolgreich durchgeführt.</p>
                  </CardContent>
                </Card>
              ) : (
                results.filter(r => r.status === 'FAIL').map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{result.testName}</CardTitle>
                        <Badge variant="destructive">FEHLER</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Erwartet:</strong> {result.expected}</p>
                        <p><strong>Tatsächlich:</strong> {result.actual}</p>
                        {result.details && (
                          <p><strong>Details:</strong> {result.details}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          <strong>Zeit:</strong> {result.timestamp.toLocaleString('de-DE')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="warnings" className="space-y-4">
              {results.filter(r => r.status === 'WARNING').length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Warnungen</h3>
                    <p className="text-gray-600">Alle Tests liefen ohne Warnungen.</p>
                  </CardContent>
                </Card>
              ) : (
                results.filter(r => r.status === 'WARNING').map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{result.testName}</CardTitle>
                        <Badge variant="secondary">WARNUNG</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Erwartet:</strong> {result.expected}</p>
                        <p><strong>Tatsächlich:</strong> {result.actual}</p>
                        {result.details && (
                          <p><strong>Details:</strong> {result.details}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          <strong>Zeit:</strong> {result.timestamp.toLocaleString('de-DE')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="font-medium">{result.testName}</h4>
                            <p className="text-sm text-gray-600">{result.actual}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {result.timestamp.toLocaleTimeString('de-DE')}
                          </span>
                          <Badge variant={getStatusBadgeVariant(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!summary && !isRunning && (
        <Card>
          <CardContent className="p-6 text-center">
            <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Tests durchgeführt</h3>
            <p className="text-gray-600 mb-4">Starten Sie eine Datenfluss-Analyse, um die Blog-Artikel-Verwaltung zu testen.</p>
            <Button onClick={runCompleteTest}>
              Tests starten
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogDataFlowTestDashboard;
