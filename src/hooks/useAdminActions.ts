
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
      const versionTable = type === 'recipe' ? 'recipe_versions' : 'blog_post_versions';

      const { data: current, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      if (current) {
        const user = await supabase.auth.getUser();
        const versionData =
          type === 'recipe'
            ? {
                recipe_id: current.id,
                user_id: user.data.user?.id || current.user_id,
                title: current.title,
                image_url: current.image_url,
                description: current.description,
                ingredients: current.ingredients,
                instructions: current.instructions,
                category: current.category,
                season: current.season,
                tags: current.tags,
                author: current.author,
                prep_time_minutes: current.prep_time_minutes,
                cook_time_minutes: current.cook_time_minutes,
                servings: current.servings,
                difficulty: current.difficulty,
                status: current.status,
              }
            : {
                blog_post_id: current.id,
                user_id: user.data.user?.id || '',
                title: current.title,
                slug: current.slug,
                content: current.content,
                excerpt: current.excerpt,
                category: current.category,
                tags: current.tags,
                content_types: current.content_types,
                season: current.season,
                audiences: current.audiences,
                featured_image: current.featured_image,
                og_image: current.og_image,
                seo_title: current.seo_title,
                seo_description: current.seo_description,
                seo_keywords: current.seo_keywords,
                status: current.status,
                published: current.published,
                featured: current.featured,
                reading_time: current.reading_time,
                author: current.author,
              };
        await supabase.from(versionTable).insert([versionData]);
      }

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
      const versionTable = type === 'recipe' ? 'recipe_versions' : 'blog_post_versions';

      const { data: current, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      if (current) {
        const user = await supabase.auth.getUser();
        const versionData =
          type === 'recipe'
            ? {
                recipe_id: current.id,
                user_id: user.data.user?.id || current.user_id,
                title: current.title,
                image_url: current.image_url,
                description: current.description,
                ingredients: current.ingredients,
                instructions: current.instructions,
                category: current.category,
                season: current.season,
                tags: current.tags,
                author: current.author,
                prep_time_minutes: current.prep_time_minutes,
                cook_time_minutes: current.cook_time_minutes,
                servings: current.servings,
                difficulty: current.difficulty,
                status: current.status,
              }
            : {
                blog_post_id: current.id,
                user_id: user.data.user?.id || '',
                title: current.title,
                slug: current.slug,
                content: current.content,
                excerpt: current.excerpt,
                category: current.category,
                tags: current.tags,
                content_types: current.content_types,
                season: current.season,
                audiences: current.audiences,
                featured_image: current.featured_image,
                og_image: current.og_image,
                seo_title: current.seo_title,
                seo_description: current.seo_description,
                seo_keywords: current.seo_keywords,
                status: current.status,
                published: current.published,
                featured: current.featured,
                reading_time: current.reading_time,
                author: current.author,
              };
        await supabase.from(versionTable).insert([versionData]);
      }

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
