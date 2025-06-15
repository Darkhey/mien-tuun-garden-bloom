
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Target, User, Zap } from "lucide-react";
import ContentStrategyDashboard from "./ContentStrategyDashboard";
import PersonalizedContentGenerator from "./PersonalizedContentGenerator";
import SmartPromptOptimizer from "./SmartPromptOptimizer";

const Phase2Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Content Intelligence Hub</h1>
          <p className="text-gray-600">Phase 2: Intelligence & Context - KI-gesteuerte Content-Strategien</p>
        </div>
      </div>

      <Tabs defaultValue="strategy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Content-Strategie
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personalisierung
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Prompt-Optimizer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="mt-6">
          <ContentStrategyDashboard />
        </TabsContent>

        <TabsContent value="personalized" className="mt-6">
          <PersonalizedContentGenerator />
        </TabsContent>

        <TabsContent value="optimizer" className="mt-6">
          <SmartPromptOptimizer />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Trends</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Content-Gaps</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Optimierte Prompts</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Personalisierte Inhalte</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase2Dashboard;
