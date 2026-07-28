import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api, { Task, Category } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getDueInLabel } from '@/lib/timeago';
import { toast } from 'sonner';

const TITLE_MAX = 100;
const DESC_MAX = 200;

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [hideOverdue, setHideOverdue] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tasksRes, categoriesRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/categories'),
      ]);
      setTasks(tasksRes.data.tasks);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }

  const userTasks = tasks.filter((t) => t.userId === user?.id);

  const filtered = userTasks
    .filter((t) => filter === 'All' || t.status === filter)
    .filter((t) => !hideOverdue || !isOverdue(t.dueDate))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const counts = {
    All: userTasks.length,
    todo: userTasks.filter((t) => t.status === 'todo').length,
    in_progress: userTasks.filter((t) => t.status === 'in_progress').length,
    done: userTasks.filter((t) => t.status === 'done').length,
    overdue: userTasks.filter((t) => t.status !== 'done' && isOverdue(t.dueDate)).length,
  };

  function onCreate() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(t: Task) {
    setEditing(t);
    setOpen(true);
  }

  async function onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  }

  async function onStatusChange(id: string, status: string) {
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status });
      setTasks(tasks.map((t) => (t.id === id ? res.data.task : t)));
      toast.success(`Marked ${status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold">Your tasks</h1>
          </div>
          <Button onClick={onCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-1" /> New task
          </Button>
        </header>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={counts.All} />
          <StatCard label="In Progress" value={counts.in_progress} />
          <StatCard label="Completed" value={counts.done} />
          <StatCard label="Overdue" value={counts.overdue} tone="destructive" />
        </div>

        <div className="mt-8 flex gap-2 flex-wrap items-center">
          {(['All', 'todo', 'in_progress', 'done'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-colors',
                filter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:border-accent'
              )}
            >
              {s === 'All' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}{' '}
              <span className="ml-1 text-xs opacity-70">{counts[s === 'All' ? 'All' : s]}</span>
            </button>
          ))}
          <button
            onClick={() => setHideOverdue(!hideOverdue)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              hideOverdue
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-background hover:border-accent'
            )}
          >
            {hideOverdue ? 'Show Overdue' : 'Hide Overdue'}
          </button>
        </div>

        <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <div className="font-medium">Nothing here yet</div>
            </div>
          ) : (
            filtered.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const overdue = isOverdue(t.dueDate);
              const locked = overdue;
              return (
                <div
                  key={t.id}
                  className="group rounded-xl border bg-card p-4 md:p-5 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={cn(
                            'font-medium truncate',
                            t.status === 'done' && 'line-through text-muted-foreground'
                          )}
                        >
                          {t.title}
                        </h3>
                        {cat && (
                          <Badge variant="outline" className="border-0">
                            {cat.name}
                          </Badge>
                        )}
                        {overdue && t.status !== 'done' && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{t.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" /> Due{' '}
                          {format(parseISO(t.dueDate), 'MMM d, yyyy · h:mm a')}
                        </span>
                        {t.status !== 'done' && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {getDueInLabel(t.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {locked ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="opacity-40 cursor-not-allowed">
                              <div
                                className={cn(
                                  'h-8 w-[110px] text-xs flex items-center px-3 rounded-md border',
                                  t.status === 'todo' && 'bg-muted text-foreground',
                                  t.status === 'in_progress' && 'bg-amber-100 text-amber-900',
                                  t.status === 'done' && 'bg-green-100 text-green-900'
                                )}
                              >
                                {t.status === 'todo' ? 'Todo' : t.status === 'in_progress' ? 'In Progress' : 'Done'}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Status locked — past due date</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Select
                          value={t.status}
                          onValueChange={(v) => onStatusChange(t.id, v)}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 w-[110px] text-xs',
                              t.status === 'todo' && 'bg-muted text-foreground',
                              t.status === 'in_progress' && 'bg-amber-100 text-amber-900',
                              t.status === 'done' && 'bg-green-100 text-green-900'
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">Todo</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <TaskDialog
          open={open}
          onOpenChange={setOpen}
          editing={editing}
          categories={categories}
          onSaved={() => fetchData()}
        />
      </div>
    </TooltipProvider>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'destructive' }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1 text-2xl font-display font-semibold',
          tone === 'destructive' && value > 0 && 'text-destructive'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function TaskDialog({
  open,
  onOpenChange,
  editing,
  categories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Task | null;
  categories: Category[];
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [dueTime, setDueTime] = useState('17:00');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setDescription(editing.description || '');
        setStatus(editing.status);
        const parsed = parseISO(editing.dueDate);
        setDueDate(parsed);
        setDueTime(format(parsed, 'HH:mm'));
        setCategoryId(editing.categoryId || '');
      } else {
        setTitle('');
        setDescription('');
        setStatus('todo');
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 6, 0, 0, 0);
        setDueDate(nextHour);
        setDueTime(format(nextHour, 'HH:mm'));
        setCategoryId('');
      }
    }
  }, [open, editing, categories]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error('Give your task a title');
    if (!dueDate) return toast.error('Pick a due date');

    const [hours, minutes] = dueTime.split(':').map(Number);
    const combined = new Date(dueDate);
    combined.setHours(hours, minutes, 0, 0);

    if (!editing && combined < new Date()) {
      return toast.error('Due date cannot be in the past');
    }

    setIsLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description,
        status,
        dueDate: combined.toISOString(),
        categoryId: categoryId || null,
      };

      if (editing) {
        await api.put(`/tasks/${editing.id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task added');
      }
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? 'Edit task' : 'New task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write a launch announcement"
              maxLength={TITLE_MAX}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes…"
              rows={3}
              maxLength={DESC_MAX}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Due date & time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start font-normal">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editing ? 'Save changes' : 'Add task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
