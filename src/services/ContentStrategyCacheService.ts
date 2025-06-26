
interface CachedData {
  strategies: any[];
  calendar: any[];
  trends: any[];
  gaps: any[];
  keywordGaps: any[];
  suggestions: any[];
  categoryStats: any[];
  scheduled: any[];
  lastUpdated: string;
}

class ContentStrategyCacheService {
  private static CACHE_KEY = 'content-strategy-data';
  private static CACHE_DURATION = 30 * 60 * 1000; // 30 Minuten

  static saveData(data: Omit<CachedData, 'lastUpdated'>): void {
    const cachedData: CachedData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedData));
      console.log('[ContentStrategyCache] Data cached successfully');
    } catch (error) {
      console.error('[ContentStrategyCache] Failed to cache data:', error);
    }
  }

  static getCachedData(): CachedData | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data: CachedData = JSON.parse(cached);
      const lastUpdated = new Date(data.lastUpdated);
      const now = new Date();
      
      // Prüfen ob Cache noch gültig ist
      if (now.getTime() - lastUpdated.getTime() > this.CACHE_DURATION) {
        console.log('[ContentStrategyCache] Cache expired');
        this.clearCache();
        return null;
      }

      console.log('[ContentStrategyCache] Using cached data from:', data.lastUpdated);
      return data;
    } catch (error) {
      console.error('[ContentStrategyCache] Failed to read cache:', error);
      return null;
    }
  }

  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('[ContentStrategyCache] Cache cleared');
    } catch (error) {
      console.error('[ContentStrategyCache] Failed to clear cache:', error);
    }
  }

  static isCacheValid(): boolean {
    const cached = this.getCachedData();
    return cached !== null;
  }

  static getCacheAge(): number | null {
    const cached = this.getCachedData();
    if (!cached) return null;
    
    const lastUpdated = new Date(cached.lastUpdated);
    const now = new Date();
    return Math.floor((now.getTime() - lastUpdated.getTime()) / 1000 / 60); // Minuten
  }
}

export { ContentStrategyCacheService };
export type { CachedData };
