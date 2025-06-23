
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Instagram } from "lucide-react";
import { AdminBlogPost } from "@/types/admin";

interface BlogPostActionsProps {
  post: AdminBlogPost;
  instagramStatus?: string;
  onEdit: (post: AdminBlogPost) => void;
  onInstagramPost: (post: AdminBlogPost) => void;
  onDelete: (id: string) => void;
}

const BlogPostActions: React.FC<BlogPostActionsProps> = ({
  post,
  instagramStatus,
  onEdit,
  onInstagramPost,
  onDelete
}) => {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(post)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onInstagramPost(post)}
        disabled={post.status !== 'veröffentlicht' || instagramStatus === 'posted'}
        title={post.status !== 'veröffentlicht' ? 'Nur für veröffentlichte Artikel' : 'Auf Instagram teilen'}
      >
        <Instagram className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onDelete(post.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BlogPostActions;
