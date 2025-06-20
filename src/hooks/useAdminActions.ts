
import { supabase } from "@/integrations/supabase/client";
import { AdminUser, AdminRecipe, AdminBlogPost } from "@/types/admin";
import type { Database } from "@/integrations/supabase/types";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
import { useToast } from "@/hooks/use-toast";

export const useAdminActions = () => {
  const { toast } = useToast();

  const fetchRecipeById = async (id: string): Promise<RecipeRow | null> => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as RecipeRow | null;
  };

  const fetchBlogPostById = async (id: string): Promise<BlogPostRow | null> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as BlogPostRow | null;
  };

  const createRecipeVersion = async (current: RecipeRow, userId: string | null) => {
    const versionData = {
      recipe_id: current.id,
      user_id: userId || current.user_id || null,
      title: current.title,
      image_url: current.image_url,
      description: current.description,
      ingredients: (current as any).ingredients,
      instructions: (current as any).instructions,
      category: current.category,
      season: current.season,
      tags: (current as any).tags,
      author: current.author,
      prep_time_minutes: current.prep_time_minutes,
      cook_time_minutes: current.cook_time_minutes,
      servings: current.servings,
      difficulty: current.difficulty,
      status: current.status,
    };
    await supabase.from('recipe_versions').insert([versionData]);
  };

  const createBlogPostVersion = async (current: BlogPostRow, userId: string | null) => {
    const versionData = {
      blog_post_id: current.id,
      user_id: userId || null,
      title: current.title,
      slug: current.slug,
      content: current.content || '',
      excerpt: current.excerpt || '',
      category: current.category,
      tags: current.tags || [],
      content_types: current.content_types || [],
      season: current.season || null,
      audiences: current.audiences || [],
      featured_image: current.featured_image || '',
      og_image: current.og_image || '',
      seo_title: current.seo_title || '',
      seo_description: current.seo_description || '',
      seo_keywords: current.seo_keywords || [],
      status: current.status,
      published: current.published || false,
      featured: current.featured || false,
      reading_time: current.reading_time || 0,
      author: current.author,
    };
    await supabase.from('blog_post_versions').insert([versionData]);
  };

  const handleTogglePremium = async (
    userId: string, 
    isPremium: boolean, 
    users: AdminUser[], 
    setUsers: (users: AdminUser[]) => void
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: !isPremium })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_premium: !isPremium }
          : user
      ));

      toast({
        title: "Status aktualisiert",
        description: `Premium-Status wurde ${!isPremium ? 'aktiviert' : 'deaktiviert'}`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (
    userId: string,
    users: AdminUser[],
    setUsers: (users: AdminUser[]) => void
  ) => {
    try {
      // Log security event first mit der vorhandenen Funktion
      await supabase.rpc('log_security_event', {
        _event_type: 'user_deleted',
        _target_user_id: userId,
        _details: { deleted_by_admin: true },
        _severity: 'high'
      });

      // Delete user using admin API
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      // Update local state
      setUsers(users.filter(user => user.id !== userId));

      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const logVersionChange = async (itemId: string, itemType: 'recipe' | 'blog', oldStatus: string, newStatus: string) => {
    try {
      await supabase.rpc('log_security_event', {
        _event_type: `${itemType}_status_changed`,
        _target_user_id: null,
        _details: { 
          item_id: itemId, 
          old_status: oldStatus, 
          new_status: newStatus,
          changed_by: 'admin'
        },
        _severity: 'medium'
      });
    } catch (error) {
      console.warn('Sicherheitsereignis konnte nicht protokolliert werden:', error);
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: string,
    type: 'recipe' | 'blog',
    recipes: AdminRecipe[],
    blogPosts: AdminBlogPost[],
    setRecipes: (recipes: AdminRecipe[]) => void,
    setBlogPosts: (posts: AdminBlogPost[]) => void
  ) => {
    const newStatus = currentStatus === 'veröffentlicht' ? 'entwurf' : 'veröffentlicht';

    try {
      const current = type === 'recipe' ? await fetchRecipeById(id) : await fetchBlogPostById(id);
      const user = await supabase.auth.getUser();

      if (current) {
        if (type === 'recipe') {
          await createRecipeVersion(current as RecipeRow, user.data.user?.id || null);
        } else {
          await createBlogPostVersion(current as BlogPostRow, user.data.user?.id || null);
        }
      }
      const table = type === 'recipe' ? 'recipes' : 'blog_posts';

      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Log das Sicherheitsereignis
      await logVersionChange(id, type, currentStatus, newStatus);

      if (type === 'recipe') {
        setRecipes(recipes.map(recipe => 
          recipe.id === id 
            ? { ...recipe, status: newStatus }
            : recipe
        ));
      } else {
        setBlogPosts(blogPosts.map(post => 
          post.id === id 
            ? { ...post, status: newStatus }
            : post
        ));
      }

      toast({
        title: "Status aktualisiert",
        description: `Status wurde auf "${newStatus}" geändert`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (
    id: string,
    type: 'recipe' | 'blog',
    recipes: AdminRecipe[],
    blogPosts: AdminBlogPost[],
    setRecipes: (recipes: AdminRecipe[]) => void,
    setBlogPosts: (posts: AdminBlogPost[]) => void
  ) => {
    if (!confirm(`Möchten Sie diesen ${type === 'recipe' ? 'Rezept' : 'Artikel'} wirklich löschen?`)) {
      return;
    }

    try {
      const current = type === 'recipe' ? await fetchRecipeById(id) : await fetchBlogPostById(id);
      const user = await supabase.auth.getUser();

      if (current) {
        if (type === 'recipe') {
          await createRecipeVersion(current as RecipeRow, user.data.user?.id || null);
        } else {
          await createBlogPostVersion(current as BlogPostRow, user.data.user?.id || null);
        }
      }

      const table = type === 'recipe' ? 'recipes' : 'blog_posts';

      // Log das Löschereignis
      await supabase.rpc('log_security_event', {
        _event_type: `${type}_deleted`,
        _target_user_id: null,
        _details: { 
          item_id: id, 
          title: current?.title || 'Unbekannt',
          deleted_by: 'admin'
        },
        _severity: 'high'
      });

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (type === 'recipe') {
        setRecipes(recipes.filter(recipe => recipe.id !== id));
      } else {
        setBlogPosts(blogPosts.filter(post => post.id !== id));
      }

      toast({
        title: "Gelöscht",
        description: `${type === 'recipe' ? 'Rezept' : 'Artikel'} wurde gelöscht`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    handleTogglePremium,
    handleDeleteUser,
    handleToggleStatus,
    handleDelete
  };
};
