import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BlogPostsBulkActionsProps {
  selectedCount: number;
  onOptimizeTitles: () => void;
  onGenerateImages: () => void;
  onClear: () => void;
  onCancel: () => void;
  loading: boolean;
  progress: number;
}

const BlogPostsBulkActions: React.FC<BlogPostsBulkActionsProps> = ({
  selectedCount,
  onOptimizeTitles,
  onGenerateImages,
  onClear,
  onCancel,
  loading,
  progress
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <span className="mr-auto text-sm">{selectedCount} Artikel ausgewählt</span>
        <Button size="sm" onClick={onOptimizeTitles} disabled={loading}>
          Titel optimieren
        </Button>
        <Button size="sm" onClick={onGenerateImages} disabled={loading}>
          Bilder generieren
        </Button>
        {loading ? (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Abbrechen
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Auswahl aufheben
          </Button>
        )}
      </div>
      {loading && (
        <Progress value={progress} className="h-1 mt-2" />
      )}
    </div>
  );
};

export default BlogPostsBulkActions;

