
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, BarChart } from "lucide-react";
import ContentStrategyDashboard from "../ContentStrategyDashboard";

const ContentStrategyView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content-Strategie</h1>
          <p className="text-gray-600">Analysiere und optimiere deine Content-Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Performance-Score</p>
                <p className="text-lg font-semibold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Ziel-Erreichte</p>
                <p className="text-lg font-semibold">12/15</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Trend</p>
                <p className="text-lg font-semibold">+23%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContentStrategyDashboard />
    </div>
  );
};

export default ContentStrategyView;
