import React from 'react';
import { Button } from "@/components/ui/button";

interface BlogPostsBulkActionsProps {
  selectedCount: number;
  onOptimizeTitles: () => void;
  onGenerateImages: () => void;
  onClear: () => void;
  loading: boolean;
}

const BlogPostsBulkActions: React.FC<BlogPostsBulkActionsProps> = ({
  selectedCount,
  onOptimizeTitles,
  onGenerateImages,
  onClear,
  loading
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-lg flex items-center gap-2 mb-4">
      <span className="mr-auto text-sm">{selectedCount} Artikel ausgewählt</span>
      <Button size="sm" onClick={onOptimizeTitles} disabled={loading}>
        Titel optimieren
      </Button>
      <Button size="sm" onClick={onGenerateImages} disabled={loading}>
        Bilder generieren
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} disabled={loading}>
        Auswahl aufheben
      </Button>
    </div>
  );
};

export default BlogPostsBulkActions;
