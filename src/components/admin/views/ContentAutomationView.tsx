import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Settings, FileText, Calendar, Image, CheckSquare, BarChart } from "lucide-react";
import ContentAutomationWizard from "../ContentAutomationWizard";
import ContentAutomationDashboard from "../ContentAutomationDashboard";

const ContentAutomationView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Zap className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content-Automatisierung</h1>
          <p className="text-gray-600">Konfiguriere die automatische Erstellung von Inhalten</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Themenauswahl</p>
                <p className="text-lg font-semibold">Kategorie & Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Zeitplanung</p>
                <p className="text-lg font-semibold">Intervalle & Timing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Konfiguration</p>
                <p className="text-lg font-semibold">Umfassende Einstellungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Einrichtungsassistent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <ContentAutomationDashboard />
        </TabsContent>

        <TabsContent value="wizard" className="mt-6">
          <ContentAutomationWizard onComplete={() => {}} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentAutomationView;