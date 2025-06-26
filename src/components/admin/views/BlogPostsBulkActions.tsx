
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle, Zap } from "lucide-react";
import BatchProgressDisplay from './BatchProgressDisplay';
import { BatchProgress } from "@/services/AIImageGenerationService";

interface BlogPostsBulkActionsProps {
  selectedCount: number;
  onOptimizeTitles: () => void;
  onGenerateImages: () => void;
  onClear: () => void;
  onCancel: () => void;
  loading: boolean;
  progress?: number;
  batchProgress?: BatchProgress;
}

const BlogPostsBulkActions: React.FC<BlogPostsBulkActionsProps> = ({
  selectedCount,
  onOptimizeTitles,
  onGenerateImages,
  onClear,
  onCancel,
  loading,
  progress,
  batchProgress
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
          <Zap className="h-4 w-4 mr-1" />
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
      
      {/* Enhanced Batch Progress Display */}
      {batchProgress && (
        <BatchProgressDisplay 
          progress={batchProgress} 
          isActive={loading} 
        />
      )}

      {/* Fallback for old progress system */}
      {loading && !batchProgress && progress !== undefined && (
        <div className="space-y-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Bildgenerierung läuft mit 3 parallelen Prozessen. 
              Optimierte Verzögerung zwischen Anfragen für bessere Zuverlässigkeit.
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800">
              <strong>Wichtiger Hinweis:</strong> Bei Fehlern werden automatisch Fallback-Bilder verwendet. 
              Der Vorgang läuft auch bei einzelnen Fehlern weiter.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default BlogPostsBulkActions;
