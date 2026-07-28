import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckSquare2, LayoutDashboard, ListTodo, Tags, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const nav = [
    { to: '/tasks', label: 'My tasks', icon: ListTodo, show: true },
    { to: '/dashboard', label: 'Admin dashboard', icon: LayoutDashboard, show: user.role === 'admin' },
    { to: '/categories', label: 'Categories', icon: Tags, show: user.role === 'admin' },
    { to: '/users', label: 'Users', icon: Users, show: user.role === 'admin' },
  ].filter((n) => n.show);

  function onLogout() {
    logout();
    toast.success('Signed out');
    navigate('/login');
  }

  const initials = user.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="p-5 flex items-center gap-2 font-display text-lg">
          <CheckSquare2 className="h-6 w-6 text-accent" />
          Task Tracker
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((n) => {
            const active = location.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate capitalize">{user.role}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 border-b bg-sidebar text-sidebar-foreground flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-display">
          <CheckSquare2 className="h-5 w-5 text-accent" /> Task Tracker
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main className="flex-1 min-w-0 md:pt-0 pt-14">
        {/* Mobile nav row */}
        <div className="md:hidden flex gap-2 px-4 py-3 border-b overflow-x-auto">
          {nav.map((n) => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${
                  active ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
        {children}
      </main>
    </div>
  );
}
