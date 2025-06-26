
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  FileText, 
  Image, 
  Filter,
  Zap,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { OptimizationBatch, OptimizationResult, optimizationTrackingService } from "@/services/OptimizationTrackingService";

interface OptimizationStatusPanelProps {
  currentBatch?: OptimizationBatch;
  onClose: () => void;
}

const OptimizationStatusPanel: React.FC<OptimizationStatusPanelProps> = ({
  currentBatch,
  onClose
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'title' | 'image'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');
  
  const allBatches = optimizationTrackingService.getAllBatches();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'title' ? 
      <FileText className="h-4 w-4" /> : 
      <Image className="h-4 w-4" />;
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const seconds = Math.round(duration / 1000);
    return `${seconds}s`;
  };

  const getFilteredResults = () => {
    const filters: any = {};
    if (selectedFilter !== 'all') filters.type = selectedFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    
    return optimizationTrackingService.getFilteredResults(filters);
  };

  const filteredResults = getFilteredResults();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Optimierungsstatus
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Batch Progress */}
        {currentBatch && currentBatch.status === 'running' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {currentBatch.type === 'title' ? 'Titel-Optimierung' : 'Bild-Generierung'} läuft...
                  </span>
                  <span className="text-sm text-gray-600">
                    {currentBatch.completedItems + currentBatch.failedItems}/{currentBatch.totalItems}
                  </span>
                </div>
                <Progress 
                  value={(currentBatch.completedItems + currentBatch.failedItems) / currentBatch.totalItems * 100} 
                  className="h-2"
                />
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {currentBatch.completedItems} erfolgreich
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

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Aktueller Vorgang</TabsTrigger>
            <TabsTrigger value="history">Verlauf & Filter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            {currentBatch ? (
              <div className="space-y-4">
                {/* Batch Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(currentBatch.type)}
                        <div>
                          <p className="text-sm font-medium">Typ</p>
                          <p className="text-lg">{currentBatch.type === 'title' ? 'Titel' : 'Bilder'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Fortschritt</p>
                          <p className="text-lg">
                            {Math.round((currentBatch.completedItems + currentBatch.failedItems) / currentBatch.totalItems * 100)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Dauer</p>
                          <p className="text-lg">{formatDuration(currentBatch.startTime, currentBatch.endTime)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Individual Results */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentBatch.results.map((result) => (
                    <div key={result.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(result.status)}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {result.status === 'completed' && result.changes && (
                            <Badge variant="secondary" className="text-xs">
                              {result.changes.length} Änderungen
                            </Badge>
                          )}
                          {result.aiProvider && (
                            <Badge variant="outline" className="text-xs">
                              {result.aiProvider}
                            </Badge>
                          )}
                          {result.error && (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {result.error}
                            </span>
                          )}
                        </div>
                        {result.originalValue && result.optimizedValue && result.originalValue !== result.optimizedValue && (
                          <div className="mt-2 text-xs">
                            <p className="text-gray-500">Vorher: {result.originalValue}</p>
                            <p className="text-green-600">Nachher: {result.optimizedValue}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Keine aktive Optimierung
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Typ:</span>
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">Alle</option>
                  <option value="title">Titel</option>
                  <option value="image">Bilder</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">Alle</option>
                  <option value="completed">Erfolgreich</option>
                  <option value="failed">Fehlgeschlagen</option>
                </select>
              </div>
            </div>

            {/* Batch History */}
            <div className="space-y-4">
              <h3 className="font-medium">Vergangene Optimierungen</h3>
              {allBatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Noch keine Optimierungen durchgeführt
                </div>
              ) : (
                <div className="space-y-3">
                  {allBatches.slice(0, 5).map((batch) => (
                    <Card key={batch.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(batch.type)}
                            <div>
                              <p className="font-medium">
                                {batch.type === 'title' ? 'Titel-Optimierung' : 'Bild-Generierung'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {batch.startTime.toLocaleString()} • {formatDuration(batch.startTime, batch.endTime)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={batch.status === 'completed' ? 'default' : 'secondary'}>
                              {batch.completedItems}/{batch.totalItems} erfolgreich
                            </Badge>
                            {batch.failedItems > 0 && (
                              <Badge variant="destructive">
                                {batch.failedItems} fehlgeschlagen
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Filtered Results */}
            {filteredResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Gefilterte Ergebnisse ({filteredResults.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredResults.map((result) => (
                    <div key={`${result.id}-${result.timestamp.getTime()}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-shrink-0">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{result.timestamp.toLocaleString()}</span>
                          {result.changes && result.changes.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {result.changes.length} Änderungen
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OptimizationStatusPanel;
