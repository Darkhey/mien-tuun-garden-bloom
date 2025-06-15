import React, { useEffect, useState } from "react";
import { Loader2, Edit, Trash2, Eye, EyeOff, Plus, BookOpen, FileText, Users, Sparkles, Calendar, Shield } from "lucide-react";
import KIRecipeCreator from "@/components/admin/KIRecipeCreator";
import KIBlogCreator from "@/components/admin/KIBlogCreator";
import { supabase } from "@/integrations/supabase/client";
import EditRecipeModal from "@/components/admin/EditRecipeModal";
import EditBlogPostModal from "@/components/admin/EditBlogPostModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import SowingCalendar from "@/components/admin/SowingCalendar";
import SecurityAuditLog from "@/components/admin/SecurityAuditLog";

interface AdminUser {
  id: string;
  display_name: string;
  email?: string;
  is_premium: boolean;
  custom_role?: string | null;
  created_at: string;
}

interface Recipe {
  id: string;
  title: string;
  slug: string;
  status: string;
  author: string;
  created_at: string;
  difficulty?: string;
  category?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  author: string;
  published_at: string;
  category: string;
  featured: boolean;
}

type AdminView = "users" | "recipes" | "blog-posts" | "ki-recipe" | "ki-blog" | "sowing-calendar" | "security-log";

const menuItems: { group: string; items: { key: AdminView; label: string; icon: React.ElementType }[] }[] = [
  {
    group: "Verwaltung",
    items: [
      { key: "recipes", label: "Rezepte", icon: BookOpen },
      { key: "blog-posts", label: "Blog-Artikel", icon: FileText },
      { key: "users", label: "Nutzer", icon: Users },
    ],
  },
  {
    group: "KI-Tools",
    items: [
      { key: "ki-recipe", label: "KI-Rezept erstellen", icon: Sparkles },
      { key: "ki-blog", label: "KI-Artikel erstellen", icon: Sparkles },
    ],
  },
  {
    group: "Weitere Tools",
    items: [
      { key: "sowing-calendar", label: "Aussaatkalender", icon: Calendar },
      { key: "security-log", label: "Sicherheits-Log", icon: Shield },
    ],
  },
];

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("recipes");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
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
          else setUsers(data || []);
          setLoading(false);
        });
    } else if (activeView === "recipes") {
      supabase
        .from("recipes")
        .select("id, title, slug, status, author, created_at, difficulty, category")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else setRecipes(data || []);
          setLoading(false);
        });
    } else if (activeView === "blog-posts") {
      supabase
        .from("blog_posts")
        .select("id, title, slug, status, author, published_at, category, featured")
        .order("published_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else setBlogPosts(data || []);
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
            {activeView === "users" && (
              <>
                <PageTitle />
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin mr-2" /> Nutzer werden geladen...
                  </div>
                ) : error ? (
                  <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Custom-Rolle</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.display_name}</TableCell>
                          <TableCell>{user.custom_role || "-"}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={user.is_premium ? "default" : "outline"}
                              onClick={() => handleToggleUserPremium(user.id, user.is_premium)}
                            >
                              {user.is_premium ? "Premium" : "Standard"}
                            </Button>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString('de-DE')}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {activeView === "recipes" && (
              <>
                <PageTitle />
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin mr-2" /> Rezepte werden geladen...
                  </div>
                ) : error ? (
                  <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Schwierigkeit</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipes.map(recipe => (
                        <TableRow key={recipe.id}>
                          <TableCell className="font-medium">{recipe.title}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={recipe.status === "veröffentlicht" ? "default" : "outline"}
                              onClick={() => handleToggleRecipeStatus(recipe.id, recipe.status)}
                            >
                              {recipe.status === "veröffentlicht" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              {recipe.status}
                            </Button>
                          </TableCell>
                          <TableCell>{recipe.author}</TableCell>
                          <TableCell>{recipe.category || "-"}</TableCell>
                          <TableCell>{recipe.difficulty || "-"}</TableCell>
                          <TableCell>{new Date(recipe.created_at).toLocaleDateString('de-DE')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditRecipe(recipe)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRecipe(recipe.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {activeView === "blog-posts" && (
              <>
                <PageTitle />
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin mr-2" /> Blog-Artikel werden geladen...
                  </div>
                ) : error ? (
                  <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Veröffentlicht</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.map(post => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={post.status === "veröffentlicht" ? "default" : "outline"}
                              onClick={() => handleToggleBlogStatus(post.id, post.status)}
                            >
                              {post.status === "veröffentlicht" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              {post.status}
                            </Button>
                          </TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>{post.category}</TableCell>
                          <TableCell>{post.featured ? "Ja" : "Nein"}</TableCell>
                          <TableCell>{new Date(post.published_at).toLocaleDateString('de-DE')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditBlogPost(post)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteBlogPost(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {activeView === "ki-recipe" && <KIRecipeCreator />}
            {activeView === "ki-blog" && <KIBlogCreator />}
            {activeView === "sowing-calendar" && <SowingCalendar />}
            {activeView === "security-log" && <SecurityAuditLog />}
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
