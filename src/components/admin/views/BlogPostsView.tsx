
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { AdminBlogPost } from "@/types/admin";

interface BlogPostsViewProps {
  posts: AdminBlogPost[];
  loading: boolean;
  error: string | null;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (post: AdminBlogPost) => void;
}

const BlogPostsView: React.FC<BlogPostsViewProps> = ({ posts, loading, error, onToggleStatus, onDelete, onEdit }) => {
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
                onClick={() => onToggleStatus(post.id, post.status)}
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
                  onClick={() => onEdit?.(post)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BlogPostsView;
