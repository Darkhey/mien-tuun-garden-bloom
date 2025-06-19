
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from '@/integrations/supabase/types';

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

export interface ContentAutomationConfig {
  id: string;
  name: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  yaml_config: string | null;
  stats?: ContentAutomationStatsType;
}

class ContentAutomationService {
  async getConfigurations(): Promise<ContentAutomationConfig[]> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(config => ({
      ...config,
      config: config.config as Record<string, any>,
      created_at: config.created_at || new Date().toISOString(),
      updated_at: config.updated_at || new Date().toISOString(),
      is_active: config.is_active || false,
      stats: this.generateMockStats()
    }));
  }

  async getConfiguration(id: string): Promise<ContentAutomationConfig | null> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      config: data.config as Record<string, any>,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      is_active: data.is_active || false
    };
  }

  async createConfiguration(config: Omit<ContentAutomationConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ContentAutomationConfig> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .insert([{
        name: config.name,
        config: config.config,
        is_active: config.is_active,
        created_by: config.created_by,
        yaml_config: config.yaml_config
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      config: data.config as Record<string, any>,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      is_active: data.is_active || false,
      stats: this.generateMockStats()
    };
  }

  async updateConfiguration(id: string, updates: Partial<ContentAutomationConfig>): Promise<ContentAutomationConfig> {
    const { data, error } = await supabase
      .from('content_automation_configs')
      .update({
        name: updates.name,
        config: updates.config,
        is_active: updates.is_active,
        yaml_config: updates.yaml_config,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      config: data.config as Record<string, any>,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      is_active: data.is_active || false
    };
  }

  private generateMockStats(): ContentAutomationStatsType {
    return {
      total_content_created: Math.floor(Math.random() * 100) + 20,
      success_rate: Math.floor(Math.random() * 30) + 70,
      avg_quality_score: Math.floor(Math.random() * 20) + 80,
      engagement_rate: Math.floor(Math.random() * 15) + 5,
      top_performing_category: 'Gartenplanung',
      content_by_category: {
        'Gartenplanung': Math.floor(Math.random() * 20) + 10,
        'Saisonale Küche': Math.floor(Math.random() * 15) + 8,
        'Nachhaltigkeit': Math.floor(Math.random() * 12) + 5
      },
      recent_content: [],
      last_updated: new Date().toISOString()
    };
  }
}

export const contentAutomationService = new ContentAutomationService();
export { ContentAutomationStatsType as ContentAutomationStats };
