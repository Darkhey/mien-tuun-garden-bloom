
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Info, 
  AlertTriangle, 
  Zap, 
  FileText, 
  Image, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { OptimizationBatch } from "@/services/OptimizationTrackingService";
import OptimizationStatusPanel from './OptimizationStatusPanel';

interface EnhancedBlogPostsBulkActionsProps {
  selectedCount: number;
  onOptimizeTitles: () => void;
  onGenerateImages: () => void;
  onClear: () => void;
  onCancel: () => void;
  loading: boolean;
  currentBatch?: OptimizationBatch;
  recentOptimizations?: {
    titles: number;
    images: number;
    totalSuccessful: number;
    totalFailed: number;
  };
}

const EnhancedBlogPostsBulkActions: React.FC<EnhancedBlogPostsBulkActionsProps> = ({
  selectedCount,
  onOptimizeTitles,
  onGenerateImages,
  onClear,
  onCancel,
  loading,
  currentBatch,
  recentOptimizations
}) => {
  const [showStatusPanel, setShowStatusPanel] = useState(false);

  if (selectedCount === 0 && !currentBatch && !recentOptimizations) return null;

  const getProgressPercentage = () => {
    if (!currentBatch) return 0;
    return Math.round(((currentBatch.completedItems + currentBatch.failedItems) / currentBatch.totalItems) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Selection and Actions */}
      {selectedCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  {selectedCount} Artikel ausgewählt
                </Badge>
                
                {recentOptimizations && (recentOptimizations.totalSuccessful > 0 || recentOptimizations.totalFailed > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStatusPanel(true)}
                    className="text-xs flex items-center gap-1"
                  >
                    <BarChart3 className="h-3 w-3" />
                    Status anzeigen
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={onOptimizeTitles} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Titel optimieren
                </Button>
                <Button 
                  size="sm" 
                  onClick={onGenerateImages} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Optimizations Summary */}
      {recentOptimizations && (recentOptimizations.totalSuccessful > 0 || recentOptimizations.totalFailed > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Letzte Optimierungen
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusPanel(true)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Details anzeigen
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{recentOptimizations.titles}</p>
                  <p className="text-xs text-gray-500">Titel optimiert</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{recentOptimizations.images}</p>
                  <p className="text-xs text-gray-500">Bilder generiert</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{recentOptimizations.totalSuccessful}</p>
                  <p className="text-xs text-gray-500">Erfolgreich</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">{recentOptimizations.totalFailed}</p>
                  <p className="text-xs text-gray-500">Fehlgeschlagen</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Batch Progress */}
      {currentBatch && currentBatch.status === 'running' && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-2">
                  {currentBatch.type === 'title' ? (
                    <>
                      <FileText className="h-4 w-4" />
                      Titel-Optimierung läuft...
                    </>
                  ) : (
                    <>
                      <Image className="h-4 w-4" />
                      Bild-Generierung läuft...
                    </>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {currentBatch.completedItems + currentBatch.failedItems}/{currentBatch.totalItems}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStatusPanel(true)}
                    className="text-xs"
                  >
                    Details
                  </Button>
                </div>
              </div>
              
              <Progress value={getProgressPercentage()} className="h-3" />
              
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-500" />
                  {currentBatch.totalItems - currentBatch.completedItems - currentBatch.failedItems} wartend
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {currentBatch.completedItems} abgeschlossen
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  {currentBatch.failedItems} fehlgeschlagen
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Processing Info */}
      {loading && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <div className="space-y-2">
              <p><strong>KI-Optimierung mit Fallback-System:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Primär: OpenAI GPT-4o für höchste Qualität</li>
                <li>Fallback: Google Gemini bei Überlastung</li>
                <li>3 parallele Prozesse für maximale Geschwindigkeit</li>
                <li>Automatische Wiederholung bei temporären Fehlern</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for Large Batches */}
      {selectedCount > 10 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            <strong>Große Batch-Operation:</strong> Bei {selectedCount} Artikeln kann die Verarbeitung 
            mehrere Minuten dauern. Alle Fortschritte werden automatisch gespeichert und können 
            jederzeit eingesehen werden.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Panel Modal */}
      {showStatusPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <OptimizationStatusPanel
            currentBatch={currentBatch}
            onClose={() => setShowStatusPanel(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedBlogPostsBulkActions;
