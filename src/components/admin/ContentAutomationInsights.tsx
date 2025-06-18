import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  Calendar, 
  Users, 
  MessageSquare,
  ThumbsUp,
  Eye
} from "lucide-react";

interface ContentAutomationInsightsProps {
  insights: {
    topPerformingContent: {
      title: string;
      views: number;
      engagement: number;
      category: string;
    }[];
    contentGaps: {
      category: string;
      lastContent: string;
      priority: 'high' | 'medium' | 'low';
    }[];
    upcomingContent: {
      title: string;
      scheduledFor: string;
      category: string;
    }[];
    audienceInsights: {
      segment: string;
      engagement: number;
      contentPreference: string;
    }[];
  };
  className?: string;
}

const ContentAutomationInsights: React.FC<ContentAutomationInsightsProps> = ({ insights, className }) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Content-Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Performing Content */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Top-performender Content
            </h3>
            <div className="space-y-2">
              {insights.topPerformingContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{content.title}</div>
                    <div className="text-xs text-gray-500">{content.category}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Eye className="h-3 w-3 text-blue-500" />
                      <span>{content.views}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3 text-green-500" />
                      <span>{content.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Content Gaps */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Content-Lücken
            </h3>
            <div className="space-y-2">
              {insights.contentGaps.map((gap, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{gap.category}</div>
                    <div className="text-xs text-gray-500">Letzter Inhalt: {gap.lastContent}</div>
                  </div>
                  <Badge variant={
                    gap.priority === 'high' ? 'destructive' : 
                    gap.priority === 'medium' ? 'secondary' : 
                    'outline'
                  }>
                    {gap.priority === 'high' ? 'Hoch' : 
                     gap.priority === 'medium' ? 'Mittel' : 
                     'Niedrig'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Content */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Geplante Inhalte
            </h3>
            <div className="space-y-2">
              {insights.upcomingContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{content.title}</div>
                    <div className="text-xs text-gray-500">{content.category}</div>
                  </div>
                  <Badge variant="outline">
                    {content.scheduledFor}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          {/* Audience Insights */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Zielgruppen-Insights
            </h3>
            <div className="space-y-2">
              {insights.audienceInsights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{insight.segment}</div>
                    <div className="text-xs text-gray-500">Bevorzugt: {insight.contentPreference}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs">{insight.engagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 text-purple-800">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">
                Tipp: Nutze diese Insights, um deine Content-Strategie zu optimieren und gezielt Inhalte für deine engagiertesten Zielgruppen zu erstellen.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAutomationInsights;