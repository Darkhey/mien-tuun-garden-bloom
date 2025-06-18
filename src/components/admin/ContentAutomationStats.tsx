import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  ThumbsUp
} from "lucide-react";
import { ContentAutomationStats as StatsType } from "@/services/ContentAutomationService";

interface ContentAutomationStatsProps {
  stats: StatsType;
  className?: string;
}

const ContentAutomationStats: React.FC<ContentAutomationStatsProps> = ({ stats, className }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Sehr gut";
    if (score >= 60) return "Gut";
    return "Verbesserungswürdig";
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Content-Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Motivational Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-800">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="font-medium">
                {stats.total_content_created === 0 
                  ? "Starte jetzt mit deiner ersten automatisierten Content-Erstellung!" 
                  : `Bereits ${stats.total_content_created} Inhalte automatisch erstellt!`}
              </span>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Erfolgsrate</span>
                <span className={`text-sm font-medium ${stats.success_rate >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {stats.success_rate}%
                </span>
              </div>
              <Progress value={stats.success_rate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Qualitätsscore</span>
                <span className={`text-sm font-medium ${getQualityColor(stats.avg_quality_score)}`}>
                  {stats.avg_quality_score}/100
                </span>
              </div>
              <Progress value={stats.avg_quality_score} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement</span>
                <span className={`text-sm font-medium ${stats.engagement_rate >= 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {stats.engagement_rate}%
                </span>
              </div>
              <Progress value={stats.engagement_rate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Top-Kategorie</span>
                <Badge variant="outline">
                  {stats.top_performing_category || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Quality Assessment */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Qualitätsbewertung</h3>
              <Badge variant="outline" className={getQualityColor(stats.avg_quality_score)}>
                {getQualityLabel(stats.avg_quality_score)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {stats.avg_quality_score >= 80 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : stats.avg_quality_score >= 60 ? (
                <ThumbsUp className="h-4 w-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              
              <span className="text-gray-600">
                {stats.avg_quality_score >= 80 
                  ? "Dein Content erreicht eine hervorragende Qualität!" 
                  : stats.avg_quality_score >= 60 
                  ? "Dein Content hat eine gute Qualität mit Verbesserungspotential." 
                  : "Die Content-Qualität sollte verbessert werden."}
              </span>
            </div>
          </div>
          
          {/* Content by Category */}
          {Object.keys(stats.content_by_category).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Inhalte nach Kategorie</h3>
              <div className="space-y-2">
                {Object.entries(stats.content_by_category).map(([category, count]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{category}</span>
                      <span>{count}</span>
                    </div>
                    <Progress 
                      value={(count as number) / Math.max(...Object.values(stats.content_by_category) as number[]) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-right">
            Letzte Aktualisierung: {formatDate(stats.last_updated)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAutomationStats;