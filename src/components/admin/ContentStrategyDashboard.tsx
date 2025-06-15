
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Target, Clock, Lightbulb, AlertTriangle } from "lucide-react";
import { contentStrategyService, ContentStrategy, ContentCalendarEntry } from "@/services/ContentStrategyService";
import { contextAnalyzer, TrendData, ContentGap } from "@/services/ContextAnalyzer";

const ContentStrategyDashboard: React.FC = () => {
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [calendar, setCalendar] = useState<ContentCalendarEntry[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStrategicData = async () => {
    setLoading(true);
    try {
      console.log("[StrategyDashboard] Loading strategic data");
      
      // Parallel laden für bessere Performance
      const [strategiesData, trendsData, gapsData] = await Promise.all([
        contentStrategyService.generateContentStrategy({ timeframe: 4 }),
        Promise.resolve(contextAnalyzer.getCurrentTrends()),
        Promise.resolve(contextAnalyzer.analyzeContentGaps())
      ]);

      setStrategies(strategiesData);
      setTrends(trendsData.slice(0, 6));
      setGaps(gapsData);

      // Content-Kalender generieren
      const calendarData = await contentStrategyService.generateContentCalendar(strategiesData, 2);
      setCalendar(calendarData.slice(0, 10));
      
      console.log("[StrategyDashboard] Data loaded successfully");
    } catch (error) {
      console.error("[StrategyDashboard] Error loading data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStrategicData();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      'critical': 'destructive' as const,
      'high': 'destructive' as const,
      'medium': 'secondary' as const,
      'low': 'default' as const
    };
    return colors[urgency as keyof typeof colors] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Strategy Dashboard</h2>
          <p className="text-gray-600">KI-gesteuerte Content-Planung und Trend-Analyse</p>
        </div>
        <Button onClick={loadStrategicData} disabled={loading}>
          {loading ? "Analysiere..." : "Daten aktualisieren"}
        </Button>
      </div>

      {/* Trend-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aktuelle Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((trend, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{trend.keyword}</span>
                  <Badge variant="outline">{Math.round(trend.relevance * 100)}%</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {trend.category} • {trend.season}
                </div>
                <Progress value={trend.relevance * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content-Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Content-Lücken
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gaps.map((gap, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{gap.topic}</div>
                  <div className="text-sm text-gray-600">{gap.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getUrgencyColor(gap.urgency > 0.8 ? 'high' : 'medium')}`} />
                  <span className="text-sm">{Math.round(gap.urgency * 100)}% Priorität</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content-Strategien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Empfohlene Content-Strategien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.slice(0, 5).map((strategy, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-lg">{strategy.category}</div>
                    <div className="text-sm text-gray-600">{strategy.reasoning}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getUrgencyBadge(strategy.urgency)}>
                      {strategy.urgency}
                    </Badge>
                    <span className="text-sm font-medium">
                      {Math.round(strategy.priority)} Punkte
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Vorgeschlagene Themen:</div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.suggestedTopics.map((topic, topicIdx) => (
                      <Badge key={topicIdx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Progress value={strategy.priority} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content-Kalender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Content-Kalender (Nächste 2 Wochen)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calendar.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {entry.date.toLocaleDateString('de-DE', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                  </div>
                  <div>
                    <div className="font-medium">{entry.title}</div>
                    <div className="text-sm text-gray-600">{entry.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {entry.tags.slice(0, 2).map((tag, tagIdx) => (
                      <Badge key={tagIdx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    ~{entry.estimatedEngagement} Engagement
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Schnellaktionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-medium mb-1">Top-Trend Content</div>
              <div className="text-sm text-gray-600">
                Artikel zu #{trends[0]?.keyword} erstellen
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-medium mb-1">Gap-Content</div>
              <div className="text-sm text-gray-600">
                Fehlende Inhalte ergänzen
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-medium mb-1">Saisonaler Content</div>
              <div className="text-sm text-gray-600">
                Passende Inhalte für aktuelle Saison
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentStrategyDashboard;
