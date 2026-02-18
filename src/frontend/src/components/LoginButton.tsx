import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, Settings } from 'lucide-react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={handleAuth}
        disabled={disabled}
        variant="default"
      >
        {disabled ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </>
        )}
      </Button>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
              <Settings className="mr-2 h-4 w-4" />
              Admin Panel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: '/admin/upload' })}>
              <Settings className="mr-2 h-4 w-4" />
              Bulk Upload
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAuth}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant="outline"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
