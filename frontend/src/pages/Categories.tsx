import { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api, { Category } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }

  function onOpen(cat: Category | null) {
    setEditing(cat);
    setName(cat?.name || '');
    setOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter a name');

    setIsSubmitting(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name });
        toast.success('Category updated');
      } else {
        await api.post('/categories', { name });
        toast.success('Category added');
      }
      fetchCategories();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onDelete(cat: Category) {
    const count = cat._count?.tasks || 0;
    if (
      !confirm(
        `Delete "${cat.name}"? ${count > 0 ? `${count} task(s) will be unassigned.` : ''}`
      )
    )
      return;

    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  }

  if (user?.role !== 'admin') return null;

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Admin</p>
          <h1 className="text-3xl md:text-4xl font-display font-semibold mt-1">Categories</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Buckets your team can assign tasks to — like Work, Personal, or Learning.
          </p>
        </div>
        <Button
          onClick={() => onOpen(null)}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4 mr-1" /> New category
        </Button>
      </header>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {categories.map((c) => {
          const count = c._count?.tasks || 0;
          return (
            <div key={c.id} className="rounded-xl border bg-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  {count} task{count === 1 ? '' : 's'}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpen(c)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(c)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            No categories yet. Add one to let your team classify tasks.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? 'Rename category' : 'New category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marketing"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
