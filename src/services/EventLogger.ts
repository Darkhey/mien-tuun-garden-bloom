import { format } from 'date-fns';

interface LogEntry {
  timestamp: number;
  message: string;
}

class EventLogger {
  private static instance: EventLogger;
  private logs: LogEntry[] = [];
  private emitter = new EventTarget();

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
    if (typeof window === 'undefined' || !(window as any).fetch) return;
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
    window.addEventListener('error', (e) => {
      this.log(`error ${e.message}`);
    });
    window.addEventListener('unhandledrejection', (e) => {
      this.log(`unhandledrejection ${(e as PromiseRejectionEvent).reason}`);
    });
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
