
export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  lastRun?: Date;
  runCount: number;
  successRate: number;
}

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'content_gap' | 'trend_spike' | 'user_activity';
  config: {
    cron?: string; // für schedule
    event?: string; // für event
    threshold?: number; // für trend_spike
    conditions?: any;
  };
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
}

export interface AutomationAction {
  type: 'generate_content' | 'optimize_prompt' | 'send_notification' | 'schedule_post' | 'analyze_performance';
  config: any;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content_creation' | 'optimization' | 'analysis' | 'maintenance';
  steps: WorkflowStep[];
  estimatedDuration: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'ai_generation' | 'quality_check' | 'optimization' | 'approval' | 'publishing';
  config: any;
  dependencies: string[];
  timeout: number;
}

export interface WorkflowExecution {
  id: string;
  templateId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentStep: string;
  results: Record<string, any>;
  logs: string[];
}
