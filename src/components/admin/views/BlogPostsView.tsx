import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { AdminBlogPost } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditBlogPostModal from "../EditBlogPostModal";

const BlogPostsView: React.FC = () => {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const { toast } = useToast();

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      console.log("[BlogPostsView] Loading blog posts...");
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, status, author, published_at, category, featured')
        .order('published_at', { ascending: false });

      if (error) throw error;

      const transformedPosts: AdminBlogPost[] = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status || 'entwurf',
        author: post.author,
        published_at: post.published_at,
        category: post.category,
        featured: post.featured || false,
      }));

      setPosts(transformedPosts);
      console.log(`[BlogPostsView] Loaded ${transformedPosts.length} blog posts`);
    } catch (error: any) {
      console.error("[BlogPostsView] Error loading blog posts:", error);
      setError(error.message);
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'veröffentlicht' ? 'entwurf' : 'veröffentlicht';
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: newStatus,
          published: newStatus === 'veröffentlicht'
        })
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.map(post => 
        post.id === id 
          ? { ...post, status: newStatus }
          : post
      ));

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

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== id));

      toast({
        title: "Gelöscht",
        description: "Artikel wurde gelöscht",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: AdminBlogPost) => {
    setEditingPost(post);
  };

  useEffect(() => {
    loadBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin mr-2" /> Blog-Artikel werden geladen...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Blog-Artikel ({posts.length})</h2>
          <Button onClick={loadBlogPosts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>

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
            {posts.map(post => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={post.status === "veröffentlicht" ? "default" : "outline"}
                    onClick={() => handleToggleStatus(post.id, post.status)}
                  >
                    {post.status === "veröffentlicht" ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
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
                      onClick={() => handleEdit(post)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingPost && (
        <EditBlogPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            setEditingPost(null);
            loadBlogPosts();
          }}
        />
      )}
    </>
  );
};

export default BlogPostsView;