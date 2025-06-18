import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Zap, 
  TrendingUp,
  FileText,
  Image,
  CheckSquare
} from "lucide-react";

interface ContentAutomationProgressProps {
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  stages: {
    id: string;
    name: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
  }[];
  startTime?: Date;
  endTime?: Date;
  className?: string;
}

const ContentAutomationProgress: React.FC<ContentAutomationProgressProps> = ({
  status,
  progress,
  stages,
  startTime,
  endTime,
  className
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'topic_selection': return <FileText className="h-4 w-4" />;
      case 'content_generation': return <Zap className="h-4 w-4" />;
      case 'quality_check': return <CheckSquare className="h-4 w-4" />;
      case 'image_generation': return <Image className="h-4 w-4" />;
      case 'seo_optimization': return <TrendingUp className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Abgeschlossen</Badge>;
      case 'running':
        return <Badge variant="secondary">In Bearbeitung</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="outline">Warten</Badge>;
    }
  };

  const formatDuration = () => {
    if (!startTime) return "N/A";
    
    const end = endTime || new Date();
    const durationMs = end.getTime() - startTime.getTime();
    
    if (durationMs < 1000) return `${durationMs}ms`;
    if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.round((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Content-Automatisierung
          </span>
          {getStatusBadge(status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gesamtfortschritt</span>
            <span className="text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Stages */}
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStageIcon(stage.id)}
                  <span className="text-sm">{stage.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{stage.progress}%</span>
                  {getStatusIcon(stage.status)}
                </div>
              </div>
              <Progress value={stage.progress} className="h-1.5" />
            </div>
          ))}
        </div>
        
        {/* Timing Information */}
        {startTime && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div>
              Start: {startTime.toLocaleTimeString()}
            </div>
            <div>
              Dauer: {formatDuration()}
            </div>
            {endTime && (
              <div>
                Ende: {endTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
        
        {/* Motivational Message */}
        {status === 'running' && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 flex items-center gap-2 animate-pulse">
            <Zap className="h-4 w-4 text-blue-500" />
            <span>Dein Content wird gerade erstellt! Bald hast du frischen, automatisierten Inhalt.</span>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Glückwunsch! Dein Content wurde erfolgreich erstellt und ist bereit zur Veröffentlichung.</span>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>Es gab ein Problem bei der Content-Erstellung. Bitte überprüfe die Logs und versuche es erneut.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentAutomationProgress;