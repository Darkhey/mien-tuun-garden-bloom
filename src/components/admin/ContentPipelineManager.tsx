
import React, { useState, useEffect } from "react";
import { Workflow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pipelineService, AutomationPipeline, PipelineConfig } from "@/services/PipelineService";
import PipelineConfiguration from "./pipeline/PipelineConfiguration";
import PipelineCard from "./pipeline/PipelineCard";

const ContentPipelineManager: React.FC = () => {
  const [pipelines, setPipelines] = useState<AutomationPipeline[]>([]);
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({
    id: '',
    batch_size: 5,
    quality_threshold: 80,
    auto_publish: false,
    target_category: 'kochen'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const pipelineChannel = pipelineService.subscribeToPipelineUpdates((updatedPipeline) => {
      setPipelines(prev => prev.map(p => 
        p.id === updatedPipeline.id ? updatedPipeline : p
      ));
    });

    return () => {
      if (pipelineChannel) {
        pipelineChannel.unsubscribe();
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const [pipelinesData, configData] = await Promise.all([
        pipelineService.getPipelines(),
        pipelineService.getConfig()
      ]);
      
      setPipelines(pipelinesData);
      if (configData) {
        setPipelineConfig(configData);
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartPipeline = async (pipelineId: string) => {
    try {
      await pipelineService.startPipeline(pipelineId);
      toast({
        title: "Pipeline gestartet",
        description: "Die Pipeline wurde erfolgreich gestartet"
      });
      
      // Refresh data
      setTimeout(() => loadData(), 500);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Pipeline konnte nicht gestartet werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleStopPipeline = async (pipelineId: string) => {
    try {
      await pipelineService.stopPipeline(pipelineId);
      toast({
        title: "Pipeline gestoppt",
        description: "Die Pipeline wurde erfolgreich gestoppt"
      });
      
      // Refresh data
      setTimeout(() => loadData(), 500);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Pipeline konnte nicht gestoppt werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleResetPipeline = async (pipelineId: string) => {
    try {
      await pipelineService.resetPipeline(pipelineId);
      toast({
        title: "Pipeline zurückgesetzt",
        description: "Die Pipeline wurde erfolgreich zurückgesetzt"
      });
      
      // Refresh data
      setTimeout(() => loadData(), 500);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Pipeline konnte nicht zurückgesetzt werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  const savePipelineConfig = async () => {
    try {
      await pipelineService.updateConfig(pipelineConfig);
      toast({
        title: "Konfiguration gespeichert",
        description: "Die Pipeline-Konfiguration wurde erfolgreich gespeichert"
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Konfiguration konnte nicht gespeichert werden: " + error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Workflow className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Content Pipeline Manager</h1>
            <p className="text-gray-600">Lade Pipeline-Daten...</p>
          </div>
        </div>
      </div>
    );
  }

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
      <PipelineConfiguration
        config={pipelineConfig}
        onConfigChange={setPipelineConfig}
        onSave={savePipelineConfig}
      />

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pipelines.map((pipeline) => (
          <PipelineCard
            key={pipeline.id}
            pipeline={pipeline}
            onStart={handleStartPipeline}
            onStop={handleStopPipeline}
            onReset={handleResetPipeline}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentPipelineManager;
