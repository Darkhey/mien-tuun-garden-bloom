import { supabase } from "@/integrations/supabase/client";
import { scheduledJobService } from "./ScheduledJobService";

export interface ContentAutomationConfig {
  id?: string;
  name: string;
  config: Record<string, any>;
  yaml_config?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  stats?: ContentAutomationStatsType;
}

export interface ContentAutomationLog {
  id?: string;
  config_id: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details?: Record<string, any>;
  created_at?: string;
}

export interface ContentAutomationStatsType {
  total_content_created: number;
  success_rate: number;
  avg_quality_score: number;
  engagement_rate: number;
  top_performing_category: string;
  content_by_category: Record<string, number>;
  recent_content: any[];
  last_updated: string;
}

class ContentAutomationService {
  /**
   * Get all content automation configurations
   */
  async getConfigurations(): Promise<ContentAutomationConfig[]> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch stats for each configuration
    const configsWithStats = await Promise.all((data || []).map(async (config) => {
      const stats = await this.getConfigurationStats(config.id);
      return { ...config, stats };
    }));
    
    return configsWithStats;
  }

  /**
   * Get a content automation configuration by ID
   */
  async getConfigurationById(id: string): Promise<ContentAutomationConfig | null> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    if (data) {
      const stats = await this.getConfigurationStats(id);
      return { ...data, stats };
    }
    
    return data;
  }

  /**
   * Create a new content automation configuration
   */
  async createConfiguration(config: Omit<ContentAutomationConfig, 'id'>): Promise<ContentAutomationConfig> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const configData = {
      ...config,
      created_by: session.session.user.id
    };

    const { data, error } = await supabase
      .from('content_automation_configs')
      .insert(configData)
      .select()
      .single();

    if (error) throw error;
    
    // Log the creation
    await this.logAction(data.id, 'create_configuration', 'success', { config: data.config });
    
    // Initialize stats
    const stats = {
      total_content_created: 0,
      success_rate: 100,
      avg_quality_score: 0,
      engagement_rate: 0,
      top_performing_category: '',
      content_by_category: {},
      recent_content: [],
      last_updated: new Date().toISOString()
    };
    
    return { ...data, stats };
  }

  /**
   * Update a content automation configuration
   */
  async updateConfiguration(id: string, updates: Partial<ContentAutomationConfig>): Promise<ContentAutomationConfig> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Log the update
    await this.logAction(id, 'update_configuration', 'success', { updates });
    
    // Get updated stats
    const stats = await this.getConfigurationStats(id);
    
    return { ...data, stats };
  }

  /**
   * Delete a content automation configuration
   */
  async deleteConfiguration(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_automation_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Log the deletion
    await this.logAction(id, 'delete_configuration', 'success');
  }

  /**
   * Toggle a configuration's active status
   */
  async toggleConfigurationActive(id: string, isActive: boolean): Promise<ContentAutomationConfig> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Log the status change
    await this.logAction(id, 'toggle_active', 'success', { is_active: isActive });
    
    // Get updated stats
    const stats = await this.getConfigurationStats(id);
    
    return { ...data, stats };
  }

  /**
   * Get logs for a configuration
   */
  async getLogs(configId?: string, limit = 50): Promise<ContentAutomationLog[]> {
    let query = supabase
      .from('content_automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (configId) {
      query = query.eq('config_id', configId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Log an action
   */
  async logAction(
    configId: string, 
    action: string, 
    status: 'success' | 'warning' | 'error', 
    details?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('content_automation_logs')
      .insert({
        config_id: configId,
        action,
        status,
        details
      });

    if (error) {
      console.error('Error logging action:', error);
    }
  }

  /**
   * Create scheduled jobs from a configuration
   */
  async createScheduledJobsFromConfig(configId: string): Promise<void> {
    const { data: config, error } = await supabase
      .from('content_automation_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (error) throw error;
    if (!config) throw new Error('Configuration not found');

    const configData = config.config;
    
    // Create jobs based on configuration
    // This is a simplified implementation - in a real system, you would
    // create more sophisticated jobs based on the full configuration
    
    for (const categoryObj of configData.categories || []) {
      const category = Object.keys(categoryObj)[0];
      const priority = categoryObj[category];
      
      // Get tags for this category
      const tags = configData.category_tags?.[category] || [];
      
      // Determine schedule based on priority
      let schedulePattern = '0 9 * * *'; // Default: daily at 9 AM
      
      if (configData.publishing?.interval === 'daily') {
        // A priority: daily, B priority: every 2 days, C priority: every 3 days
        if (priority === 'A') {
          schedulePattern = '0 9 * * *'; // Daily at 9 AM
        } else if (priority === 'B') {
          schedulePattern = '0 9 */2 * *'; // Every 2 days at 9 AM
        } else if (priority === 'C') {
          schedulePattern = '0 9 */3 * *'; // Every 3 days at 9 AM
        }
      } else if (configData.publishing?.interval === 'weekly') {
        // A priority: weekly, B priority: every 2 weeks, C priority: every 3 weeks
        if (priority === 'A') {
          schedulePattern = '0 9 * * 1'; // Every Monday at 9 AM
        } else if (priority === 'B') {
          schedulePattern = '0 9 * * 1#1,1#3'; // 1st and 3rd Monday at 9 AM
        } else if (priority === 'C') {
          schedulePattern = '0 9 * * 1#1'; // 1st Monday at 9 AM
        }
      }
      
      // Create a job for this category
      const jobConfig = {
        name: `Auto Content: ${category} (${priority})`,
        description: `Automatically generate content for category ${category} with priority ${priority}`,
        schedule_type: configData.publishing?.interval || 'daily',
        schedule_pattern: schedulePattern,
        target_table: 'blog_posts',
        template_data: {
          title: `{{AI_GENERATED_TITLE}}`,
          content: `{{AI_GENERATED_CONTENT}}`,
          excerpt: `{{AI_GENERATED_EXCERPT}}`,
          category,
          tags,
          status: configData.approval?.immediate_publishing ? 'veröffentlicht' : 'entwurf',
          published: configData.approval?.immediate_publishing,
          featured_image: `{{AI_GENERATED_IMAGE}}`,
          author: "Content Automation",
          reading_time: Math.ceil(configData.text?.min_word_count / 200) || 5,
          seo_title: `{{AI_GENERATED_TITLE}}`,
          seo_description: `{{AI_GENERATED_EXCERPT}}`,
          seo_keywords: tags,
          content_types: ["blog"],
          audiences: ["anfaenger"],
          season: this.getCurrentSeason()
        },
        is_active: true
      };
      
      await scheduledJobService.createJobConfig(jobConfig);
    }
    
    // Log the job creation
    await this.logAction(configId, 'create_scheduled_jobs', 'success', { 
      categories: configData.categories,
      jobCount: configData.categories?.length || 0
    });
  }

  /**
   * Get statistics for a configuration
   */
  async getConfigurationStats(configId: string): Promise<ContentAutomationStatsType> {
    try {
      // Get content created by this configuration
      const { data: contentData, error: contentError } = await supabase
        .from('blog_posts')
        .select('id, category, created_at, status')
        .eq('automation_config_id', configId);
        
      if (contentError) throw contentError;
      
      // Get engagement data
      const { data: engagementData, error: engagementError } = await supabase
        .from('blog_comments')
        .select('blog_slug, created_at')
        .in('blog_slug', (contentData || []).map(c => c.slug || '').filter(Boolean));
        
      if (engagementError) throw engagementError;
      
      // Calculate statistics
      const totalContent = contentData?.length || 0;
      const successfulContent = contentData?.filter(c => c.status === 'veröffentlicht').length || 0;
      const successRate = totalContent > 0 ? (successfulContent / totalContent) * 100 : 0;
      
      // Calculate content by category
      const contentByCategory: Record<string, number> = {};
      contentData?.forEach(content => {
        if (content.category) {
          contentByCategory[content.category] = (contentByCategory[content.category] || 0) + 1;
        }
      });
      
      // Find top performing category
      let topPerformingCategory = '';
      let maxCount = 0;
      Object.entries(contentByCategory).forEach(([category, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topPerformingCategory = category;
        }
      });
      
      // Calculate engagement rate
      const engagementRate = totalContent > 0 ? (engagementData?.length || 0) / totalContent : 0;
      
      // Get recent content
      const recentContent = contentData?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5) || [];
      
      return {
        total_content_created: totalContent,
        success_rate: Math.round(successRate),
        avg_quality_score: 85, // Placeholder - would be calculated from actual quality assessments
        engagement_rate: Math.round(engagementRate * 100),
        top_performing_category: topPerformingCategory,
        content_by_category: contentByCategory,
        recent_content: recentContent,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting configuration stats:', error);
      
      // Return default stats on error
      return {
        total_content_created: 0,
        success_rate: 0,
        avg_quality_score: 0,
        engagement_rate: 0,
        top_performing_category: '',
        content_by_category: {},
        recent_content: [],
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Get overall automation statistics
   */
  async getOverallStats(): Promise<{
    total_configurations: number;
    active_configurations: number;
    total_content_created: number;
    avg_success_rate: number;
    content_creation_trend: { date: string; count: number }[];
    top_categories: { category: string; count: number }[];
  }> {
    try {
      // Get all configurations
      const { data: configs, error: configsError } = await supabase
        .from('content_automation_configs')
        .select('id, is_active');
        
      if (configsError) throw configsError;
      
      // Get all automated content
      const { data: contentData, error: contentError } = await supabase
        .from('blog_posts')
        .select('id, category, created_at, status')
        .not('automation_config_id', 'is', null);
        
      if (contentError) throw contentError;
      
      // Calculate statistics
      const totalConfigs = configs?.length || 0;
      const activeConfigs = configs?.filter(c => c.is_active).length || 0;
      const totalContent = contentData?.length || 0;
      
      // Calculate success rate
      const successfulContent = contentData?.filter(c => c.status === 'veröffentlicht').length || 0;
      const avgSuccessRate = totalContent > 0 ? (successfulContent / totalContent) * 100 : 0;
      
      // Calculate content by category
      const contentByCategory: Record<string, number> = {};
      contentData?.forEach(content => {
        if (content.category) {
          contentByCategory[content.category] = (contentByCategory[content.category] || 0) + 1;
        }
      });
      
      // Get top categories
      const topCategories = Object.entries(contentByCategory)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Calculate content creation trend (last 7 days)
      const contentTrend: { date: string; count: number }[] = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = contentData?.filter(c => 
          c.created_at.startsWith(dateStr)
        ).length || 0;
        
        contentTrend.push({ date: dateStr, count });
      }
      
      return {
        total_configurations: totalConfigs,
        active_configurations: activeConfigs,
        total_content_created: totalContent,
        avg_success_rate: Math.round(avgSuccessRate),
        content_creation_trend: contentTrend,
        top_categories: topCategories
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      
      // Return default stats on error
      return {
        total_configurations: 0,
        active_configurations: 0,
        total_content_created: 0,
        avg_success_rate: 0,
        content_creation_trend: [],
        top_categories: []
      };
    }
  }

  /**
   * Get motivational messages based on stats
   */
  getMotivationalMessage(stats: ContentAutomationStatsType): string {
    if (stats.total_content_created === 0) {
      return "Starte jetzt mit deiner ersten automatisierten Content-Erstellung! 🚀";
    }
    
    if (stats.success_rate > 90) {
      return "Hervorragende Arbeit! Deine Content-Automatisierung läuft auf Hochtouren. 🏆";
    }
    
    if (stats.engagement_rate > 50) {
      return "Dein automatisierter Content erzielt tolle Engagement-Werte! Weiter so! 👏";
    }
    
    if (stats.total_content_created > 10) {
      return "Schon über 10 Inhalte automatisch erstellt - deine Content-Maschine läuft! 💪";
    }
    
    return "Deine Content-Automatisierung ist aktiv. Optimiere für noch bessere Ergebnisse! ✨";
  }

  /**
   * Get improvement suggestions based on stats
   */
  getImprovementSuggestions(stats: ContentAutomationStatsType): string[] {
    const suggestions: string[] = [];
    
    if (stats.success_rate < 80) {
      suggestions.push("Überprüfe deine Veröffentlichungseinstellungen, um die Erfolgsrate zu verbessern.");
    }
    
    if (stats.engagement_rate < 30) {
      suggestions.push("Füge mehr interaktive Elemente oder Fragen in deine Content-Vorlagen ein, um das Engagement zu steigern.");
    }
    
    if (Object.keys(stats.content_by_category).length < 3) {
      suggestions.push("Erweitere deine Automatisierung auf mehr Kategorien für eine vielfältigere Content-Strategie.");
    }
    
    if (stats.avg_quality_score < 70) {
      suggestions.push("Verbessere deine Textparameter und Qualitätskriterien für hochwertigeren Content.");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("Deine Automatisierung läuft optimal! Erwäge, die Frequenz zu erhöhen oder neue Themen hinzuzufügen.");
    }
    
    return suggestions;
  }

  /**
   * Get current season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "frühling";
    if (month >= 6 && month <= 8) return "sommer";
    if (month >= 9 && month <= 11) return "herbst";
    return "winter";
  }
}

export const contentAutomationService = new ContentAutomationService();