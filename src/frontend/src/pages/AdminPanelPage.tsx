import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useIsStripeConfigured } from '../hooks/useStripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Upload } from 'lucide-react';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import StripeSetup from '../components/StripeSetup';

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isLoadingAdmin } = useIsCallerAdmin();
  const { data: isStripeConfigured } = useIsStripeConfigured();

  if (isLoadingAdmin) {
    return (
      <div className="container px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your store settings and content</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Stripe Configuration
              </CardTitle>
              <CardDescription>
                {isStripeConfigured ? 'Payment system is configured' : 'Configure payment processing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StripeSetup />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Upload
              </CardTitle>
              <CardDescription>
                Upload multiple items at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate({ to: '/admin/bulk-upload' })}
                variant="outline"
                className="w-full"
              >
                Go to Bulk Upload
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-400">Backend Update in Progress</CardTitle>
            <CardDescription>
              Some admin features are temporarily unavailable while the backend is being updated.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
