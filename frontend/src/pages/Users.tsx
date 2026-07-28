import { useState, useEffect } from 'react';
import api, { UserWithStats } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Users() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-display font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {users.length} user{users.length !== 1 && 's'} registered
        </p>
      </header>

      <div className="mt-6 border rounded-lg overflow-hidden">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium w-[80px]">Role</th>
              <th className="text-left px-4 py-3 font-medium w-[80px]">Tasks</th>
              <th className="text-left px-4 py-3 font-medium w-[120px]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium truncate">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground truncate">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={u.role === 'admin' ? 'default' : 'secondary'}
                    className="whitespace-nowrap"
                  >
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">{u._count.tasks}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
