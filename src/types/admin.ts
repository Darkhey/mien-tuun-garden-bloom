
export type AdminView = 
  | "recipes" 
  | "blog-posts" 
  | "users" 
  | "ki-recipe" 
  | "ki-blog" 
  | "sowing-calendar" 
  | "security-log"
  | "phase2-dashboard"
  | "phase3-dashboard"
  | "blog-test-dashboard";

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
}

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
