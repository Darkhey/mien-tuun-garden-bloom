
import React, { useEffect, useState } from "react";
import KIRecipeCreator from "@/components/admin/KIRecipeCreator";
import KIBlogCreator from "@/components/admin/KIBlogCreator";
import { supabase } from "@/integrations/supabase/client";
import EditRecipeModal from "@/components/admin/EditRecipeModal";
import EditBlogPostModal from "@/components/admin/EditBlogPostModal";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import SowingCalendar from "@/components/admin/SowingCalendar";
import SecurityAuditLog from "@/components/admin/SecurityAuditLog";
import { AdminView, AdminUser, AdminRecipe, AdminBlogPost } from "@/types/admin";
import { menuItems } from "@/config/adminMenu";
import UsersView from "@/components/admin/views/UsersView";
import RecipesView from "@/components/admin/views/RecipesView";
import BlogPostsView from "@/components/admin/views/BlogPostsView";

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("recipes");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editRecipe, setEditRecipe] = useState<any | null>(null);
  const [editBlogPost, setEditBlogPost] = useState<any | null>(null);
  const { toast } = useToast();

  // Load data based on active tab
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (activeView === "users") {
      supabase
        .from("profiles")
        .select("id, display_name, is_premium, custom_role, created_at")
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else setUsers((data as AdminUser[]) || []);
          setLoading(false);
        });
    } else if (activeView === "recipes") {
      supabase
        .from("recipes")
        .select("id, title, slug, status, author, created_at, difficulty, category")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else setRecipes((data as AdminRecipe[]) || []);
          setLoading(false);
        });
    } else if (activeView === "blog-posts") {
      supabase
        .from("blog_posts")
        .select("id, title, slug, status, author, published_at, category, featured")
        .order("published_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else setBlogPosts((data as AdminBlogPost[]) || []);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [activeView]);

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm("Rezept wirklich löschen?")) return;
    
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Erfolg", description: "Rezept gelöscht" });
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm("Blog-Artikel wirklich löschen?")) return;
    
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Erfolg", description: "Blog-Artikel gelöscht" });
      setBlogPosts(blogPosts.filter(p => p.id !== id));
    }
  };

  const handleToggleRecipeStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "veröffentlicht" ? "entwurf" : "veröffentlicht";
    const { error } = await supabase
      .from("recipes")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Erfolg", description: `Status zu "${newStatus}" geändert` });
      setRecipes(recipes.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  const handleToggleBlogStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "veröffentlicht" ? "entwurf" : "veröffentlicht";
    const { error } = await supabase
      .from("blog_posts")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Erfolg", description: `Status zu "${newStatus}" geändert` });
      setBlogPosts(blogPosts.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  const handleToggleUserPremium = async (id: string, isPremium: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: !isPremium })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Erfolg", description: `Premium-Status geändert` });
      setUsers(users.map(u => u.id === id ? { ...u, is_premium: !isPremium } : u));
    }
  };

  const PageTitle = () => {
    const title = menuItems.flatMap(g => g.items).find(i => i.key === activeView)?.label || "Dashboard";
    return <h2 className="text-xl font-semibold mb-4">{title}</h2>;
  };
  
  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UsersView users={users} loading={loading} error={error} onTogglePremium={handleToggleUserPremium} />;
      case "recipes":
        return <RecipesView recipes={recipes} loading={loading} error={error} onToggleStatus={handleToggleRecipeStatus} onDelete={handleDeleteRecipe} onEdit={setEditRecipe} />;
      case "blog-posts":
        return <BlogPostsView posts={blogPosts} loading={loading} error={error} onToggleStatus={handleToggleBlogStatus} onDelete={handleDeleteBlogPost} onEdit={setEditBlogPost} />;
      case "ki-recipe":
        return <KIRecipeCreator />;
      case "ki-blog":
        return <KIBlogCreator />;
      case "sowing-calendar":
        return <SowingCalendar />;
      case "security-log":
        return <SecurityAuditLog />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-xl font-semibold p-2">Admin Menü</h2>
          </SidebarHeader>
          <SidebarContent>
            {menuItems.map((group) => (
              <SidebarGroup key={group.group}>
                <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton onClick={() => setActiveView(item.key)} isActive={activeView === item.key}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="flex items-center gap-4 p-4 border-b lg:h-[68px]">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </header>

          <div className="flex-1 p-4 md:p-6">
            <PageTitle />
            {renderContent()}
          </div>
        </main>
        
        {editRecipe && (
          <EditRecipeModal
            recipe={editRecipe}
            onClose={() => setEditRecipe(null)}
            onSaved={() => {
              setEditRecipe(null);
              // Refresh recipes list
              setActiveView("recipes");
            }}
          />
        )}
        {editBlogPost && (
          <EditBlogPostModal
            post={editBlogPost}
            onClose={() => setEditBlogPost(null)}
            onSaved={() => {
              setEditBlogPost(null);
              // Refresh blog posts list
              setActiveView("blog-posts");
            }}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
