
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface BlogPostsHeaderProps {
  postsCount: number;
  onRefresh: () => void;
}

const BlogPostsHeader: React.FC<BlogPostsHeaderProps> = ({
  postsCount,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Blog-Artikel ({postsCount})</h2>
      <Button onClick={onRefresh} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Aktualisieren
      </Button>
    </div>
  );
};

export default BlogPostsHeader;
