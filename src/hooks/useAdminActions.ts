
import { supabase } from "@/integrations/supabase/client";
import { AdminUser, AdminRecipe, AdminBlogPost } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";

export const useAdminActions = () => {
  const { toast } = useToast();

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
      const table = type === 'recipe' ? 'recipes' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

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
      const table = type === 'recipe' ? 'recipes' : 'blog_posts';
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
    handleToggleStatus,
    handleDelete
  };
};
