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
      blog_posts: {
        Row: {
          audiences: string[]
          author: string
          category: string
          content: string
          content_types: string[]
          excerpt: string
          featured: boolean
          featured_image: string
          id: string
          og_image: string | null
          original_title: string | null
          published: boolean
          published_at: string
          reading_time: number
          seo_description: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          structured_data: string | null
          tags: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          audiences?: string[]
          author: string
          category: string
          content: string
          content_types?: string[]
          excerpt: string
          featured?: boolean
          featured_image: string
          id?: string
          og_image?: string | null
          original_title?: string | null
          published?: boolean
          published_at?: string
          reading_time: number
          seo_description: string
          seo_keywords?: string[]
          seo_title: string
          slug: string
          structured_data?: string | null
          tags?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          audiences?: string[]
          author?: string
          category?: string
          content?: string
          content_types?: string[]
          excerpt?: string
          featured?: boolean
          featured_image?: string
          id?: string
          og_image?: string | null
          original_title?: string | null
          published?: boolean
          published_at?: string
          reading_time?: number
          seo_description?: string
          seo_keywords?: string[]
          seo_title?: string
          slug?: string
          structured_data?: string | null
          tags?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          custom_role: string | null
          display_name: string
          id: string
          is_premium: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_role?: string | null
          display_name: string
          id: string
          is_premium?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_role?: string | null
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
