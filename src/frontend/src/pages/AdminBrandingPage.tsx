import { useIsCallerAdmin, useGetBranding, useSetBranding } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Palette, ArrowLeft, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ExternalBlob, BrandingAsset, StorefrontHeroText } from '../backend';
import { validateHeroMediaFile, inferContentType, buildMediaKind } from '../utils/brandingMedia';

export default function AdminBrandingPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: branding, isLoading: brandingLoading } = useGetBranding();
  const setBranding = useSetBranding();
  const navigate = useNavigate();
  const heroMediaFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const [appName, setAppName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroMediaFile, setHeroMediaFile] = useState<File | null>(null);
  const [heroMediaPreview, setHeroMediaPreview] = useState<string | null>(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (branding) {
      setAppName(branding.appName || '');
      setLogoPath(branding.logo?.getDirectURL() || '');
      setLogoPreview(branding.logo?.getDirectURL() || null);
      setHeroMediaPreview(branding.heroMedia?.blob.getDirectURL() || null);
      
      // Load hero text
      if (branding.storefrontHeroText.__kind__ === 'custom') {
        setHeroTitle(branding.storefrontHeroText.custom.title);
        setHeroSubtitle(branding.storefrontHeroText.custom.subtitle);
      } else {
        setHeroTitle('');
        setHeroSubtitle('');
      }
    }
  }, [branding]);

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleHeroMediaFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateHeroMediaFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file type');
      return;
    }

    setHeroMediaFile(file);

    // Create preview for images only
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setHeroMediaPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setHeroMediaPreview(null);
    }
  };

  const handleSave = async () => {
    try {
      let logoBlob: ExternalBlob;
      let heroMediaAsset: BrandingAsset;

      // Handle logo upload
      if (logoFile) {
        const arrayBuffer = await logoFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        logoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (logoPath) {
        logoBlob = ExternalBlob.fromURL(logoPath);
      } else if (branding?.logo) {
        logoBlob = branding.logo;
      } else {
        logoBlob = ExternalBlob.fromURL('/assets/generated/logo.dim_512x512.png');
      }

      // Handle hero media upload
      if (heroMediaFile) {
        const arrayBuffer = await heroMediaFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });

        const contentType = inferContentType(heroMediaFile);
        const mediaKind = buildMediaKind(heroMediaFile);

        heroMediaAsset = {
          blob,
          contentType,
          mediaKind,
        };
      } else if (branding?.heroMedia) {
        heroMediaAsset = branding.heroMedia;
      } else {
        heroMediaAsset = {
          blob: ExternalBlob.fromURL('/assets/generated/hero-bg.dim_1600x600.png'),
          contentType: 'image/png',
          mediaKind: { __kind__: 'image', image: null },
        };
      }

      // Handle hero text
      let storefrontHeroText: StorefrontHeroText;
      if (heroTitle.trim() && heroSubtitle.trim()) {
        storefrontHeroText = {
          __kind__: 'custom',
          custom: {
            title: heroTitle.trim(),
            subtitle: heroSubtitle.trim(),
          },
        };
      } else {
        storefrontHeroText = {
          __kind__: 'default',
          default: null,
        };
      }

      const brandingData = {
        appName: appName || 'Ocarina Market',
        logo: logoBlob,
        heroMedia: heroMediaAsset,
        storefrontHeroText,
      };

      await setBranding.mutateAsync(brandingData);
      toast.success('Branding settings saved successfully!');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding settings. Please try again.');
      setUploadProgress(0);
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

  const isUploading = setBranding.isPending && uploadProgress > 0;

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
            Configure your store name, logo, hero media, and hero text
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
            <Label htmlFor="logo">Logo</Label>
            <div className="space-y-3">
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileSelect}
                className="hidden"
                id="logoInput"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => logoFileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {logoFile ? logoFile.name : 'Upload Logo Image'}
              </Button>
              {logoPreview && (
                <div className="rounded-lg overflow-hidden border border-border p-4 bg-muted flex items-center justify-center">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-h-32 object-contain"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Upload an image file for your store logo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoPath">Logo Image Path (optional)</Label>
            <Input
              id="logoPath"
              type="text"
              placeholder="/assets/generated/logo.dim_512x512.png"
              value={logoPath}
              onChange={(e) => setLogoPath(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Or specify a path to your logo image (overrides uploaded file)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroMedia">Hero Media (Image or 3D Model)</Label>
            <div className="space-y-3">
              <input
                ref={heroMediaFileInputRef}
                type="file"
                accept="image/*,.obj,.3mf"
                onChange={handleHeroMediaFileSelect}
                className="hidden"
                id="heroMediaInput"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => heroMediaFileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {heroMediaFile ? heroMediaFile.name : 'Upload Hero Media'}
              </Button>
              {heroMediaPreview && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={heroMediaPreview} 
                    alt="Hero media preview" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              {heroMediaFile && !heroMediaFile.type.startsWith('image/') && (
                <p className="text-sm text-muted-foreground">
                  3D model selected: {heroMediaFile.name}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Upload an image or 3D model (.obj, .3mf) for your hero section
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              type="text"
              placeholder="Handcrafted Ocarinas"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Main heading displayed on the storefront hero section
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Input
              id="heroSubtitle"
              type="text"
              placeholder="Discover unique, beautifully crafted ocarinas perfect for collectors and musicians"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Subtitle text displayed below the hero title
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

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
