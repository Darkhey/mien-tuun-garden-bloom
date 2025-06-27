import { useEffect, useState } from "react";
import { contentStrategyService, ContentStrategy, ContentCalendarEntry } from "@/services/ContentStrategyService";
import { contextAnalyzer, ContentGap } from "@/services/ContextAnalyzer";
import { blogAnalyticsService, TrendKeyword } from "@/services/BlogAnalyticsService";
import { contentInsightsService, CategoryStat, ContentSuggestion, ScheduledPost } from "@/services/ContentInsightsService";
import { ContentStrategyCacheService } from "@/services/ContentStrategyCacheService";
import { TrendSourceService, EnhancedTrend } from "@/services/TrendSourceService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateMissingTopics } from "@/services/TopicSuggestionService";

interface StrategyArticleResponse {
  success: boolean;
  error?: string;
  missingEnv?: string[];
  slug?: string;
}

interface CategoryContentGap {
  categoryId: string;
  categoryName: string;
  icon: string;
  articleCount: number;
  missingTopics: string[];
  priority: number;
}

const BLOG_CATEGORIES = [
  { id: 'gaertnern', name: 'Gärtnern', icon: '🌱', keywords: ['garten', 'pflanzen', 'aussaat', 'ernte', 'pflege'] },
  { id: 'gartenkueche', name: 'Gartenküche', icon: '👩‍🍳', keywords: ['kochen', 'rezept', 'ernte', 'kräuter', 'saisonal'] },
  { id: 'diy-basteln', name: 'DIY & Basteln', icon: '🔨', keywords: ['diy', 'basteln', 'selbermachen', 'bauen', 'upcycling'] },
  { id: 'nachhaltigkeit', name: 'Nachhaltigkeit', icon: '♻️', keywords: ['nachhaltig', 'umwelt', 'bio', 'plastikfrei', 'zero waste'] },
  { id: 'indoor-gardening', name: 'Indoor Gardening', icon: '🏠', keywords: ['indoor', 'zimmerpflanzen', 'hydroponik', 'sprossen'] },
  { id: 'saisonales', name: 'Saisonales', icon: '🍂', keywords: ['saison', 'frühling', 'sommer', 'herbst', 'winter'] },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨', keywords: ['lifestyle', 'gesundheit', 'wellness', 'selbstversorgung'] }
];

export function useContentStrategyData() {
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [calendar, setCalendar] = useState<ContentCalendarEntry[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [enhancedTrends, setEnhancedTrends] = useState<EnhancedTrend[]>([]);
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [categoryGaps, setCategoryGaps] = useState<CategoryContentGap[]>([]);
  const [keywordGaps, setKeywordGaps] = useState<TrendKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingArticle, setCreatingArticle] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const { toast } = useToast();

  const analyzeCategoryGaps = async (): Promise<CategoryContentGap[]> => {
    const { data: posts, error: dbError } = await supabase
      .from('blog_posts')
      .select('category, title, tags')
      .eq('published', true);

    if (dbError) {
      console.error('[ContentStrategy] Database error while fetching posts:', dbError);
      throw new Error('Failed to fetch blog posts');
    }

    try {
      const categoryGaps: CategoryContentGap[] = [];
      for (const category of BLOG_CATEGORIES) {
        const categoryPosts = posts?.filter(post =>
          post.category?.toLowerCase().includes(category.id) ||
          category.keywords.some((keyword: string) =>
            post.title?.toLowerCase().includes(keyword) ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes(keyword))
          )
        ) || [];

        const missingTopics = generateMissingTopics(category.id, categoryPosts.length);

        categoryGaps.push({
          categoryId: category.id,
          categoryName: category.name,
          icon: category.icon,
          articleCount: categoryPosts.length,
          missingTopics,
          priority: calculateCategoryPriority(categoryPosts.length, category.id)
        });
      }

      return categoryGaps.sort((a, b) => b.priority - a.priority);
    } catch (processingError) {
      console.error('[ContentStrategy] Data processing error in analyzeCategoryGaps:', processingError);
      throw processingError;
    }
  };


  const calculateCategoryPriority = (articleCount: number, categoryId: string): number => {
    let priority = Math.max(0, 10 - articleCount);
    if (categoryId === 'saisonales') priority += 2;
    if (['gaertnern', 'gartenkueche'].includes(categoryId)) priority += 1;
    return priority * 10;
  };

  const loadStrategicData = async (forceRefresh = false) => {
    setLoading(true);
    setUsingCache(false);

    try {
      if (!forceRefresh) {
        const cachedData = ContentStrategyCacheService.getCachedData();
        if (cachedData) {
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
          const categoryGapsData = await analyzeCategoryGaps();
          setCategoryGaps(categoryGapsData);
          setLoading(false);
          return;
        }
      }

      const [strategiesData, posts, trendsData, gapsData, insights, categoryGapsData] = await Promise.all([
        contentStrategyService.generateContentStrategy({ timeframe: 4 }),
        blogAnalyticsService.fetchBlogPosts(),
        blogAnalyticsService.fetchCurrentTrends(),
        Promise.resolve(contextAnalyzer.analyzeContentGaps()),
        contentInsightsService.fetchInsights(),
        analyzeCategoryGaps()
      ]);

      const existing = blogAnalyticsService.extractKeywords(posts);
      const kwGaps = blogAnalyticsService.findKeywordGaps(trendsData, existing);
      const calendarData = await contentStrategyService.generateContentCalendar(strategiesData, 2);

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

      setStrategies(strategiesData);
      setEnhancedTrends(TrendSourceService.enhanceTrends(trendsData.slice(0, 6)));
      setGaps(gapsData);
      setKeywordGaps(kwGaps);
      setCategoryStats(insights.categoryStats);
      setSuggestions(insights.suggestions.slice(0, 5));
      setScheduled(insights.scheduled.slice(0, 5));
      setCalendar(calendarData.slice(0, 10));
      setCategoryGaps(categoryGapsData);
      setCacheAge(0);
      toast({ title: 'Daten aktualisiert', description: 'Neue Analyse wurde erfolgreich durchgeführt' });
    } catch (error) {
      console.error('[StrategyDashboard] Error loading data:', error);
      toast({ title: 'Fehler beim Laden', description: 'Daten konnten nicht aktualisiert werden', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreateArticle = async (topic: string, category: string, season?: string, urgency?: string) => {
    setCreatingArticle(topic);
    try {
      const categoryMapping = BLOG_CATEGORIES.find(cat =>
        cat.name.toLowerCase() === category.toLowerCase() ||
        cat.id === category.toLowerCase()
      );

      const mariannePrompt = `Schreibe einen ausführlichen Blog-Artikel im Stil von Marianne über "${topic}".
        Der Artikel gehört zur Kategorie "${categoryMapping?.name || category}"${categoryMapping?.icon || ''}.

        Marianne's Stil:
        - Herzlich und persönlich (Du/Sie-Form)
        - Teilt gerne persönliche Gartenerfahrungen
        - Praktische, umsetzbare Tipps
        - Ermutigt Leser zum Ausprobieren
        - Verwendet deutsche Gartenbegriffe

        Der Artikel soll:
        - Mindestens 800 Wörter haben
        - Praktische Schritt-für-Schritt Anleitungen enthalten
        - Zu ${categoryMapping?.name || category} passen
        - Saisonale Bezüge einbauen ${season ? `(besonders ${season})` : ''}
        - Häufige Fehler und deren Vermeidung erwähnen`;

      const { data, error } = await supabase.functions
        .invoke<StrategyArticleResponse>('create-strategy-article', {
          body: { topic, category: categoryMapping?.name || category, season, urgency, customPrompt: mariannePrompt }
        });

      if (error) throw new Error(error.message || 'Edge Function Fehler');
      if (!data || !data.success) {
        if (Array.isArray(data?.missingEnv)) throw new Error(`Server-Konfiguration fehlt: ${data.missingEnv.join(', ')}`);
        throw new Error(data?.error || 'Artikel konnte nicht erstellt werden');
      }

      toast({ title: 'Artikel erstellt! 🎉', description: `"${topic}" wurde erfolgreich im Marianne-Stil veröffentlicht` });
      ContentStrategyCacheService.clearCache();
      await loadStrategicData(true);
    } catch (error: any) {
      let errorMessage = 'Artikel konnte nicht erstellt werden';
      if (error.message?.includes('OPENAI_API_KEY')) errorMessage = 'OpenAI API-Schlüssel nicht konfiguriert.';
      else if (error.message) errorMessage = error.message;
      toast({ title: 'Fehler beim Erstellen', description: errorMessage, variant: 'destructive' });
    } finally {
      setCreatingArticle(null);
    }
  };

  const clearCache = () => {
    ContentStrategyCacheService.clearCache();
    setCacheAge(null);
    setUsingCache(false);
  };

  useEffect(() => {
    loadStrategicData();
  }, []);

  useEffect(() => {
    if (!usingCache) return;
    const interval = setInterval(() => {
      setCacheAge(ContentStrategyCacheService.getCacheAge());
    }, 60000);
    return () => clearInterval(interval);
  }, [usingCache]);

  return {
    strategies,
    calendar,
    scheduled,
    enhancedTrends,
    gaps,
    categoryGaps,
    keywordGaps,
    suggestions,
    categoryStats,
    loading,
    creatingArticle,
    cacheAge,
    usingCache,
    loadStrategicData,
    handleCreateArticle,
    clearCache,
  };
}
