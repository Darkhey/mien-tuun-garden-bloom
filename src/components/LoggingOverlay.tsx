
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import EventLogger from '@/services/EventLogger';
import { Copy, Trash2, FileText, Play, Pause } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const logger = EventLogger.getInstance();

const LoggingOverlay: React.FC = () => {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>(logger.getLogs());
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    return logger.subscribe(() => {
      setLogs(logger.getLogs());
    });
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  if (!isAdmin) {
    return null;
  }

  const copyLogs = async () => {
    try {
      const filteredLogs = getFilteredLogs();
      await navigator.clipboard.writeText(filteredLogs.join('\n'));
      logger.log('clipboard logs copied successfully', 'info');
    } catch (err) {
      console.error('Failed to copy logs', err);
      logger.log(`clipboard error ${(err as Error).message}`, 'error');
    }
  };

  const clearLogs = () => {
    logger.clear();
    logger.log('logs cleared by user', 'info');
  };

  const getFilteredLogs = () => {
    if (filter === 'all') return logs;
    return logs.filter(log => log.includes(filter.toUpperCase()));
  };

  const getLogCount = (level: string) => {
    return logs.filter(log => log.includes(level.toUpperCase())).length;
  };

  const getLogLevelClass = (log: string) => {
    if (log.includes('ERROR')) return 'text-red-600';
    if (log.includes('WARN')) return 'text-yellow-600';
    if (log.includes('INFO')) return 'text-blue-600';
    return 'text-gray-700';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400"
        >
          <FileText className="w-4 h-4 mr-2" />
          Debug Logs
          {logs.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white text-blue-600">
              {logs.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl p-0">
        <SheetHeader className="flex justify-between items-center px-4 py-2 border-b">
          <SheetTitle>Debug Logs</SheetTitle>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Badge 
                variant={filter === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer text-xs"
                onClick={() => setFilter('all')}
              >
                All ({logs.length})
              </Badge>
              <Badge 
                variant={filter === 'error' ? 'destructive' : 'outline'} 
                className="cursor-pointer text-xs"
                onClick={() => setFilter('error')}
              >
                Errors ({getLogCount('ERROR')})
              </Badge>
              <Badge 
                variant={filter === 'warn' ? 'secondary' : 'outline'} 
                className="cursor-pointer text-xs"
                onClick={() => setFilter('warn')}
              >
                Warnings ({getLogCount('WARN')})
              </Badge>
              <Badge 
                variant={filter === 'info' ? 'default' : 'outline'} 
                className="cursor-pointer text-xs"
                onClick={() => setFilter('info')}
              >
                Info ({getLogCount('INFO')})
              </Badge>
            </div>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setAutoScroll(!autoScroll)}
            >
              {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            
            <Button size="sm" variant="outline" onClick={copyLogs}>
              <Copy className="w-4 h-4 mr-1" /> Kopieren
            </Button>
            <Button size="sm" variant="outline" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-1" /> Leeren
            </Button>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="text-xs font-mono space-y-1">
            {getFilteredLogs().length > 0 ? (
              getFilteredLogs().map((log, index) => (
                <div key={index} className={`whitespace-pre-wrap ${getLogLevelClass(log)}`}>
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                {filter === 'all' ? 'Keine Logs vorhanden.' : `Keine ${filter} Logs vorhanden.`}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default LoggingOverlay;
