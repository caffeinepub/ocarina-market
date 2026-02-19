import { useState, useRef } from 'react';
import { useIsCallerAdmin, useBulkUploadPhotos, useGetShapeCategories } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { ItemCategory } from '../backend';
import { getLabelFromCategory } from '../utils/itemCategory';
import { toast } from 'sonner';
import { verifyBulkUpload } from '../utils/bulkUploadVerification';

export default function AdminBulkUploadPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: shapeCategories, isLoading: categoriesLoading } = useGetShapeCategories();
  const { actor } = useActor();
  const bulkUpload = useBulkUploadPhotos();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>(ItemCategory.ceramic);
  const [selectedShapeCategory, setSelectedShapeCategory] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error('Some files were skipped (only images are allowed)');
    }
    
    setSelectedFiles(imageFiles);
    setUploadProgress({});
    setVerificationComplete(false);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    if (!selectedShapeCategory) {
      toast.error('Please select a shape subcategory');
      return;
    }

    try {
      const itemIds = await bulkUpload.mutateAsync({
        files: selectedFiles,
        category: selectedCategory,
        shapeCategory: selectedShapeCategory,
        onProgress: (index, percentage) => {
          setUploadProgress(prev => ({ ...prev, [index]: percentage }));
        },
      });

      toast.success(`Successfully uploaded ${itemIds.length} items`);

      if (actor) {
        setIsVerifying(true);
        try {
          await verifyBulkUpload(itemIds, actor);
          setVerificationComplete(true);
          toast.success('All items verified and accessible');
        } catch (verifyError: any) {
          console.error('Verification error:', verifyError);
          toast.error(verifyError.message || 'Verification failed');
        } finally {
          setIsVerifying(false);
        }
      }

      setSelectedFiles([]);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload items');
      setIsVerifying(false);
    }
  };

  const overallProgress = selectedFiles.length > 0
    ? Object.values(uploadProgress).reduce((sum, val) => sum + val, 0) / selectedFiles.length
    : 0;

  if (adminLoading || categoriesLoading) {
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
          <Upload className="h-8 w-8" />
          Bulk Photo Upload
        </h1>
        <p className="text-muted-foreground">
          Upload multiple photos to create ocarina items. Items will be automatically published with names matching the selected shape subcategory.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Configuration</CardTitle>
          <CardDescription>
            Select category, shape subcategory, and photos to upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Item Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as ItemCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemCategory.ceramic}>
                  {getLabelFromCategory(ItemCategory.ceramic)}
                </SelectItem>
                <SelectItem value={ItemCategory.printed}>
                  {getLabelFromCategory(ItemCategory.printed)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shape Subcategory Selection */}
          <div className="space-y-2">
            <Label htmlFor="shape-category">Shape Subcategory</Label>
            {!shapeCategories || shapeCategories.length === 0 ? (
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  No shape subcategories available. Please add some in the Shape Categories management page.
                </p>
              </div>
            ) : (
              <Select
                value={selectedShapeCategory}
                onValueChange={setSelectedShapeCategory}
              >
                <SelectTrigger id="shape-category">
                  <SelectValue placeholder="Select a shape subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {shapeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="photos">Select Photos</Label>
            <Input
              ref={fileInputRef}
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={bulkUpload.isPending}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Preview Grid */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <Label>Preview</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm font-medium">
                          {Math.round(uploadProgress[index])}%
                        </div>
                      </div>
                    )}
                    {uploadProgress[index] === 100 && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {bulkUpload.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Upload Progress</span>
                <span className="font-medium">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} />
            </div>
          )}

          {/* Verification Status */}
          {isVerifying && (
            <div className="flex items-center gap-2 p-4 border border-border rounded-lg bg-muted/30">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Verifying uploaded items...</span>
            </div>
          )}

          {verificationComplete && (
            <div className="flex items-center gap-2 p-4 border border-green-600 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400">
                All items uploaded and verified successfully
              </span>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={bulkUpload.isPending || selectedFiles.length === 0 || !selectedShapeCategory || isVerifying}
            className="w-full"
            size="lg"
          >
            {bulkUpload.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading {selectedFiles.length} item{selectedFiles.length !== 1 ? 's' : ''}...
              </>
            ) : isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload {selectedFiles.length} Item{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {/* Info Message */}
          <div className="flex items-start gap-2 p-4 border border-border rounded-lg bg-muted/30">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Upload Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All items will be automatically published</li>
                <li>Item names will match the selected shape subcategory</li>
                <li>Default descriptions will be assigned based on category</li>
                <li>You can edit individual items after upload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
