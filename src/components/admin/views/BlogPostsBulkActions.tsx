
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
    <div className="p-4 bg-gray-100 rounded-lg mb-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="mr-auto text-sm font-medium">{selectedCount} Artikel ausgewählt</span>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Verarbeitung läuft...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Bildgenerierung kann mehrere Minuten dauern. 
              Die Verarbeitung erfolgt mit optimierten Delays für bessere Zuverlässigkeit.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default BlogPostsBulkActions;
