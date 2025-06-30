import React, { useEffect, useState } from 'react';
import { CalendarIcon, Plus } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cronJobService } from '@/services/CronJobService';
import type { ScheduledTask } from '@/services/CronJobService';

const TaskTimeline: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await cronJobService.getScheduledTasks();
      setTasks(data);
    } catch (err) {
      console.error('[TaskTimeline] Error loading tasks', err);
      toast({ title: 'Fehler', description: 'Aufgaben konnten nicht geladen werden', variant: 'destructive' });
    }
  };

  const tasksForDay = (day: Date) => {
    return tasks.filter(t => new Date(t.scheduled_for).toDateString() === day.toDateString());
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setShowDialog(true);
  };

  const handleAddTask = async () => {
    if (!selectedDate) return;
    try {
      await cronJobService.createScheduledTask({
        name,
        description,
        function_name: 'generic-task',
        scheduled_for: selectedDate.toISOString(),
      });
      toast({ title: 'Aufgabe erstellt', description: `Aufgabe für ${selectedDate.toLocaleDateString()} hinzugefügt.` });
      setName('');
      setDescription('');
      setShowDialog(false);
      loadTasks();
    } catch (err) {
      console.error('[TaskTimeline] Error creating task', err);
      toast({ title: 'Fehler', description: 'Aufgabe konnte nicht erstellt werden', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Aufgaben-Timeline</h2>
      </div>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onDayClick={handleDayClick}
        modifiers={{
          hasTasks: (day) => tasksForDay(day).length > 0,
        }}
        modifiersClassNames={{ hasTasks: 'bg-sage-100' }}
      />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Aufgabe am {selectedDate?.toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {tasksForDay(selectedDate || new Date()).length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Geplante Aufgaben:</p>
                <ul className="list-disc list-inside text-sm">
                  {tasksForDay(selectedDate || new Date()).map(t => (
                    <li key={t.id}>{t.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <Input placeholder="Aufgabenname" value={name} onChange={e => setName(e.target.value)} />
            <Textarea placeholder="Beschreibung" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleAddTask} disabled={!name}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTimeline;
