
import { useState, useEffect } from "react";
import { ContentPipeline } from "./PipelineCard";
import { PipelineConfig } from "./PipelineConfiguration";

export const usePipelineManager = () => {
  const [pipelines, setPipelines] = useState<ContentPipeline[]>([]);
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({
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

    pipeline.isActive = true;
    pipeline.lastRun = new Date();
    
    pipeline.stages.forEach(stage => {
      stage.status = 'idle';
      stage.progress = 0;
    });

    setPipelines([...pipelines]);
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

  const handleResetPipeline = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (pipeline) {
      pipeline.isActive = false;
      pipeline.stages.forEach(stage => {
        stage.status = 'idle';
        stage.progress = 0;
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

  const savePipelineConfig = () => {
    console.log('Saving pipeline configuration:', pipelineConfig);
    // Here you would typically save to backend
  };

  return {
    pipelines,
    pipelineConfig,
    setPipelineConfig,
    handleStartPipeline,
    handleStopPipeline,
    handleResetPipeline,
    savePipelineConfig
  };
};
