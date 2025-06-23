import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import EventLogger from '@/services/EventLogger';
import { Copy, Trash2 } from 'lucide-react';

const logger = EventLogger.getInstance();

const LoggingOverlay: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>(logger.getLogs());

  useEffect(() => {
    return logger.subscribe(() => {
      setLogs(logger.getLogs());
    });
  }, []);

  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
    } catch (err) {
      console.error('Failed to copy logs', err);
      logger.log(`clipboard error ${(err as Error).message}`);
    }
  };

  const clearLogs = () => {
    logger.clear();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-4 right-4 z-50 shadow"
        >
          Log
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="flex justify-between items-center px-4 py-2 border-b">
          <SheetTitle>Logs</SheetTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyLogs}>
              <Copy className="w-4 h-4 mr-1" /> Kopieren
            </Button>
            <Button size="sm" variant="outline" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-1" /> Leeren
            </Button>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4">
          <pre className="text-xs whitespace-pre-wrap font-mono">
            {logs.join('\n')}
          </pre>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default LoggingOverlay;
