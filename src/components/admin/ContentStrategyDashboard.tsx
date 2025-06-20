import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Target, Clock, Lightbulb, AlertTriangle, Search, Loader2 } from "lucide-react";
import { contentStrategyService, ContentStrategy, ContentCalendarEntry } from "@/services/ContentStrategyService";
import { contextAnalyzer, ContentGap } from "@/services/ContextAnalyzer";
import { blogAnalyticsService, TrendKeyword } from "@/services/BlogAnalyticsService";
import { contentInsightsService, CategoryStat, ContentSuggestion, ScheduledPost } from "@/services/ContentInsightsService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContentStrategyDashboard: React.FC = () => {
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [calendar, setCalendar] = useState<ContentCalendarEntry[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [trends, setTrends] = useState<TrendKeyword[]>([]);
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [keywordGaps, setKeywordGaps] = useState<TrendKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingArticle, setCreatingArticle] = useState<string | null>(null);
  const { toast } = useToast();

  const loadStrategicData = async () => {
    setLoading(true);
    try {
      console.log("[StrategyDashboard] Loading strategic data");
      
      const [strategiesData, posts, trendsData, gapsData, insights] = await Promise.all([
        contentStrategyService.generateContentStrategy({ timeframe: 4 }),
        blogAnalyticsService.fetchBlogPosts(),
        blogAnalyticsService.fetchCurrentTrends(),
        Promise.resolve(contextAnalyzer.analyzeContentGaps()),
        contentInsightsService.fetchInsights()
      ]);

      const existing = blogAnalyticsService.extractKeywords(posts);
      const kwGaps = blogAnalyticsService.findKeywordGaps(trendsData, existing);

      setStrategies(strategiesData);
      setTrends(trendsData.slice(0, 6));
      setGaps(gapsData);
      setKeywordGaps(kwGaps);
      setCategoryStats(insights.categoryStats);
      setSuggestions(insights.suggestions.slice(0, 5));
      setScheduled(insights.scheduled.slice(0, 5));

      const calendarData = await contentStrategyService.generateContentCalendar(strategiesData, 2);
      setCalendar(calendarData.slice(0, 10));
      
      console.log("[StrategyDashboard] Data loaded successfully");
    } catch (error) {
      console.error("[StrategyDashboard] Error loading data:", error);
    }
    setLoading(false);
  };

  const handleCreateArticle = async (topic: string, category: string, season?: string, urgency?: string) => {
    setCreatingArticle(topic);
    
    try {
      console.log(`[StrategyDashboard] Erstelle Artikel für: ${topic}`);
      
      const { data, error } = await supabase.functions.invoke('create-strategy-article', {
        body: { topic, category, season, urgency }
      });

      if (error) throw error;

      toast({
        title: "Artikel erstellt! 🎉",
        description: `"${topic}" wurde erfolgreich veröffentlicht`,
      });

      // Daten neu laden
      await loadStrategicData();
      
    } catch (error: any) {
      console.error("[StrategyDashboard] Fehler beim Erstellen:", error);
      toast({
        title: "Fehler",
        description: error.message || "Artikel konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setCreatingArticle(null);
    }
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
              <div key={idx} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={() => handleCreateArticle(trend.keyword, trend.category)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{trend.keyword}</span>
                  <Badge variant="outline">{Math.round(trend.relevance * 100)}%</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {trend.category}
                </div>
                <Progress value={trend.relevance * 100} className="h-2" />
                {creatingArticle === trend.keyword && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Erstelle Artikel...
                  </div>
                )}
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
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={() => handleCreateArticle(gap.topic, 'garten', undefined, gap.urgency > 0.8 ? 'high' : 'medium')}>
                <div>
                  <div className="font-medium">{gap.topic}</div>
                  <div className="text-sm text-gray-600">{gap.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getUrgencyColor(gap.urgency > 0.8 ? 'high' : 'medium')}`} />
                  <span className="text-sm">{Math.round(gap.urgency * 100)}% Priorität</span>
                </div>
                {creatingArticle === gap.topic && (
                  <div className="flex items-center gap-2 ml-2 text-sm text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Erstelle...
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyword Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Keyword-Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keywordGaps.map((gap, idx) => (
              <div key={idx} className="p-3 border rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={() => handleCreateArticle(gap.keyword, gap.category)}>
                <div>
                  <div className="font-medium">{gap.keyword}</div>
                  <div className="text-sm text-gray-600">{gap.category}</div>
                </div>
                <Badge variant="destructive">Fehlt</Badge>
                {creatingArticle === gap.keyword && (
                  <div className="flex items-center gap-2 ml-2 text-sm text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content-Vorschläge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Neue Artikelideen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={() => handleCreateArticle(s.topic, s.category)}>
                <div>
                  <div className="font-medium">{s.topic}</div>
                  <div className="text-sm text-gray-600">{s.category}</div>
                </div>
                <Badge variant="outline">{s.reason}</Badge>
                {creatingArticle === s.topic && (
                  <div className="flex items-center gap-2 ml-2 text-sm text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Erstelle...
                  </div>
                )}
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
                      <Badge key={topicIdx} variant="outline" className="text-xs cursor-pointer hover:bg-gray-100"
                             onClick={() => handleCreateArticle(topic, strategy.category, undefined, strategy.urgency)}>
                        {topic}
                        {creatingArticle === topic && (
                          <Loader2 className="h-3 w-3 animate-spin ml-1" />
                        )}
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
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={() => handleCreateArticle(entry.title, entry.category)}>
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
                {creatingArticle === entry.title && (
                  <div className="flex items-center gap-2 ml-2 text-sm text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geplante Veröffentlichungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Geplante Veröffentlichungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduled.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(p.date).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <Badge variant="secondary">{p.status || 'geplant'}</Badge>
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
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start"
                    onClick={() => trends[0] && handleCreateArticle(trends[0].keyword, trends[0].category)}
                    disabled={!trends[0] || creatingArticle === trends[0]?.keyword}>
              <div className="font-medium mb-1">Top-Trend Content</div>
              <div className="text-sm text-gray-600">
                {trends[0] ? `Artikel zu ${trends[0].keyword} erstellen` : 'Keine Trends'}
              </div>
              {creatingArticle === trends[0]?.keyword && (
                <Loader2 className="h-4 w-4 animate-spin mt-2" />
              )}
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start"
                    onClick={() => gaps[0] && handleCreateArticle(gaps[0].topic, 'garten')}
                    disabled={!gaps[0] || creatingArticle === gaps[0]?.topic}>
              <div className="font-medium mb-1">Gap-Content</div>
              <div className="text-sm text-gray-600">
                {gaps[0] ? `Artikel zu ${gaps[0].topic} erstellen` : 'Keine Lücken'}
              </div>
              {creatingArticle === gaps[0]?.topic && (
                <Loader2 className="h-4 w-4 animate-spin mt-2" />
              )}
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start"
                    onClick={() => suggestions[0] && handleCreateArticle(suggestions[0].topic, suggestions[0].category)}
                    disabled={!suggestions[0] || creatingArticle === suggestions[0]?.topic}>
              <div className="font-medium mb-1">Trend-Vorschlag</div>
              <div className="text-sm text-gray-600">
                {suggestions[0] ? suggestions[0].topic : 'Keine Vorschläge'}
              </div>
              {creatingArticle === suggestions[0]?.topic && (
                <Loader2 className="h-4 w-4 animate-spin mt-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentStrategyDashboard;
