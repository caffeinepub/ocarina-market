import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Settings, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
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
        size="default"
      >
        {loginStatus === 'logging-in' ? (
          <>
            <LogIn className="mr-2 h-4 w-4 animate-pulse" />
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default">
          <User className="mr-2 h-4 w-4" />
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
              <Settings className="mr-2 h-4 w-4" />
              Admin Panel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: '/admin/bulk-upload' })}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleAuth}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
