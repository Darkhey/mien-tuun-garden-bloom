export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      automation_pipelines: {
        Row: {
          config: Json | null
          created_at: string
          efficiency: number
          id: string
          last_run_at: string | null
          name: string
          stages: Json | null
          status: string
          throughput: number
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          efficiency?: number
          id?: string
          last_run_at?: string | null
          name: string
          stages?: Json | null
          status?: string
          throughput?: number
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          efficiency?: number
          id?: string
          last_run_at?: string | null
          name?: string
          stages?: Json | null
          status?: string
          throughput?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          blog_slug: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blog_slug: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blog_slug?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_podcasts: {
        Row: {
          audio_url: string | null
          blog_post_id: string
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          eleven_labs_id: string | null
          error_message: string | null
          id: string
          published_at: string | null
          script_content: string
          status: string
          title: string
          updated_at: string | null
          voice_settings: Json | null
        }
        Insert: {
          audio_url?: string | null
          blog_post_id: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          eleven_labs_id?: string | null
          error_message?: string | null
          id?: string
          published_at?: string | null
          script_content: string
          status?: string
          title: string
          updated_at?: string | null
          voice_settings?: Json | null
        }
        Update: {
          audio_url?: string | null
          blog_post_id?: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          eleven_labs_id?: string | null
          error_message?: string | null
          id?: string
          published_at?: string | null
          script_content?: string
          status?: string
          title?: string
          updated_at?: string | null
          voice_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_podcasts_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_versions: {
        Row: {
          audiences: string[] | null
          author: string | null
          blog_post_id: string
          category: string | null
          content: string | null
          content_types: string[] | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          id: string
          og_image: string | null
          published: boolean | null
          reading_time: number | null
          season: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          audiences?: string[] | null
          author?: string | null
          blog_post_id: string
          category?: string | null
          content?: string | null
          content_types?: string[] | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          og_image?: string | null
          published?: boolean | null
          reading_time?: number | null
          season?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          audiences?: string[] | null
          author?: string | null
          blog_post_id?: string
          category?: string | null
          content?: string | null
          content_types?: string[] | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          og_image?: string | null
          published?: boolean | null
          reading_time?: number | null
          season?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_versions_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          audiences: string[]
          author: string
          automation_config_id: string | null
          category: string
          content: string
          content_types: string[]
          description: string | null
          engagement_score: number | null
          excerpt: string
          featured: boolean
          featured_image: string
          id: string
          og_image: string | null
          original_title: string | null
          published: boolean
          published_at: string
          quality_score: number | null
          reading_time: number
          season: string | null
          seo_description: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          status: string
          structured_data: string | null
          tags: string[]
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audiences?: string[]
          author: string
          automation_config_id?: string | null
          category: string
          content: string
          content_types?: string[]
          description?: string | null
          engagement_score?: number | null
          excerpt: string
          featured?: boolean
          featured_image: string
          id?: string
          og_image?: string | null
          original_title?: string | null
          published?: boolean
          published_at?: string
          quality_score?: number | null
          reading_time: number
          season?: string | null
          seo_description: string
          seo_keywords?: string[]
          seo_title: string
          slug: string
          status?: string
          structured_data?: string | null
          tags?: string[]
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audiences?: string[]
          author?: string
          automation_config_id?: string | null
          category?: string
          content?: string
          content_types?: string[]
          description?: string | null
          engagement_score?: number | null
          excerpt?: string
          featured?: boolean
          featured_image?: string
          id?: string
          og_image?: string | null
          original_title?: string | null
          published?: boolean
          published_at?: string
          quality_score?: number | null
          reading_time?: number
          season?: string | null
          seo_description?: string
          seo_keywords?: string[]
          seo_title?: string
          slug?: string
          status?: string
          structured_data?: string | null
          tags?: string[]
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_automation_config_id_fkey"
            columns: ["automation_config_id"]
            isOneToOne: false
            referencedRelation: "content_automation_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_ratings: {
        Row: {
          blog_slug: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          blog_slug: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          blog_slug?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      blog_topic_blacklist: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          topic: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          topic: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          topic?: string
        }
        Relationships: []
      }
      blog_topic_history: {
        Row: {
          context: Json | null
          generated_at: string
          id: string
          reason: string | null
          slug: string
          title: string
          try_count: number | null
          used_in_post: string | null
        }
        Insert: {
          context?: Json | null
          generated_at?: string
          id?: string
          reason?: string | null
          slug: string
          title: string
          try_count?: number | null
          used_in_post?: string | null
        }
        Update: {
          context?: Json | null
          generated_at?: string
          id?: string
          reason?: string | null
          slug?: string
          title?: string
          try_count?: number | null
          used_in_post?: string | null
        }
        Relationships: []
      }
      content_automation_configs: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          yaml_config: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          yaml_config?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          yaml_config?: string | null
        }
        Relationships: []
      }
      content_automation_logs: {
        Row: {
          action: string
          config_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          status: string
        }
        Insert: {
          action: string
          config_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          status: string
        }
        Update: {
          action?: string
          config_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_automation_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "content_automation_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_jobs: {
        Row: {
          conditions: Json | null
          created_at: string
          created_by: string
          cron_expression: string
          dependencies: string[] | null
          description: string | null
          enabled: boolean
          function_name: string
          function_payload: Json | null
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          last_run_at: string | null
          name: string
          next_run_at: string | null
          retry_count: number
          status: Database["public"]["Enums"]["cron_job_status"]
          tags: string[] | null
          timeout_seconds: number
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          created_by: string
          cron_expression: string
          dependencies?: string[] | null
          description?: string | null
          enabled?: boolean
          function_name: string
          function_payload?: Json | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          retry_count?: number
          status?: Database["public"]["Enums"]["cron_job_status"]
          tags?: string[] | null
          timeout_seconds?: number
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          created_by?: string
          cron_expression?: string
          dependencies?: string[] | null
          description?: string | null
          enabled?: boolean
          function_name?: string
          function_payload?: Json | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          retry_count?: number
          status?: Database["public"]["Enums"]["cron_job_status"]
          tags?: string[] | null
          timeout_seconds?: number
          updated_at?: string
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          blog_post_id: string
          caption: string
          created_at: string
          error_message: string | null
          id: string
          image_url: string | null
          instagram_id: string | null
          posted_at: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          blog_post_id: string
          caption: string
          created_at?: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          instagram_id?: string | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          blog_post_id?: string
          caption?: string
          created_at?: string
          error_message?: string | null
          id?: string
          image_url?: string | null
          instagram_id?: string | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_posts_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_execution_logs: {
        Row: {
          completed_at: string | null
          cron_job_id: string
          duration_ms: number | null
          error_message: string | null
          execution_id: string
          id: string
          output: Json | null
          resource_usage: Json | null
          retry_attempt: number
          started_at: string
          status: Database["public"]["Enums"]["job_execution_status"]
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          cron_job_id: string
          duration_ms?: number | null
          error_message?: string | null
          execution_id: string
          id?: string
          output?: Json | null
          resource_usage?: Json | null
          retry_attempt?: number
          started_at?: string
          status?: Database["public"]["Enums"]["job_execution_status"]
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          cron_job_id?: string
          duration_ms?: number | null
          error_message?: string | null
          execution_id?: string
          id?: string
          output?: Json | null
          resource_usage?: Json | null
          retry_attempt?: number
          started_at?: string
          status?: Database["public"]["Enums"]["job_execution_status"]
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_execution_logs_cron_job_id_fkey"
            columns: ["cron_job_id"]
            isOneToOne: false
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          default_cron_expression: string
          default_payload: Json | null
          description: string | null
          function_name: string
          id: string
          is_system_template: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          name: string
          tags: string[] | null
          usage_count: number
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          default_cron_expression: string
          default_payload?: Json | null
          description?: string | null
          function_name: string
          id?: string
          is_system_template?: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          name: string
          tags?: string[] | null
          usage_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          default_cron_expression?: string
          default_payload?: Json | null
          description?: string | null
          function_name?: string
          id?: string
          is_system_template?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          name?: string
          tags?: string[] | null
          usage_count?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed: boolean
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
        }
        Insert: {
          confirmation_token?: string | null
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          confirmation_token?: string | null
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      pipeline_config: {
        Row: {
          auto_publish: boolean
          batch_size: number
          created_at: string
          id: string
          quality_threshold: number
          target_category: string
          updated_at: string
        }
        Insert: {
          auto_publish?: boolean
          batch_size?: number
          created_at?: string
          id?: string
          quality_threshold?: number
          target_category?: string
          updated_at?: string
        }
        Update: {
          auto_publish?: boolean
          batch_size?: number
          created_at?: string
          id?: string
          quality_threshold?: number
          target_category?: string
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_executions: {
        Row: {
          completed_at: string | null
          created_by: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          pipeline_id: string
          results: Json | null
          stages_progress: Json | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          pipeline_id: string
          results?: Json | null
          stages_progress?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          pipeline_id?: string
          results?: Json | null
          stages_progress?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_executions_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "automation_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          custom_role: string | null
          description: string | null
          display_name: string
          id: string
          is_premium: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_role?: string | null
          description?: string | null
          display_name: string
          id: string
          is_premium?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_role?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_premium?: boolean
        }
        Relationships: []
      }
      recipe_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          recipe_id?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_versions: {
        Row: {
          author: string | null
          category: string | null
          cook_time_minutes: number | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: Json | null
          prep_time_minutes: number | null
          recipe_id: string
          season: string | null
          servings: number | null
          status: string | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time_minutes?: number | null
          recipe_id: string
          season?: string | null
          servings?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          author?: string | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time_minutes?: number | null
          recipe_id?: string
          season?: string | null
          servings?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          author: string | null
          category: string | null
          cook_time_minutes: number | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: Json | null
          prep_time_minutes: number | null
          season: string | null
          servings: number | null
          slug: string
          source_blog_slug: string | null
          status: string
          tags: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time_minutes?: number | null
          season?: string | null
          servings?: number | null
          slug: string
          source_blog_slug?: string | null
          status?: string
          tags?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time_minutes?: number | null
          season?: string | null
          servings?: number | null
          slug?: string
          source_blog_slug?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          created_at: string
          id: string
          recipe_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          error_message: string | null
          executed_at: string | null
          function_name: string
          function_payload: Json | null
          id: string
          name: string
          priority: number
          result: Json | null
          scheduled_for: string
          status: Database["public"]["Enums"]["job_execution_status"]
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          error_message?: string | null
          executed_at?: string | null
          function_name: string
          function_payload?: Json | null
          id?: string
          name: string
          priority?: number
          result?: Json | null
          scheduled_for: string
          status?: Database["public"]["Enums"]["job_execution_status"]
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          error_message?: string | null
          executed_at?: string | null
          function_name?: string
          function_payload?: Json | null
          id?: string
          name?: string
          priority?: number
          result?: Json | null
          scheduled_for?: string
          status?: Database["public"]["Enums"]["job_execution_status"]
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_exists: {
        Args: { p_table_name: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          _event_type: string
          _target_user_id?: string
          _details?: Json
          _severity?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      cron_job_status: "active" | "inactive" | "paused" | "error"
      job_execution_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      job_type:
        | "content_generation"
        | "seo_optimization"
        | "performance_analysis"
        | "cleanup"
        | "backup"
        | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      cron_job_status: ["active", "inactive", "paused", "error"],
      job_execution_status: [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      job_type: [
        "content_generation",
        "seo_optimization",
        "performance_analysis",
        "cleanup",
        "backup",
        "custom",
      ],
    },
  },
} as const
