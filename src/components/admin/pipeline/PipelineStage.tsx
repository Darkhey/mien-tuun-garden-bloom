
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertCircle, Target } from "lucide-react";

export interface PipelineStageData {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  duration: number;
  output?: any;
}

interface PipelineStageProps {
  stage: PipelineStageData;
}

const PipelineStage: React.FC<PipelineStageProps> = ({ stage }) => {
  const getStageIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStageIcon(stage.status)}
      <div className="flex-1">
        <div className="text-sm font-medium">{stage.name}</div>
        <Progress value={stage.progress} className="h-1" />
      </div>
      <span className="text-xs text-gray-500">{stage.progress}%</span>
    </div>
  );
};

export default PipelineStage;
