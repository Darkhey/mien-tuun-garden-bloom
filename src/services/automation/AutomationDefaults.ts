
import { AutomationRuleManager } from './AutomationRuleManager';
import { WorkflowManager } from './WorkflowManager';

export class AutomationDefaults {
  constructor(
    private ruleManager: AutomationRuleManager,
    private workflowManager: WorkflowManager
  ) {}

  async initializeDefaults(): Promise<void> {
    await this.createDefaultRules();
    await this.createDefaultWorkflows();
    console.log("[Automation] Default rules and workflows initialized");
  }

  private async createDefaultRules(): Promise<void> {
    await this.ruleManager.createAutomationRule({
      name: "Tägliche Content-Generierung",
      trigger: {
        type: 'schedule',
        config: { cron: '0 9 * * *' } // Daily at 9 AM
      },
      conditions: [
        { field: 'content_count', operator: 'less_than', value: 5 }
      ],
      actions: [
        { type: 'generate_content', config: { category: 'auto', count: 3 } }
      ],
      enabled: true
    });

    await this.ruleManager.createAutomationRule({
      name: "Trend-basierte Content-Erstellung",
      trigger: {
        type: 'trend_spike',
        config: { threshold: 0.8 }
      },
      conditions: [
        { field: 'trend_relevance', operator: 'greater_than', value: 0.7 }
      ],
      actions: [
        { type: 'generate_content', config: { trendBased: true } },
        { type: 'send_notification', config: { message: 'Trend-basierter Content erstellt' } }
      ],
      enabled: true
    });
  }

  private async createDefaultWorkflows(): Promise<void> {
    await this.workflowManager.createWorkflowTemplate({
      name: "Vollautomatische Blog-Erstellung",
      description: "Kompletter Workflow von Ideenfindung bis Veröffentlichung",
      category: 'content_creation',
      estimatedDuration: 300000, // 5 minutes
      complexity: 'complex',
      steps: [
        {
          id: 'idea_generation',
          name: 'Ideenfindung',
          type: 'ai_generation',
          config: { type: 'topic_ideas' },
          dependencies: [],
          timeout: 60000
        },
        {
          id: 'content_creation',
          name: 'Content-Erstellung',
          type: 'ai_generation',
          config: { type: 'full_article' },
          dependencies: ['idea_generation'],
          timeout: 120000
        },
        {
          id: 'quality_assessment',
          name: 'Qualitätsprüfung',
          type: 'quality_check',
          config: { minScore: 80 },
          dependencies: ['content_creation'],
          timeout: 30000
        },
        {
          id: 'seo_optimization',
          name: 'SEO-Optimierung',
          type: 'optimization',
          config: { type: 'seo' },
          dependencies: ['quality_assessment'],
          timeout: 60000
        },
        {
          id: 'publishing',
          name: 'Veröffentlichung',
          type: 'publishing',
          config: { autoPublish: false },
          dependencies: ['seo_optimization'],
          timeout: 30000
        }
      ]
    });
  }
}
