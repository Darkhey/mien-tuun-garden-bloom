
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Workflow, Zap, TrendingUp, Settings } from "lucide-react";
import { AutomationPipeline } from "@/services/PipelineService";
import PipelineStage from "./PipelineStage";

interface PipelineCardProps {
  pipeline: AutomationPipeline;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onReset: (id: string) => void;
}

const PipelineCard: React.FC<PipelineCardProps> = ({
  pipeline,
  onStart,
  onStop,
  onReset
}) => {
  const getPipelineTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_creation': return <Workflow className="h-5 w-5 text-blue-500" />;
      case 'recipe_generation': return <Zap className="h-5 w-5 text-green-500" />;
      case 'seo_optimization': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'content_analysis': return <Settings className="h-5 w-5 text-orange-500" />;
      default: return <Workflow className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'paused': return 'Pausiert';
      case 'error': return 'Fehler';
      default: return 'Inaktiv';
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPipelineTypeIcon(pipeline.type)}
            <CardTitle className="text-lg">{pipeline.name}</CardTitle>
          </div>
          <Badge variant={getStatusBadgeVariant(pipeline.status)}>
            {getStatusText(pipeline.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pipeline.throughput}</div>
            <div className="text-sm text-gray-600">Items/Stunde</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{pipeline.efficiency}%</div>
            <div className="text-sm text-gray-600">Effizienz</div>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-2 mb-4">
          {pipeline.stages.map((stage) => (
            <PipelineStage key={stage.id} stage={stage} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {pipeline.status !== 'active' ? (
            <Button
              onClick={() => onStart(pipeline.id)}
              className="flex-1 flex items-center gap-2"
              disabled={pipeline.status === 'error'}
            >
              <Play className="h-4 w-4" />
              Starten
            </Button>
          ) : (
            <Button
              onClick={() => onStop(pipeline.id)}
              variant="destructive"
              className="flex-1 flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Stoppen
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onReset(pipeline.id)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {pipeline.last_run_at && (
          <div className="text-xs text-gray-500 mt-2">
            Letzte Ausführung: {new Date(pipeline.last_run_at).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PipelineCard;
