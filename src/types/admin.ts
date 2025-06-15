
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

export type AdminView = "users" | "recipes" | "blog-posts" | "ki-recipe" | "ki-blog" | "sowing-calendar" | "security-log";
