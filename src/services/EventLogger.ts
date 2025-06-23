
import { format } from 'date-fns';

interface LogEntry {
  timestamp: number;
  message: string;
  level: 'log' | 'warn' | 'error' | 'info';
}

class EventLogger {
  private static instance: EventLogger;
  private logs: LogEntry[] = [];
  private emitter = new EventTarget();
  private originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  private handleError = (e: ErrorEvent) => {
    this.log(`error ${e.message} at ${e.filename}:${e.lineno}`, 'error');
  };

  private handleRejection = (e: PromiseRejectionEvent) => {
    const reason = e.reason instanceof Error ? e.reason.message : e.reason;
    this.log(`unhandledrejection ${reason}`, 'error');
  };

  private unhandledRejectionListener = (event: any) => {
    if (event instanceof PromiseRejectionEvent) {
      this.handleRejection(event);
    }
  };

  private constructor() {
    this.patchConsole();
    this.patchFetch();
    this.patchErrors();
    this.patchReactEvents();
  }

  static getInstance(): EventLogger {
    if (!EventLogger.instance) {
      EventLogger.instance = new EventLogger();
    }
    return EventLogger.instance;
  }

  private patchConsole() {
    if (typeof window === 'undefined') return;
    
    console.log = (...args) => {
      this.log(`console.log ${args.join(' ')}`, 'log');
      this.originalConsole.log(...args);
    };

    console.warn = (...args) => {
      this.log(`console.warn ${args.join(' ')}`, 'warn');
      this.originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.log(`console.error ${args.join(' ')}`, 'error');
      this.originalConsole.error(...args);
    };

    console.info = (...args) => {
      this.log(`console.info ${args.join(' ')}`, 'info');
      this.originalConsole.info(...args);
    };
  }

  private patchFetch() {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || 'unknown';
      this.log(`fetch ${url}`, 'info');
      try {
        const response = await originalFetch(...args);
        this.log(`response ${response.status} ${response.url || url}`, 'info');
        return response;
      } catch (e: any) {
        this.log(`fetch error ${e?.message ?? e}`, 'error');
        throw e;
      }
    };
  }

  private patchErrors() {
    if (typeof window === 'undefined') return;
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.unhandledRejectionListener);
  }

  private patchReactEvents() {
    if (typeof window === 'undefined') return;
    
    // Log clicks on buttons and interactive elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const text = button?.textContent?.trim() || 'unknown button';
        this.log(`button click: ${text}`, 'info');
      }
    });

    // Log form submissions
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      this.log(`form submit: ${target.id || target.className || 'unknown form'}`, 'info');
    });

    // Log navigation changes
    let currentPath = window.location.pathname;
    const checkNavigation = () => {
      if (window.location.pathname !== currentPath) {
        this.log(`navigation from ${currentPath} to ${window.location.pathname}`, 'info');
        currentPath = window.location.pathname;
      }
    };
    setInterval(checkNavigation, 100);
  }

  cleanup() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.unhandledRejectionListener);
    
    // Restore original console
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
  }

  log(message: string, level: 'log' | 'warn' | 'error' | 'info' = 'log') {
    const entry: LogEntry = { timestamp: Date.now(), message, level };
    this.logs.push(entry);
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    this.emitter.dispatchEvent(new Event('log'));
  }

  clear() {
    this.logs = [];
    this.emitter.dispatchEvent(new Event('log'));
  }

  getLogs(): string[] {
    return this.logs.map((l) => {
      const time = format(l.timestamp, 'HH:mm:ss.SSS');
      const level = l.level.toUpperCase().padEnd(5);
      return `[${time}] ${level} ${l.message}`;
    });
  }

  subscribe(callback: () => void) {
    this.emitter.addEventListener('log', callback);
    return () => this.emitter.removeEventListener('log', callback);
  }
}

export default EventLogger;
