
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminView, AdminUser, AdminRecipe, AdminBlogPost } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";

export const useAdminData = (activeView: AdminView) => {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRecipes = async () => {
    console.log("[AdminDashboard] Lade Rezepte...");
    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, slug, status, author, created_at, difficulty, category')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const transformedRecipes: AdminRecipe[] = (data || []).map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      status: recipe.status || 'entwurf',
      author: recipe.author || 'Unbekannt',
      created_at: recipe.created_at,
      difficulty: recipe.difficulty,
      category: recipe.category
    }));

    setRecipes(transformedRecipes);
    console.log(`[AdminDashboard] ${transformedRecipes.length} Rezepte geladen`);
  };

  const loadBlogPosts = async () => {
    console.log("[AdminDashboard] Lade Blog-Artikel...");
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, status, author, published_at, category, featured')
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const transformedPosts: AdminBlogPost[] = (data || []).map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status || 'entwurf',
      author: post.author,
      published_at: post.published_at,
      category: post.category,
      featured: post.featured || false
    }));

    setBlogPosts(transformedPosts);
    console.log(`[AdminDashboard] ${transformedPosts.length} Blog-Artikel geladen`);
  };

  const loadUsers = async () => {
    console.log("[AdminDashboard] Lade Benutzer...");
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, created_at, custom_role, is_premium')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const transformedUsers: AdminUser[] = (data || []).map(user => ({
      id: user.id,
      display_name: user.display_name,
      is_premium: user.is_premium,
      custom_role: user.custom_role,
      created_at: user.created_at
    }));

    setUsers(transformedUsers);
    console.log(`[AdminDashboard] ${transformedUsers.length} Benutzer geladen`);
  };

  const loadData = async () => {
    setLoading(true);
    setDataError(null);

    try {
      console.log(`[AdminDashboard] Lade Daten für View: ${activeView}`);

      switch (activeView) {
        case "recipes":
          await loadRecipes();
          break;
        case "blog-posts":
          await loadBlogPosts();
          break;
        case "users":
          await loadUsers();
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.error(`[AdminDashboard] Fehler beim Laden der Daten:`, error);
      setDataError(error.message);
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeView]);

  return {
    recipes,
    blogPosts,
    users,
    loading,
    dataError,
    setRecipes,
    setBlogPosts,
    setUsers,
    loadData
  };
};
