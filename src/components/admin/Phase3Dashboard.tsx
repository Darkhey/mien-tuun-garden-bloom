
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Pipeline, Settings, BarChart3, Workflow, Bot } from "lucide-react";
import AutomationDashboard from "./AutomationDashboard";
import ContentPipelineManager from "./ContentPipelineManager";

const Phase3Dashboard: React.FC = () => {
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="flex items-center gap-2">
            <Pipeline className="h-4 w-4" />
            Content Pipelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="mt-6">
          <AutomationDashboard />
        </TabsContent>

        <TabsContent value="pipelines" className="mt-6">
          <ContentPipelineManager />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Automationen</p>
                <p className="text-2xl font-bold">8</p>
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
                <p className="text-2xl font-bold">3</p>
              </div>
              <Pipeline className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heute verarbeitet</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <Workflow className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zeitersparnis</p>
                <p className="text-2xl font-bold">12h</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System-Status & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Automation Engine</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Betriebsbereit</span>
              </div>
              <p className="text-xs text-gray-600">Letzte Überprüfung: vor 2 Min</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Content Pipeline</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Aktiv (3 Pipelines)</span>
              </div>
              <p className="text-xs text-gray-600">Durchsatz: 24 Items/Std</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Quality Control</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Optimal</span>
              </div>
              <p className="text-xs text-gray-600">Ø Quality Score: 89</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase3Dashboard;
