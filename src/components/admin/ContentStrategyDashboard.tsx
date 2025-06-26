import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Target, Clock, Lightbulb, AlertTriangle, Search, Loader2, Triangle as ExclamationTriangle, RefreshCcw, Database, Zap } from "lucide-react";
import { contentStrategyService, ContentStrategy, ContentCalendarEntry } from "@/services/ContentStrategyService";
import { contextAnalyzer, ContentGap } from "@/services/ContextAnalyzer";
import { blogAnalyticsService, TrendKeyword } from "@/services/BlogAnalyticsService";
import { contentInsightsService, CategoryStat, ContentSuggestion, ScheduledPost } from "@/services/ContentInsightsService";
import { ContentStrategyCacheService } from "@/services/ContentStrategyCacheService";
import { TrendSourceService, EnhancedTrend } from "@/services/TrendSourceService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StrategyArticleResponse {
  success: boolean;
  error?: string;
  missingEnv?: string[];
  slug?: string;
}

const ContentStrategyDashboard: React.FC = () => {
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [calendar, setCalendar] = useState<ContentCalendarEntry[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [enhancedTrends, setEnhancedTrends] = useState<EnhancedTrend[]>([]);
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [keywordGaps, setKeywordGaps] = useState<TrendKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingArticle, setCreatingArticle] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const { toast } = useToast();

  const loadStrategicData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setUsingCache(false);
    
    try {
      console.log("[StrategyDashboard] Loading strategic data", forceRefresh ? "(force refresh)" : "");
      
      // Versuche zuerst Cache zu laden
      if (!forceRefresh) {
        const cachedData = ContentStrategyCacheService.getCachedData();
        if (cachedData) {
          console.log("[StrategyDashboard] Using cached data");
          setStrategies(cachedData.strategies);
          setCalendar(cachedData.calendar);
          setScheduled(cachedData.scheduled);
          setEnhancedTrends(TrendSourceService.enhanceTrends(cachedData.trends));
          setGaps(cachedData.gaps);
          setKeywordGaps(cachedData.keywordGaps);
          setSuggestions(cachedData.suggestions);
          setCategoryStats(cachedData.categoryStats);
          setCacheAge(ContentStrategyCacheService.getCacheAge());
          setUsingCache(true);
          setLoading(false);
          return;
        }
      }

      // Neue Daten laden
      console.log("[StrategyDashboard] Loading fresh data from services");
      const [strategiesData, posts, trendsData, gapsData, insights] = await Promise.all([
        contentStrategyService.generateContentStrategy({ timeframe: 4 }),
        blogAnalyticsService.fetchBlogPosts(),
        blogAnalyticsService.fetchCurrentTrends(),
        Promise.resolve(contextAnalyzer.analyzeContentGaps()),
        contentInsightsService.fetchInsights()
      ]);

      const existing = blogAnalyticsService.extractKeywords(posts);
      const kwGaps = blogAnalyticsService.findKeywordGaps(trendsData, existing);
      const calendarData = await contentStrategyService.generateContentCalendar(strategiesData, 2);

      // Daten in Cache speichern
      ContentStrategyCacheService.saveData({
        strategies: strategiesData,
        calendar: calendarData.slice(0, 10),
        trends: trendsData.slice(0, 6),
        gaps: gapsData,
        keywordGaps: kwGaps,
        suggestions: insights.suggestions.slice(0, 5),
        categoryStats: insights.categoryStats,
        scheduled: insights.scheduled.slice(0, 5)
      });

      // State aktualisieren
      setStrategies(strategiesData);
      setEnhancedTrends(TrendSourceService.enhanceTrends(trendsData.slice(0, 6)));
      setGaps(gapsData);
      setKeywordGaps(kwGaps);
      setCategoryStats(insights.categoryStats);
      setSuggestions(insights.suggestions.slice(0, 5));
      setScheduled(insights.scheduled.slice(0, 5));
      setCalendar(calendarData.slice(0, 10));
      setCacheAge(0);
      
      console.log("[StrategyDashboard] Fresh data loaded and cached successfully");
      
      toast({
        title: "Daten aktualisiert",
        description: "Neue Analyse wurde erfolgreich durchgeführt",
      });
      
    } catch (error) {
      console.error("[StrategyDashboard] Error loading data:", error);
      toast({
        title: "Fehler beim Laden",
        description: "Daten konnten nicht aktualisiert werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleCreateArticle = async (topic: string, category: string, season?: string, urgency?: string) => {
    setCreatingArticle(topic);
    console.log(`[StrategyDashboard] Starting article creation for: ${topic}`);
    
    try {
      console.log(`[StrategyDashboard] Calling Supabase function with params:`, { topic, category, season, urgency });
      
      const { data, error } = await supabase.functions
        .invoke<StrategyArticleResponse>('create-strategy-article', {
          body: { topic, category, season, urgency },
        });

      if (error) {
        console.error("[StrategyDashboard] Supabase function error:", error);
        throw new Error(error.message || "Edge Function Fehler");
      }

      if (!data) {
        console.error("[StrategyDashboard] No response data received");
        throw new Error("Keine Antwort von der Edge Function erhalten");
      }

      console.log("[StrategyDashboard] Function response:", data);

      if (!data.success) {
        if (Array.isArray(data.missingEnv)) {
          console.error("[StrategyDashboard] Missing environment variables:", data.missingEnv);
          throw new Error(
            `Server-Konfiguration fehlt: ${data.missingEnv.join(', ')}`
          );
        }
        console.error("[StrategyDashboard] Function returned error:", data.error);
        throw new Error(data.error || "Artikel konnte nicht erstellt werden");
      }

      console.log("[StrategyDashboard] Article created successfully:", data.slug);
      
      toast({
        title: "Artikel erstellt! 🎉",
        description: `"${topic}" wurde erfolgreich veröffentlicht`,
      });

      // Cache löschen um neue Daten zu laden
      console.log("[StrategyDashboard] Clearing cache after article creation");
      ContentStrategyCacheService.clearCache();
      await loadStrategicData(true);
      
    } catch (error: any) {
      console.error("[StrategyDashboard] Error creating article:", error);
      
      let errorMessage = "Artikel konnte nicht erstellt werden";
      
      if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Verbindung zur Edge Function fehlgeschlagen. Bitte prüfen Sie die Konfiguration.";
      } else if (error.message?.includes("OPENAI_API_KEY")) {
        errorMessage = "OpenAI API-Schlüssel nicht konfiguriert. Bitte kontaktieren Sie den Administrator.";
      } else if (error.message?.includes("Edge Function")) {
        errorMessage = "Edge Function Fehler. Bitte versuchen Sie es später erneut.";
      } else if (error.message?.includes("Server-Konfiguration fehlt")) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error("[StrategyDashboard] Final error message:", errorMessage);
      
      toast({
        title: "Fehler beim Erstellen",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("[StrategyDashboard] Article creation process finished");
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
          {usingCache && cacheAge !== null && (
            <div className="flex items-center gap-2 mt-1 text-sm text-blue-600">
              <Database className="h-4 w-4" />
              <span>Cache verwendet (vor {cacheAge} Min. aktualisiert)</span>
            </div>
          )}
        </div>
        <Button onClick={() => loadStrategicData(true)} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analysiere...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Daten aktualisieren
            </>
          )}
        </Button>
      </div>

      {/* System Status Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Hinweis: Artikel-Erstellung erfordert konfigurierte OpenAI API-Schlüssel
              </p>
              <p className="text-xs text-orange-600">
                Falls Fehler auftreten, kontaktieren Sie bitte den Administrator zur Konfiguration der Edge Functions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erweiterte Trend-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aktuelle Trends mit Quellen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enhancedTrends.map((trend, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-lg">{trend.keyword}</span>
                      <Badge variant="outline">{Math.round(trend.relevance * 100)}%</Badge>
                      {trend.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {trend.confidence}% Vertrauen
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {trend.category} 
                      {trend.seasonality && (
                        <span className="ml-2 text-blue-600">• {trend.seasonality}</span>
                      )}
                      {trend.searchVolume && (
                        <span className="ml-2 text-green-600">• ~{trend.searchVolume} Suchanfragen/Monat</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Quellen-Information */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Datenquellen:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {trend.sources.map((source, sourceIdx) => (
                      <div key={sourceIdx} className="flex items-center gap-2 text-xs">
                        <span className="text-lg">{TrendSourceService.getSourceIcon(source.type)}</span>
                        <div>
                          <span className="font-medium">{source.name}</span>
                          <span className={`ml-1 ${TrendSourceService.getReliabilityColor(source.reliability)}`}>
                            ({source.reliability}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {trend.sources[0]?.description}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Progress value={trend.relevance * 100} className="h-2 flex-1 mr-4" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCreateArticle(trend.keyword, trend.category)}
                    disabled={creatingArticle === trend.keyword}
                    className="flex items-center gap-2"
                  >
                    {creatingArticle === trend.keyword ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Erstelle...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" />
                        Artikel generieren
                      </>
                    )}
                  </Button>
                </div>
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
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getUrgencyColor(gap.urgency > 0.8 ? 'high' : 'medium')}`} />
                    <span className="text-sm">{Math.round(gap.urgency * 100)}% Priorität</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCreateArticle(gap.topic, 'garten', undefined, gap.urgency > 0.8 ? 'high' : 'medium')}
                    disabled={creatingArticle === gap.topic}
                  >
                    {creatingArticle === gap.topic ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Artikel erstellen'
                    )}
                  </Button>
                </div>
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
                    onClick={() => enhancedTrends[0] && handleCreateArticle(enhancedTrends[0].keyword, enhancedTrends[0].category)}
                    disabled={!enhancedTrends[0] || creatingArticle === enhancedTrends[0]?.keyword}>
              <div className="font-medium mb-1">Top-Trend Content</div>
              <div className="text-sm text-gray-600">
                {enhancedTrends[0] ? `Artikel zu ${enhancedTrends[0].keyword} erstellen` : 'Keine Trends'}
              </div>
              {creatingArticle === enhancedTrends[0]?.keyword && (
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
