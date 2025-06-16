
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, XCircle, Clock, Database, Zap, FileText, Settings } from "lucide-react";
import { blogTestingService, BlogTestResult } from "@/services/BlogTestingService";
import { useToast } from "@/hooks/use-toast";

interface BlogSystemTestDashboardProps {
  testSlug?: string;
}

const BlogSystemTestDashboard: React.FC<BlogSystemTestDashboardProps> = ({ testSlug }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<BlogTestResult[]>([]);
  const [testSummary, setTestSummary] = useState<{ total: number; passed: number; failed: number } | null>(null);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setTestSummary(null);

    try {
      console.log("[TestDashboard] Starte Blog-System-Tests...");

      const results = testSlug
        ? [await blogTestingService.runTestBySlug(testSlug)]
        : await blogTestingService.runFullBlogSystemTest();
      setTestResults(results);
      
      const summary = blogTestingService.getTestSummary();
      setTestSummary(summary);
      
      toast({
        title: "Tests abgeschlossen",
        description: `${summary.passed}/${summary.total} Tests erfolgreich`,
        variant: summary.failed === 0 ? "default" : "destructive",
      });
      
      console.log("[TestDashboard] Tests abgeschlossen:", summary);
    } catch (error: any) {
      console.error("[TestDashboard] Test-Fehler:", error);
      toast({
        title: "Test-Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsRunning(false);
  };

  const getTestIcon = (testName: string) => {
    switch (testName) {
      case "Supabase Connection": return <Database className="h-4 w-4" />;
      case "Blog Posts Table": return <FileText className="h-4 w-4" />;
      case "Content Generation": return <Zap className="h-4 w-4" />;
      case "Blog Post Creation": return <Settings className="h-4 w-4" />;
      case "Edge Functions": return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Blog-System-Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? "Tests laufen..." : "Alle Tests starten"}
            </Button>
            
            {testSummary && (
              <div className="flex items-center gap-4">
                <Badge variant={testSummary.failed === 0 ? "default" : "destructive"}>
                  {testSummary.passed}/{testSummary.total} erfolgreich
                </Badge>
                <Progress 
                  value={(testSummary.passed / testSummary.total) * 100} 
                  className="w-32"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="grid gap-4">
          {testResults.map((result, index) => (
            <Card key={index} className={`border-l-4 ${
              result.success ? "border-l-green-500" : "border-l-red-500"
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    {getTestIcon(result.testName)}
                    {result.testName}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {result.timing && (
                      <Badge variant="outline" className="text-xs">
                        {result.timing}ms
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <strong>Fehler:</strong> {result.error}
                  </div>
                )}
                
                <div className="text-sm">
                  <strong>Details:</strong>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogSystemTestDashboard;
