import React, { createContext, useContext, useState, useEffect } from 'react';

interface EventLoggerContextType {
  logs: string[];
  log: (msg: string) => void;
}

const EventLoggerContext = createContext<EventLoggerContextType | undefined>(undefined);

export const EventLoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const log = (msg: string) => setLogs(prev => [...prev, `[${new Date().toISOString()}] ${msg}`]);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      log(`FETCH ${args[0]}`);
      try {
        const res = await originalFetch(...args);
        log(`FETCH ${args[0]} -> ${res.status}`);
        return res;
      } catch (e: any) {
        log(`FETCH ${args[0]} ERROR: ${e.message}`);
        throw e;
      }
    };
    const errorHandler = (e: ErrorEvent) => {
      log(`ERROR ${e.message}`);
    };
    window.addEventListener('error', errorHandler);
    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  return (
    <EventLoggerContext.Provider value={{ logs, log }}>
      {children}
    </EventLoggerContext.Provider>
  );
};

export const useEventLogger = () => {
  const ctx = useContext(EventLoggerContext);
  if (!ctx) throw new Error('useEventLogger must be used within EventLoggerProvider');
  return ctx;
};
