
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { AdminView, AdminUser, AdminRecipe, AdminBlogPost } from "@/types/admin";
import { menuItems } from "@/config/adminMenu";
import { useToast } from "@/hooks/use-toast";

// Import components
import RecipesView from "@/components/admin/views/RecipesView";
import BlogPostsView from "@/components/admin/views/BlogPostsView";
import UsersView from "@/components/admin/views/UsersView";
import KIRecipeCreator from "@/components/admin/KIRecipeCreator";
import KIBlogCreator from "@/components/admin/KIBlogCreator";
import SowingCalendar from "@/components/admin/SowingCalendar";
import SecurityAuditLog from "@/components/admin/SecurityAuditLog";
import Phase2Dashboard from "@/components/admin/Phase2Dashboard";
import Phase3Dashboard from "@/components/admin/Phase3Dashboard";
import BlogSystemTestDashboard from "@/components/admin/BlogSystemTestDashboard";

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("recipes");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Data states
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUserEmail();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeView]);

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
          // Keine Daten für andere Views
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

  const handleTogglePremium = async (userId: string, isPremium: boolean) => {
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

  const handleToggleStatus = async (id: string, currentStatus: string, type: 'recipe' | 'blog') => {
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

  const handleDelete = async (id: string, type: 'recipe' | 'blog') => {
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

  const renderContent = () => {
    switch (activeView) {
      case "recipes":
        return (
          <RecipesView 
            recipes={recipes}
            loading={loading}
            error={dataError}
            onToggleStatus={(id, status) => handleToggleStatus(id, status, 'recipe')}
            onEdit={(recipe) => console.log('Edit recipe:', recipe)}
            onDelete={(id) => handleDelete(id, 'recipe')}
          />
        );
      case "blog-posts":
        return (
          <BlogPostsView 
            posts={blogPosts}
            loading={loading}
            error={dataError}
            onToggleStatus={(id, status) => handleToggleStatus(id, status, 'blog')}
            onEdit={(post) => console.log('Edit post:', post)}
            onDelete={(id) => handleDelete(id, 'blog')}
          />
        );
      case "users":
        return (
          <UsersView 
            users={users}
            loading={loading}
            error={dataError}
            onTogglePremium={handleTogglePremium}
          />
        );
      case "ki-recipe":
        return <KIRecipeCreator />;
      case "ki-blog":
        return <KIBlogCreator />;
      case "sowing-calendar":
        return <SowingCalendar />;
      case "security-log":
        return <SecurityAuditLog />;
      case "phase2-dashboard":
        return <Phase2Dashboard />;
      case "phase3-dashboard":
        return <Phase3Dashboard />;
      case "blog-test-dashboard":
        return <BlogSystemTestDashboard />;
      default:
        return (
          <RecipesView 
            recipes={recipes}
            loading={loading}
            error={dataError}
            onToggleStatus={(id, status) => handleToggleStatus(id, status, 'recipe')}
            onEdit={(recipe) => console.log('Edit recipe:', recipe)}
            onDelete={(id) => handleDelete(id, 'recipe')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Verwalte deine Website und Inhalte</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              Admin: {userEmail}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {menuItems.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {group.group}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.key}
                            variant={activeView === item.key ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveView(item.key)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Button>
                        );
                      })}
                    </div>
                    {groupIndex < menuItems.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
