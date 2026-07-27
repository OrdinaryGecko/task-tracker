import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }
    if (password !== confirm) {
      return toast.error('Passwords do not match.');
    }

    setIsLoading(true);
    const result = await register(name, email, password);
    setIsLoading(false);

    if (!result.success) {
      return toast.error(result.error);
    }

    toast.success('Account created!');
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
          <h2 className="text-3xl font-display font-semibold">Create account</h2>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
