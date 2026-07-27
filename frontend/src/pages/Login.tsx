import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      return toast.error(result.error);
    }

    toast.success('Welcome back!');
    navigate('/tasks');
  }

  async function fillAndSubmit(role: 'admin' | 'user') {
    const email = role === 'admin' ? 'admin@demo.io' : 'maya@demo.io';
    const password = role === 'admin' ? 'admin123' : 'user1234';
    setEmail(email);
    setPassword(password);

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      return toast.error(result.error);
    }

    toast.success('Welcome back!');
    navigate('/tasks');
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center p-12 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 font-display text-lg">
          <CheckSquare2 className="h-6 w-6 text-accent" />
          Task Tracker Lite
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 flex items-center gap-2 font-display text-lg">
            <CheckSquare2 className="h-6 w-6 text-accent" /> Task Tracker Lite
          </div>
          <h2 className="text-3xl font-display font-semibold">Sign in</h2>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@work.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border bg-secondary/40 p-3 text-xs">
            <div className="font-medium mb-2 text-foreground">Try a demo account</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillAndSubmit('admin')}
                className="flex-1 rounded-md bg-background border px-2 py-1.5 hover:border-accent text-left"
              >
                <div className="font-medium">Admin</div>
                <div className="text-muted-foreground truncate">admin@demo.io</div>
              </button>
              <button
                type="button"
                onClick={() => fillAndSubmit('user')}
                className="flex-1 rounded-md bg-background border px-2 py-1.5 hover:border-accent text-left"
              >
                <div className="font-medium">Normal user</div>
                <div className="text-muted-foreground truncate">maya@demo.io</div>
              </button>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            New here?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
