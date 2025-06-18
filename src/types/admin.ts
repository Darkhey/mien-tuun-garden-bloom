export type AdminView = 
  | "recipes" 
  | "blog-posts" 
  | "users" 
  | "ki-recipe" 
  | "ki-blog" 
  | "sowing-calendar" 
  | "security-log"
  | "content-strategy"
  | "automatisierung"
  | "automation"
  | "phase2"
  | "phase3"
  | "security"
  | "blog-testing"
  | "system-diagnostics"
  | "ki-recipe-creator"
  | "ki-blog-creator"
  | "scheduled-jobs"
  | "content-automation";

export interface AdminMenuItem {
  key: AdminView;
  label: string;
  icon: React.ElementType;
}

export interface MenuGroup {
  group: string;
  items: AdminMenuItem[];
}

export interface AdminUser {
  id: string;
  display_name: string;
  email?: string;
  is_premium: boolean;
  custom_role?: string | null;
  description?: string | null;
  created_at: string;
}

export interface AdminRecipe {
  id: string;
  title: string;
  slug: string;
  status: string;
  author: string;
  created_at: string;
  difficulty?: string;
  category?: string;
  description?: string;
  season?: string;
  servings?: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  image_url?: string;
}

export type RecipeFormData = {
  title: string;
  description: string;
  category: string;
  season: string;
  difficulty: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  image_url: string;
  status: string;
};

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  author: string;
  published_at: string;
  category: string;
  featured: boolean;
}