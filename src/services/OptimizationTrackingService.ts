
export interface OptimizationResult {
  id: string;
  title: string;
  type: 'title' | 'image';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalValue?: string;
  optimizedValue?: string;
  error?: string;
  timestamp: Date;
  changes?: string[];
  aiProvider?: string;
  model?: string;
}

export interface OptimizationBatch {
  id: string;
  type: 'title' | 'image';
  startTime: Date;
  endTime?: Date;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  results: OptimizationResult[];
  status: 'running' | 'completed' | 'cancelled';
}

class OptimizationTrackingService {
  private static instance: OptimizationTrackingService;
  private batches: Map<string, OptimizationBatch> = new Map();

  public static getInstance(): OptimizationTrackingService {
    if (!OptimizationTrackingService.instance) {
      OptimizationTrackingService.instance = new OptimizationTrackingService();
    }
    return OptimizationTrackingService.instance;
  }

  createBatch(type: 'title' | 'image', items: Array<{ id: string; title: string }>): OptimizationBatch {
    const batchId = `${type}-${Date.now()}`;
    const batch: OptimizationBatch = {
      id: batchId,
      type,
      startTime: new Date(),
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      status: 'running',
      results: items.map(item => ({
        id: item.id,
        title: item.title,
        type,
        status: 'pending',
        timestamp: new Date()
      }))
    };

    this.batches.set(batchId, batch);
    return batch;
  }

  updateResult(batchId: string, itemId: string, updates: Partial<OptimizationResult>): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    const resultIndex = batch.results.findIndex(r => r.id === itemId);
    if (resultIndex === -1) return;

    const previousStatus = batch.results[resultIndex].status;
    batch.results[resultIndex] = { ...batch.results[resultIndex], ...updates };

    // Update batch counters
    if (previousStatus === 'processing' || previousStatus === 'pending') {
      if (updates.status === 'completed') {
        batch.completedItems++;
      } else if (updates.status === 'failed') {
        batch.failedItems++;
      }
    }

    // Check if batch is complete
    if (batch.completedItems + batch.failedItems === batch.totalItems) {
      batch.status = 'completed';
      batch.endTime = new Date();
    }

    this.batches.set(batchId, batch);
  }

  getBatch(batchId: string): OptimizationBatch | undefined {
    return this.batches.get(batchId);
  }

  getAllBatches(): OptimizationBatch[] {
    return Array.from(this.batches.values()).sort((a, b) => 
      b.startTime.getTime() - a.startTime.getTime()
    );
  }

  getFilteredResults(filters: {
    type?: 'title' | 'image';
    status?: 'completed' | 'failed' | 'pending' | 'processing';
    hasChanges?: boolean;
  }): OptimizationResult[] {
    const allResults = Array.from(this.batches.values())
      .flatMap(batch => batch.results);

    return allResults.filter(result => {
      if (filters.type && result.type !== filters.type) return false;
      if (filters.status && result.status !== filters.status) return false;
      if (filters.hasChanges !== undefined) {
        const hasChanges = result.changes && result.changes.length > 0;
        if (filters.hasChanges !== hasChanges) return false;
      }
      return true;
    });
  }

  cancelBatch(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (batch) {
      batch.status = 'cancelled';
      batch.endTime = new Date();
      this.batches.set(batchId, batch);
    }
  }
}

export const optimizationTrackingService = OptimizationTrackingService.getInstance();
