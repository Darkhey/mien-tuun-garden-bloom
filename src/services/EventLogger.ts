import { format } from 'date-fns';

interface LogEntry {
  timestamp: number;
  message: string;
}

class EventLogger {
  private static instance: EventLogger;
  private logs: LogEntry[] = [];
  private emitter = new EventTarget();
  private handleError = (e: ErrorEvent) => {
    this.log(`error ${e.message}`);
  };
  private handleRejection = (e: PromiseRejectionEvent) => {
    const reason = e.reason instanceof Error ? e.reason.message : e.reason;
    this.log(`unhandledrejection ${reason}`);
  };
  private unhandledRejectionListener = (event: any) => {
    if (event instanceof PromiseRejectionEvent) {
      this.handleRejection(event);
    }
  };

  private constructor() {
    this.patchFetch();
    this.patchErrors();
  }

  static getInstance(): EventLogger {
    if (!EventLogger.instance) {
      EventLogger.instance = new EventLogger();
    }
    return EventLogger.instance;
  }

  private patchFetch() {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      this.log(`fetch ${args[0]}`);
      try {
        const response = await originalFetch(...args);
        this.log(`response ${response.status} ${response.url}`);
        return response;
      } catch (e: any) {
        this.log(`fetch error ${e?.message ?? e}`);
        throw e;
      }
    };
  }

  private patchErrors() {
    if (typeof window === 'undefined') return;
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.unhandledRejectionListener);
  }

  cleanup() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.unhandledRejectionListener);
  }

  log(message: string) {
    const entry: LogEntry = { timestamp: Date.now(), message };
    this.logs.push(entry);
    if (this.logs.length > 500) {
      this.logs.shift();
    }
    this.emitter.dispatchEvent(new Event('log'));
  }

  clear() {
    this.logs = [];
    this.emitter.dispatchEvent(new Event('log'));
  }

  getLogs(): string[] {
    return this.logs.map((l) => `[${format(l.timestamp, 'HH:mm:ss')}] ${l.message}`);
  }

  subscribe(callback: () => void) {
    this.emitter.addEventListener('log', callback);
    return () => this.emitter.removeEventListener('log', callback);
  }
}

export default EventLogger;
