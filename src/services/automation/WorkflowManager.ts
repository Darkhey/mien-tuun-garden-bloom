
import { WorkflowTemplate, WorkflowExecution, WorkflowStep } from '@/types/automation';

export class WorkflowManager {
  private workflows: WorkflowTemplate[] = [];
  private executions: WorkflowExecution[] = [];

  async createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id'>): Promise<string> {
    const newTemplate: WorkflowTemplate = {
      ...template,
      id: `template_${Date.now()}`
    };
    
    this.workflows.push(newTemplate);
    console.log("[Automation] Created workflow template:", newTemplate.name);
    return newTemplate.id;
  }

  async executeWorkflow(templateId: string, config: any = {}): Promise<string> {
    const template = this.workflows.find(t => t.id === templateId);
    if (!template) throw new Error("Workflow template not found");

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      templateId,
      status: 'running',
      startTime: new Date(),
      currentStep: template.steps[0]?.id || '',
      results: {},
      logs: [`Workflow started: ${template.name}`]
    };

    this.executions.push(execution);
    
    // Start execution in background
    this.runWorkflowSteps(execution, template).catch(error => {
      execution.status = 'failed';
      execution.logs.push(`Workflow failed: ${error.message}`);
    });

    return execution.id;
  }

  private async runWorkflowSteps(execution: WorkflowExecution, template: WorkflowTemplate): Promise<void> {
    for (const step of template.steps) {
      try {
        execution.currentStep = step.id;
        execution.logs.push(`Starting step: ${step.name}`);
        
        const result = await this.executeWorkflowStep(step, execution.results);
        execution.results[step.id] = result;
        
        execution.logs.push(`Completed step: ${step.name}`);
      } catch (error) {
        execution.logs.push(`Step failed: ${step.name} - ${error.message}`);
        throw error;
      }
    }
    
    execution.status = 'completed';
    execution.endTime = new Date();
    execution.logs.push('Workflow completed successfully');
  }

  private async executeWorkflowStep(step: WorkflowStep, context: Record<string, any>): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    
    switch (step.type) {
      case 'ai_generation':
        return { content: "Generated content", quality: 85 };
      case 'quality_check':
        return { passed: true, score: 90 };
      case 'optimization':
        return { optimized: true, improvements: ["SEO", "Readability"] };
      case 'approval':
        return { approved: true, approver: "System" };
      case 'publishing':
        return { published: true, url: "https://example.com/post" };
      default:
        return { status: 'completed' };
    }
  }

  getWorkflowTemplates(): WorkflowTemplate[] {
    return this.workflows;
  }

  getWorkflowExecutions(): WorkflowExecution[] {
    return this.executions.slice(-10); // Last 10 executions
  }

  getExecutionById(id: string): WorkflowExecution | undefined {
    return this.executions.find(e => e.id === id);
  }
}
