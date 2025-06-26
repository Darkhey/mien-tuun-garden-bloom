
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Clock, Image, AlertTriangle } from "lucide-react";
import { BatchProgress, BatchImageResult } from "@/services/AIImageGenerationService";

interface BatchProgressDisplayProps {
  progress: BatchProgress;
  isActive: boolean;
}

const BatchProgressDisplay: React.FC<BatchProgressDisplayProps> = ({
  progress,
  isActive
}) => {
  const getStatusIcon = (result: BatchImageResult) => {
    switch (result.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round(((progress.completed + progress.failed) / progress.total) * 100);
  };

  if (!isActive) return null;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Batch-Verarbeitung ({progress.completed + progress.failed}/{progress.total})</span>
          <span className="text-gray-600">{getProgressPercentage()}%</span>
        </div>
        <Progress value={getProgressPercentage()} className="h-3" />
        
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 text-blue-500" />
            {progress.inProgress} läuft
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {progress.completed} abgeschlossen
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            {progress.failed} fehlgeschlagen
          </span>
        </div>
      </div>

      {/* Concurrent Processing Info */}
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription className="text-xs">
          <strong>3 parallele Prozesse aktiv:</strong> Optimierte Verarbeitung mit intelligenter Rate-Limiting. 
          Jeder Prozess arbeitet mit eigenständigen Verzögerungen für maximale Zuverlässigkeit.
        </AlertDescription>
      </Alert>

      {/* Individual Results */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {progress.results.map((result) => (
          <div key={result.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {getStatusIcon(result)}
            </div>
            
            {/* Thumbnail */}
            {result.thumbnailUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={result.thumbnailUrl} 
                  alt="Generated thumbnail"
                  className="w-12 h-12 rounded object-cover border"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium truncate">{result.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {result.status === 'processing' && (
                  <span className="text-blue-600">Wird verarbeitet...</span>
                )}
                {result.status === 'completed' && (
                  <>
                    <Image className="h-3 w-3" />
                    <span className="text-green-600">
                      Bild generiert {result.model && `(${result.model})`}
                    </span>
                  </>
                )}
                {result.status === 'failed' && (
                  <span className="text-red-600">Fehler: {result.error}</span>
                )}
                {result.warning && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{result.warning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchProgressDisplay;
