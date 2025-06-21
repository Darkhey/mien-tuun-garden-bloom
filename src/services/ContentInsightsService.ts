
// ⚠️ FULLY SIMULATED DATA SERVICE - Replace with real analytics API

export interface ContentInsight {
  id: string;
  title: string;
  description: string;
  metric: number;
  change: number;
  type: 'positive' | 'negative' | 'neutral';
  category: 'performance' | 'engagement' | 'seo' | 'content';
}

export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedImpact: string;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  searchVolume: number;
  growth: number;
  difficulty: number;
  relevanceScore: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  engagement: number;
  performance: number;
}

export interface ContentSuggestion {
  topic: string;
  category: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ScheduledPost {
  title: string;
  date: string;
  status: string;
  category: string;
}

export class ContentInsightsService {
  async getContentInsights(): Promise<ContentInsight[]> {
    console.log('[ContentInsights] ⚠️ SIMULATED: RETURNING INSIGHTS DATA');
    
    // ⚠️ SIMULATED: Hardcoded insights
    return [
      {
        id: '1',
        title: 'Blog-Traffic gestiegen',
        description: 'Organischer Traffic ist um 23% gestiegen',
        metric: 23,
        change: 5.2,
        type: 'positive',
        category: 'performance'
      },
      {
        id: '2',
        title: 'Engagement-Rate optimieren',
        description: 'Durchschnittliche Verweildauer könnte verbessert werden',
        metric: 2.4,
        change: -0.3,
        type: 'negative',
        category: 'engagement'
      },
      {
        id: '3',
        title: 'SEO-Score verbessert',
        description: 'Durchschnittlicher SEO-Score der letzten Artikel',
        metric: 87,
        change: 12,
        type: 'positive',
        category: 'seo'
      },
      {
        id: '4',
        title: 'Content-Produktion stabil',
        description: 'Regelmäßige Veröffentlichung beibehalten',
        metric: 8,
        change: 0,
        type: 'neutral',
        category: 'content'
      }
    ];
  }

  async getContentRecommendations(): Promise<ContentRecommendation[]> {
    console.log('[ContentInsights] ⚠️ SIMULATED: RETURNING RECOMMENDATIONS');
    
    // ⚠️ SIMULATED: Hardcoded recommendations
    return [
      {
        id: '1',
        title: 'Saisonale Gartentipps für Winter',
        description: 'Wintervorbereitungen sind ein beliebtes Thema im Herbst',
        priority: 'high',
        category: 'Gartentipps',
        estimatedImpact: '+15% Traffic'
      },
      {
        id: '2',
        title: 'Indoor-Kräutergarten Artikel',
        description: 'Steigende Nachfrage nach Indoor-Gardening',
        priority: 'medium',
        category: 'Kräuter',
        estimatedImpact: '+8% Engagement'
      },
      {
        id: '3',
        title: 'Nachhaltigkeit im Garten',
        description: 'Umweltthemen sind sehr gefragt',
        priority: 'high',
        category: 'Nachhaltigkeit',
        estimatedImpact: '+20% Shares'
      }
    ];
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    console.log('[ContentInsights] ⚠️ SIMULATED: RETURNING TRENDING TOPICS');
    
    // ⚠️ SIMULATED: Hardcoded trending topics
    return [
      {
        id: '1',
        topic: 'Wintergemüse anbauen',
        searchVolume: 1200,
        growth: 45,
        difficulty: 3,
        relevanceScore: 92
      },
      {
        id: '2',
        topic: 'Kompost selber machen',
        searchVolume: 980,
        growth: 32,
        difficulty: 2,
        relevanceScore: 88
      },
      {
        id: '3',
        topic: 'Balkon Garten Winter',
        searchVolume: 750,
        growth: 67,
        difficulty: 4,
        relevanceScore: 85
      },
      {
        id: '4',
        topic: 'Kräuter konservieren',
        searchVolume: 650,
        growth: 28,
        difficulty: 2,
        relevanceScore: 81
      }
    ];
  }

  async fetchInsights(): Promise<{
    categoryStats: CategoryStat[];
    suggestions: ContentSuggestion[];
    scheduled: ScheduledPost[];
  }> {
    console.log('[ContentInsights] ⚠️ SIMULATED: FETCHING INSIGHTS');
    
    return {
      categoryStats: [
        { category: 'Gartentipps', count: 45, engagement: 78, performance: 85 },
        { category: 'Pflanzen', count: 32, engagement: 65, performance: 72 },
        { category: 'Kochen', count: 28, engagement: 82, performance: 90 }
      ],
      suggestions: [
        { topic: 'Wintergemüse Anbau', category: 'Gartentipps', reason: 'Saisonaler Trend', priority: 'high' },
        { topic: 'Indoor Kräutergarten', category: 'Kräuter', reason: 'Steigende Nachfrage', priority: 'medium' },
        { topic: 'Nachhaltiges Gärtnern', category: 'Nachhaltigkeit', reason: 'Umweltbewusstsein', priority: 'high' }
      ],
      scheduled: [
        { title: 'Herbstpflanzen Guide', date: new Date().toISOString(), status: 'geplant', category: 'Gartentipps' },
        { title: 'Kompost-Tutorial', date: new Date(Date.now() + 86400000).toISOString(), status: 'bereit', category: 'Kompostierung' }
      ]
    };
  }

  async analyzeContentPerformance(contentId: string): Promise<any> {
    console.log('[ContentInsights] ⚠️ SIMULATED: CONTENT PERFORMANCE ANALYSIS for:', contentId);
    
    // ⚠️ SIMULATED: Hardcoded performance data
    return {
      views: Math.floor(Math.random() * 5000) + 500,
      engagement: Math.floor(Math.random() * 30) + 10,
      shares: Math.floor(Math.random() * 100) + 5,
      comments: Math.floor(Math.random() * 20) + 1,
      timeOnPage: Math.floor(Math.random() * 300) + 120,
      bounceRate: Math.floor(Math.random() * 30) + 20
    };
  }

  async predictContentSuccess(contentData: any): Promise<number> {
    console.log('[ContentInsights] ⚠️ SIMULATED: CONTENT SUCCESS PREDICTION for:', contentData.title);
    
    // ⚠️ SIMULATED: Einfacher Score basierend auf Titel-Länge und Kategorie
    let score = 50;
    
    if (contentData.title && contentData.title.length > 10) score += 10;
    if (contentData.category === 'Gartentipps') score += 15;
    if (contentData.category === 'Kräuter') score += 10;
    if (contentData.tags && contentData.tags.length > 2) score += 5;
    
    // Zufälliger Faktor für Realismus
    score += Math.floor(Math.random() * 20) - 10;
    
    return Math.min(100, Math.max(0, score));
  }
}

export const contentInsightsService = new ContentInsightsService();
