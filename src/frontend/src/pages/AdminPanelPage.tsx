import { useIsCallerAdmin, useUpdateAllPrintedItemDescriptions } from '../hooks/useQueries';
import { useIsStripeConfigured } from '../hooks/useStripe';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import StripeSetup from '../components/StripeSetup';
import CategoryPriceEditor from '../components/CategoryPriceEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CreditCard, Upload, CheckCircle2, XCircle, Settings, Palette, RefreshCw, Tag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export default function AdminPanelPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: isStripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const navigate = useNavigate();
  const updatePrintedDescriptions = useUpdateAllPrintedItemDescriptions();

  const handleUpdatePrintedDescriptions = async () => {
    const newDescription = "Expertly crafted 3D printed product with clean layer lines and precision detailing. Lightweight material ensures durability without compromising on structural integrity. Ideal for both functional use and display, showcasing the advanced capabilities of modern additive manufacturing. Finished with a professional touch for superior aesthetic appeal. Perfect for collectors and creators seeking high-quality, customizable items.";
    
    try {
      await updatePrintedDescriptions.mutateAsync(newDescription);
      toast.success('3D printed item descriptions updated successfully');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update descriptions');
    }
  };

  if (adminLoading || stripeLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Settings className="h-8 w-8" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage your store settings and configurations
        </p>
      </div>

      <div className="grid gap-6">
        {/* Stripe Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Payment Configuration
            </CardTitle>
            <CardDescription>
              Configure Stripe to enable customer payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {isStripeConfigured ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Stripe is configured</p>
                      <p className="text-sm text-muted-foreground">
                        Customers can now make purchases
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">Stripe not configured</p>
                      <p className="text-sm text-muted-foreground">
                        Set up Stripe to enable payments
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Button 
                onClick={() => setShowStripeSetup(true)}
                variant={isStripeConfigured ? 'outline' : 'default'}
              >
                {isStripeConfigured ? 'Reconfigure' : 'Configure Stripe'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Pricing Card */}
        <CategoryPriceEditor />

        {/* Branding Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Customize your store name, logo, and hero image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate({ to: '/admin/branding' })}
              className="w-full"
            >
              <Palette className="mr-2 h-4 w-4" />
              Configure Branding
            </Button>
          </CardContent>
        </Card>

        {/* Shape Categories Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Shape Subcategories
            </CardTitle>
            <CardDescription>
              Manage shape subcategories for ocarina items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate({ to: '/admin/shape-categories' })}
              className="w-full"
            >
              <Tag className="mr-2 h-4 w-4" />
              Manage Shape Subcategories
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Photo Upload
            </CardTitle>
            <CardDescription>
              Upload multiple photos to create ocarina items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate({ to: '/admin/upload' })}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Go to Bulk Upload
            </Button>
          </CardContent>
        </Card>

        {/* Update 3D Printed Descriptions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Update 3D Printed Item Descriptions
            </CardTitle>
            <CardDescription>
              Refresh descriptions for all 3D printed items with updated text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleUpdatePrintedDescriptions}
              disabled={updatePrintedDescriptions.isPending}
              className="w-full"
            >
              {updatePrintedDescriptions.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update 3D Printed Descriptions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <StripeSetup 
        open={showStripeSetup} 
        onOpenChange={setShowStripeSetup}
      />
    </div>
  );
}
