
import React from "react";
import { Workflow } from "lucide-react";
import PipelineConfiguration from "./pipeline/PipelineConfiguration";
import PipelineCard from "./pipeline/PipelineCard";
import { usePipelineManager } from "./pipeline/usePipelineManager";

const ContentPipelineManager: React.FC = () => {
  const {
    pipelines,
    pipelineConfig,
    setPipelineConfig,
    handleStartPipeline,
    handleStopPipeline,
    handleResetPipeline,
    savePipelineConfig
  } = usePipelineManager();

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
