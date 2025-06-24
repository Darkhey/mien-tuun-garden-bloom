
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { AdminBlogPost } from "@/types/admin";
import BlogPostActions from './BlogPostActions';

interface BlogPostsTableProps {
  posts: AdminBlogPost[];
  instagramStatuses: { [key: string]: string };
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (visiblePosts: AdminBlogPost[]) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (post: AdminBlogPost) => void;
  onInstagramPost: (post: AdminBlogPost) => void;
  onDelete: (id: string) => void;
}

const BlogPostsTable: React.FC<BlogPostsTableProps> = ({
  posts,
  instagramStatuses,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onToggleStatus,
  onEdit,
  onInstagramPost,
  onDelete
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <input
              type="checkbox"
              checked={posts.length > 0 && posts.every(p => selectedIds.includes(p.id))}
              onChange={() => onToggleSelectAll(posts)}
            />
          </TableHead>
          <TableHead>Titel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Autor</TableHead>
          <TableHead>Kategorie</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Instagram</TableHead>
          <TableHead>Veröffentlicht</TableHead>
          <TableHead>Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map(post => (
          <TableRow key={post.id}>
            <TableCell>
              <input
                type="checkbox"
                checked={selectedIds.includes(post.id)}
                onChange={() => onToggleSelect(post.id)}
              />
            </TableCell>
            <TableCell className="font-medium">{post.title}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant={post.status === "veröffentlicht" ? "default" : "outline"}
                onClick={() => onToggleStatus(post.id, post.status)}
              >
                {post.status === "veröffentlicht" ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {post.status}
              </Button>
            </TableCell>
            <TableCell>{post.author}</TableCell>
            <TableCell>{post.category}</TableCell>
            <TableCell>{post.featured ? "Ja" : "Nein"}</TableCell>
            <TableCell>
              {instagramStatuses[post.id] ? (
                <span className="text-green-600 text-sm">Geteilt</span>
              ) : (
                <span className="text-gray-400 text-sm">Nicht geteilt</span>
              )}
            </TableCell>
            <TableCell>{new Date(post.published_at).toLocaleDateString('de-DE')}</TableCell>
            <TableCell>
              <BlogPostActions
                post={post}
                instagramStatus={instagramStatuses[post.id]}
                onEdit={onEdit}
                onInstagramPost={onInstagramPost}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BlogPostsTable;
