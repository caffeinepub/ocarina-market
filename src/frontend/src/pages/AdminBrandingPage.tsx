import { useIsCallerAdmin, useGetBranding, useSetBranding } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Palette, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

export default function AdminBrandingPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: branding, isLoading: brandingLoading } = useGetBranding();
  const setBranding = useSetBranding();
  const navigate = useNavigate();

  const [appName, setAppName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [heroImagePath, setHeroImagePath] = useState('');

  useEffect(() => {
    if (branding) {
      setAppName(branding.appName || '');
      setLogoPath(branding.logo?.getDirectURL() || '');
      setHeroImagePath(branding.heroImage?.getDirectURL() || '');
    }
  }, [branding]);

  const handleSave = async () => {
    try {
      const brandingData = {
        appName: appName || 'Ocarina Market',
        logo: logoPath ? ExternalBlob.fromURL(logoPath) : ExternalBlob.fromURL('/assets/generated/logo.dim_512x512.png'),
        heroImage: heroImagePath ? ExternalBlob.fromURL(heroImagePath) : ExternalBlob.fromURL('/assets/generated/hero-bg.dim_1600x600.png'),
      };

      await setBranding.mutateAsync(brandingData);
      toast.success('Branding settings saved successfully!');
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding settings. Please try again.');
    }
  };

  if (adminLoading || brandingLoading) {
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/admin' })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Panel
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Palette className="h-8 w-8" />
          Branding Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your store's appearance and branding
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Branding</CardTitle>
          <CardDescription>
            Configure your store name, logo, and hero image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Store Name</Label>
            <Input
              id="appName"
              type="text"
              placeholder="Ocarina Market"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This name will appear in the header and throughout your store
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoPath">Logo Image Path</Label>
            <Input
              id="logoPath"
              type="text"
              placeholder="/assets/generated/logo.dim_512x512.png"
              value={logoPath}
              onChange={(e) => setLogoPath(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Path to your logo image (e.g., /assets/generated/logo.dim_512x512.png)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImagePath">Hero Background Image Path</Label>
            <Input
              id="heroImagePath"
              type="text"
              placeholder="/assets/generated/hero-bg.dim_1600x600.png"
              value={heroImagePath}
              onChange={(e) => setHeroImagePath(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Path to your hero section background image
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={setBranding.isPending}
              className="w-full"
            >
              {setBranding.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Branding Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
