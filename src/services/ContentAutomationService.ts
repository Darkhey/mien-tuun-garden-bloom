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
}

export interface ContentAutomationLog {
  id?: string;
  config_id: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details?: Record<string, any>;
  created_at?: string;
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
    return data || [];
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
    
    return data;
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
    
    return data;
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
    
    return data;
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
    
    for (const category of configData.categories || []) {
      // Create a job for each category
      const jobConfig = {
        name: `Auto Content: ${category}`,
        description: `Automatically generate content for category ${category}`,
        schedule_type: configData.publishingInterval || 'daily',
        schedule_pattern: '0 9 * * *', // Default to daily at 9 AM
        target_table: 'blog_posts',
        template_data: {
          category,
          status: configData.immediatePublishing ? 'veröffentlicht' : 'entwurf',
          published: configData.immediatePublishing,
          // Add other template data based on configuration
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
}

export const contentAutomationService = new ContentAutomationService();