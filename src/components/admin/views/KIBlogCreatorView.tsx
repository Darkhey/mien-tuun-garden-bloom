
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, PenTool, Sparkles } from "lucide-react";
import KIBlogCreator from "../KIBlogCreator";
import { adminStatsService } from "@/services/AdminStatsService";

const KIBlogCreatorView: React.FC = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const [count, score] = await Promise.all([
        adminStatsService.getTodayBlogPostCount(),
        adminStatsService.getAverageBlogQualityScore()
      ]);
      setTodayCount(count);
      setAvgScore(score);
      setLoading(false);
    };

    loadStats();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <PenTool className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KI-Blog-Creator</h1>
          <p className="text-gray-600">Erstelle automatisch neue Blog-Artikel mit KI-Unterstützung</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Erstellt heute</p>
                <p className="text-lg font-semibold">
                  {loading ? '...' : `${todayCount} Artikel`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">SEO-Score</p>
                <p className="text-lg font-semibold">
                  {loading ? '...' : `${Math.round(avgScore)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">KI-Modell</p>
                <p className="text-lg font-semibold">GPT-4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <KIBlogCreator />
    </div>
  );
};

export default KIBlogCreatorView;
