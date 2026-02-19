import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useBulkUploadItems } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { ExternalBlob, ItemCategory, BulkItemInput } from '../backend';

export default function AdminBulkUploadPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isLoadingAdmin } = useIsCallerAdmin();
  const bulkUpload = useBulkUploadItems();

  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.ceramic);
  const [shapeCategory, setShapeCategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (!shapeCategory.trim()) {
      toast.error('Please enter a shape category');
      return;
    }

    try {
      const items: BulkItemInput[] = await Promise.all(
        files.map(async (file, index) => {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const photo = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: percentage }));
          });

          return {
            photo,
            contentType: file.type,
            description: `Item ${index + 1}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            category,
            shapeCategory: shapeCategory.trim(),
            quantity: BigInt(0),
          };
        })
      );

      await bulkUpload.mutateAsync(items);
      toast.success(`Successfully uploaded ${files.length} items`);
      setFiles([]);
      setUploadProgress({});
      navigate({ to: '/admin' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload items');
    }
  };

  return (
    <div className="container px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/admin' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Panel
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Bulk Upload Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ItemCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemCategory.ceramic}>Ceramic</SelectItem>
                <SelectItem value={ItemCategory.printed}>3D Printed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shapeCategory">Shape Category</Label>
            <Input
              id="shapeCategory"
              value={shapeCategory}
              onChange={(e) => setShapeCategory(e.target.value)}
              placeholder="e.g., Bowl, Vase, Cup"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Photos</Label>
            <Input
              id="files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {uploadProgress[file.name] !== undefined && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                        {Math.round(uploadProgress[file.name])}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={bulkUpload.isPending || files.length === 0}
            className="w-full"
            size="lg"
          >
            {bulkUpload.isPending ? (
              <>
                <Upload className="mr-2 h-5 w-5 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload {files.length} Item{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
