import { useState, useRef } from 'react';
import { useIsCallerAdmin, useBulkUploadPhotos } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Loader2, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { verifyBulkUpload } from '../utils/bulkUploadVerification';

interface UploadFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'verifying' | 'success' | 'error';
  progress: number;
}

export default function AdminBulkUploadPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { actor } = useActor();
  const bulkUpload = useBulkUploadPhotos();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Please select at least one image file');
      return;
    }

    const newUploadFiles: UploadFile[] = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (!actor) {
      toast.error('Backend connection not available');
      return;
    }

    setUploadFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

    try {
      // Step 1: Upload files to backend
      const itemIds = await bulkUpload.mutateAsync({
        files: uploadFiles.map(uf => uf.file),
        onProgress: (index, percentage) => {
          setUploadFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress: percentage } : f
          ));
        },
      });

      // Step 2: Verify uploads
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'verifying' as const, progress: 100 })));

      await verifyBulkUpload(itemIds, actor);

      // Step 3: Invalidate caches to refresh data
      await queryClient.invalidateQueries({ queryKey: ['items'] });
      await queryClient.invalidateQueries({ queryKey: ['storefrontItems'] });

      // Step 4: Mark as success
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'success' as const, progress: 100 })));
      toast.success(`Successfully uploaded and verified ${uploadFiles.length} item(s)`);
      
      setTimeout(() => {
        navigate({ to: '/' });
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Upload failed: ${errorMessage}. Please try again.`);
    }
  };

  const handleClear = () => {
    uploadFiles.forEach(uf => URL.revokeObjectURL(uf.preview));
    setUploadFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = uploadFiles.some(f => f.status === 'uploading' || f.status === 'verifying');
  const allSuccess = uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'success');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Bulk Photo Upload
          </CardTitle>
          <CardDescription>
            Upload multiple photos to create one ocarina item per photo. Each item will have an auto-generated description.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                asChild
              >
                <span>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Photos
                </span>
              </Button>
            </label>
          </div>

          {/* Preview Grid */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {uploadFiles.length} photo(s) selected
                </p>
                {!isUploading && !allSuccess && (
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uploadFiles.map((uf, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <img
                        src={uf.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {uf.status === 'uploading' && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                        <Progress value={uf.progress} className="w-3/4" />
                      </div>
                    )}
                    {uf.status === 'verifying' && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                        <p className="text-xs text-muted-foreground">Verifying...</p>
                      </div>
                    )}
                    {uf.status === 'success' && (
                      <div className="absolute inset-0 bg-primary/80 flex items-center justify-center rounded-lg">
                        <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                      </div>
                    )}
                    {uf.status === 'error' && (
                      <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center rounded-lg">
                        <XCircle className="h-8 w-8 text-destructive-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {uploadFiles.length > 0 && !allSuccess && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {uploadFiles.some(f => f.status === 'verifying') 
                    ? 'Verifying uploads...' 
                    : `Uploading ${uploadFiles.length} item(s)...`}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload {uploadFiles.length} item(s)
                </>
              )}
            </Button>
          )}

          {allSuccess && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <p className="text-lg font-semibold">Upload Complete!</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to storefront...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
