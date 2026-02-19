import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="container px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. Admin privileges are required.
        </p>
        <Button onClick={() => navigate({ to: '/' })} size="lg">
          Return to Storefront
        </Button>
      </div>
    </div>
  );
}
