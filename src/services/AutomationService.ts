
import { AutomationRuleManager } from './automation/AutomationRuleManager';
import { WorkflowManager } from './automation/WorkflowManager';
import { AutomationDefaults } from './automation/AutomationDefaults';
import { AutomationRule, WorkflowTemplate, WorkflowExecution, AutomationTrigger, AutomationAction } from '@/types/automation';

class AutomationService {
  private ruleManager: AutomationRuleManager;
  private workflowManager: WorkflowManager;
  private defaults: AutomationDefaults;

  constructor() {
    this.ruleManager = new AutomationRuleManager();
    this.workflowManager = new WorkflowManager();
    this.defaults = new AutomationDefaults(this.ruleManager, this.workflowManager);
  }

  // Automation Rules Management
  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'runCount' | 'successRate'>): Promise<string> {
    return this.ruleManager.createAutomationRule(rule);
  }

  async executeRule(ruleId: string): Promise<boolean> {
    return this.ruleManager.executeRule(ruleId);
  }

  // Workflow Management
  async createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id'>): Promise<string> {
    return this.workflowManager.createWorkflowTemplate(template);
  }

  async executeWorkflow(templateId: string, config: any = {}): Promise<string> {
    return this.workflowManager.executeWorkflow(templateId, config);
  }

  // Getters
  getAutomationRules(): AutomationRule[] {
    return this.ruleManager.getAutomationRules();
  }

  getWorkflowTemplates(): WorkflowTemplate[] {
    return this.workflowManager.getWorkflowTemplates();
  }

  getWorkflowExecutions(): WorkflowExecution[] {
    return this.workflowManager.getWorkflowExecutions();
  }

  getExecutionById(id: string): WorkflowExecution | undefined {
    return this.workflowManager.getExecutionById(id);
  }

  // Performance Analytics
  getAutomationStats() {
    const rules = this.getAutomationRules();
    const executions = this.getWorkflowExecutions();

    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.enabled).length,
      averageSuccessRate: rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length || 0,
      totalExecutions: executions.length,
      recentExecutions: executions.filter(e => 
        new Date().getTime() - e.startTime.getTime() < 24 * 60 * 60 * 1000
      ).length
    };
  }

  // Initialize default automation rules and workflows
  async initializeDefaults(): Promise<void> {
    return this.defaults.initializeDefaults();
  }
}

export const automationService = new AutomationService();
export type { AutomationRule, WorkflowTemplate, WorkflowExecution, AutomationTrigger, AutomationAction };
