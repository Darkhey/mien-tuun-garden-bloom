
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Workflow, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  TrendingUp,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  duration: number;
  output?: any;
}

interface ContentPipeline {
  id: string;
  name: string;
  type: 'blog_creation' | 'recipe_generation' | 'seo_optimization' | 'content_analysis';
  stages: PipelineStage[];
  isActive: boolean;
  throughput: number; // items per hour
  efficiency: number; // success rate
  lastRun?: Date;
}

const ContentPipelineManager: React.FC = () => {
  const [pipelines, setPipelines] = useState<ContentPipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [pipelineConfig, setPipelineConfig] = useState({
    batchSize: 5,
    quality_threshold: 80,
    auto_publish: false,
    target_category: 'kochen'
  });

  useEffect(() => {
    initializePipelines();
  }, []);

  const initializePipelines = () => {
    const defaultPipelines: ContentPipeline[] = [
      {
        id: 'blog_auto',
        name: 'Automatische Blog-Erstellung',
        type: 'blog_creation',
        isActive: false,
        throughput: 12,
        efficiency: 87,
        stages: [
          { id: 'trend_analysis', name: 'Trend-Analyse', status: 'idle', progress: 0, duration: 30 },
          { id: 'topic_generation', name: 'Themen-Generierung', status: 'idle', progress: 0, duration: 45 },
          { id: 'content_creation', name: 'Content-Erstellung', status: 'idle', progress: 0, duration: 120 },
          { id: 'quality_check', name: 'Qualitätsprüfung', status: 'idle', progress: 0, duration: 60 },
          { id: 'seo_optimization', name: 'SEO-Optimierung', status: 'idle', progress: 0, duration: 45 },
          { id: 'publishing', name: 'Veröffentlichung', status: 'idle', progress: 0, duration: 15 }
        ]
      },
      {
        id: 'recipe_auto',
        name: 'Automatische Rezept-Generierung',
        type: 'recipe_generation',
        isActive: false,
        throughput: 8,
        efficiency: 92,
        stages: [
          { id: 'ingredient_analysis', name: 'Zutaten-Analyse', status: 'idle', progress: 0, duration: 20 },
          { id: 'recipe_creation', name: 'Rezept-Erstellung', status: 'idle', progress: 0, duration: 90 },
          { id: 'nutrition_calc', name: 'Nährwert-Berechnung', status: 'idle', progress: 0, duration: 30 },
          { id: 'image_generation', name: 'Bild-Generierung', status: 'idle', progress: 0, duration: 60 },
          { id: 'final_review', name: 'Finale Überprüfung', status: 'idle', progress: 0, duration: 40 }
        ]
      },
      {
        id: 'seo_optimizer',
        name: 'SEO-Optimierungs-Pipeline',
        type: 'seo_optimization',
        isActive: false,
        throughput: 20,
        efficiency: 94,
        stages: [
          { id: 'keyword_research', name: 'Keyword-Recherche', status: 'idle', progress: 0, duration: 25 },
          { id: 'content_analysis', name: 'Content-Analyse', status: 'idle', progress: 0, duration: 35 },
          { id: 'meta_optimization', name: 'Meta-Optimierung', status: 'idle', progress: 0, duration: 20 },
          { id: 'internal_linking', name: 'Interne Verlinkung', status: 'idle', progress: 0, duration: 30 }
        ]
      },
      {
        id: 'content_analyzer',
        name: 'Content-Performance-Analyse',
        type: 'content_analysis',
        isActive: true,
        throughput: 50,
        efficiency: 98,
        stages: [
          { id: 'data_collection', name: 'Daten-Sammlung', status: 'running', progress: 75, duration: 15 },
          { id: 'performance_analysis', name: 'Performance-Analyse', status: 'idle', progress: 0, duration: 40 },
          { id: 'insight_generation', name: 'Insight-Generierung', status: 'idle', progress: 0, duration: 25 },
          { id: 'recommendation', name: 'Empfehlungen', status: 'idle', progress: 0, duration: 20 }
        ]
      }
    ];

    setPipelines(defaultPipelines);
  };

  const handleStartPipeline = async (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    // Start pipeline simulation
    pipeline.isActive = true;
    pipeline.lastRun = new Date();
    
    // Reset all stages
    pipeline.stages.forEach(stage => {
      stage.status = 'idle';
      stage.progress = 0;
    });

    setPipelines([...pipelines]);

    // Simulate pipeline execution
    await simulatePipelineExecution(pipelineId);
  };

  const handleStopPipeline = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (pipeline) {
      pipeline.isActive = false;
      pipeline.stages.forEach(stage => {
        if (stage.status === 'running') stage.status = 'idle';
      });
      setPipelines([...pipelines]);
    }
  };

  const simulatePipelineExecution = async (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    for (let i = 0; i < pipeline.stages.length; i++) {
      const stage = pipeline.stages[i];
      stage.status = 'running';
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        stage.progress = progress;
        setPipelines([...pipelines]);
        await new Promise(resolve => setTimeout(resolve, stage.duration));
      }
      
      stage.status = Math.random() > 0.1 ? 'completed' : 'failed';
      if (stage.status === 'failed') {
        pipeline.isActive = false;
        break;
      }
    }
    
    pipeline.isActive = false;
    setPipelines([...pipelines]);
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPipelineTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_creation': return <Workflow className="h-5 w-5 text-blue-500" />;
      case 'recipe_generation': return <Zap className="h-5 w-5 text-green-500" />;
      case 'seo_optimization': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'content_analysis': return <Settings className="h-5 w-5 text-orange-500" />;
      default: return <Workflow className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Workflow className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Content Pipeline Manager</h1>
          <p className="text-gray-600">Vollautomatisierte Content-Produktions-Pipelines</p>
        </div>
      </div>

      {/* Pipeline Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline-Konfiguration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Batch-Größe</label>
              <Input
                type="number"
                value={pipelineConfig.batchSize}
                onChange={(e) => setPipelineConfig({
                  ...pipelineConfig,
                  batchSize: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Qualitäts-Schwellenwert</label>
              <Input
                type="number"
                value={pipelineConfig.quality_threshold}
                onChange={(e) => setPipelineConfig({
                  ...pipelineConfig,
                  quality_threshold: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ziel-Kategorie</label>
              <Select
                value={pipelineConfig.target_category}
                onValueChange={(value) => setPipelineConfig({
                  ...pipelineConfig,
                  target_category: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kochen">Kochen</SelectItem>
                  <SelectItem value="garten">Garten</SelectItem>
                  <SelectItem value="haushalt">Haushalt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Konfiguration speichern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPipelineTypeIcon(pipeline.type)}
                  <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                </div>
                <Badge variant={pipeline.isActive ? "default" : "secondary"}>
                  {pipeline.isActive ? "Aktiv" : "Inaktiv"}
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
                {pipeline.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-2">
                    {getStageIcon(stage.status)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{stage.name}</div>
                      <Progress value={stage.progress} className="h-1" />
                    </div>
                    <span className="text-xs text-gray-500">{stage.progress}%</span>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                {!pipeline.isActive ? (
                  <Button
                    onClick={() => handleStartPipeline(pipeline.id)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Starten
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleStopPipeline(pipeline.id)}
                    variant="destructive"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Stoppen
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {pipeline.lastRun && (
                <div className="text-xs text-gray-500 mt-2">
                  Letzte Ausführung: {pipeline.lastRun.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentPipelineManager;
