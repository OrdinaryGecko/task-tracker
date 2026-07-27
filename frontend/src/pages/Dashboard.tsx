import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import api, { DashboardResponse } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [userFilter, setUserFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dueFilter, setDueFilter] = useState('');
  const [q, setQ] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.tasks
      .filter((t) => userFilter === 'all' || t.userId === userFilter)
      .filter((t) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'overdue') return t.status !== 'done' && isOverdue(t.dueDate);
        return t.status === statusFilter;
      })
      .filter((t) => (dueFilter ? format(parseISO(t.dueDate), 'yyyy-MM-dd') === dueFilter : true))
      .filter((t) => (q ? t.title.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [data, userFilter, statusFilter, dueFilter, q]);

  if (user?.role !== 'admin') return null;

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header>
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold mt-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Everyone's tasks in one view. Filter by user, status, or due date.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="All tasks" value={data.stats.total} />
        <Stat label="In progress" value={data.stats.byStatus?.doing || 0} />
        <Stat label="Completed" value={data.stats.byStatus?.done || 0} />
        <Stat
          label="Overdue"
          value={data.stats.overdue}
          tone={data.stats.overdue > 0 ? 'destructive' : undefined}
        />
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4 grid md:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Search</Label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Task title…"
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">User</Label>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {data.users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="doing">Doing</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Due date</Label>
          <div className="flex gap-2">
            <Input type="date" value={dueFilter} onChange={(e) => setDueFilter(e.target.value)} />
            {dueFilter && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setDueFilter('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">Task</th>
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Due</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const u = data.users.find((x) => x.id === t.userId);
                const c = t.category;
                const overdue = t.status !== 'done' && isOverdue(t.dueDate);
                return (
                  <tr key={t.id} className="border-t hover:bg-secondary/30">
                    <td className="p-3">
                      <div className="font-medium">{t.title}</div>
                      {t.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3">{u?.name || '—'}</td>
                    <td className="p-3">
                      {c ? (
                        <span className="inline-flex items-center gap-2">{c.name}</span>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className={cn('p-3', overdue && 'text-destructive font-medium')}>
                      {format(parseISO(t.dueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={t.status} overdue={overdue} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-sm text-muted-foreground">
                    No tasks match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'destructive' }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1 text-2xl font-display font-semibold',
          tone === 'destructive' && 'text-destructive'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status, overdue }: { status: string; overdue: boolean }) {
  if (overdue) return <Badge variant="destructive">Overdue</Badge>;
  const map: Record<string, string> = {
    todo: 'bg-muted text-foreground',
    doing: 'bg-amber-100 text-amber-900',
    done: 'bg-green-100 text-green-900',
  };
  return (
    <Badge className={cn('border-0', map[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
