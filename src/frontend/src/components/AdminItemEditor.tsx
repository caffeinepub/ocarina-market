import { useState, useRef } from 'react';
import { useUpdateItemDescription, useUpdateItemPhoto, useGetShapeCategories } from '../hooks/useQueries';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Edit, Image } from 'lucide-react';
import { toast } from 'sonner';

interface AdminItemEditorProps {
  itemId: Uint8Array;
  currentDescription: string;
  currentShapeCategory: string;
  onPhotoUpdateSuccess?: () => void;
}

export default function AdminItemEditor({ 
  itemId, 
  currentDescription,
  currentShapeCategory,
  onPhotoUpdateSuccess 
}: AdminItemEditorProps) {
  const [description, setDescription] = useState(currentDescription);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDescription = useUpdateItemDescription();
  const updatePhoto = useUpdateItemPhoto();
  const { data: shapeCategories, isLoading: categoriesLoading } = useGetShapeCategories();

  const handleSaveDescription = async () => {
    if (!description.trim()) {
      toast.error('Description cannot be empty');
      return;
    }

    try {
      await updateDescription.mutateAsync({ itemId, description: description.trim() });
      toast.success('Description updated successfully');
    } catch (error) {
      toast.error('Failed to update description');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) {
      toast.error('Please select an image file');
      return;
    }

    try {
      await updatePhoto.mutateAsync({ itemId, file: selectedFile });
      toast.success('Image updated successfully');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onPhotoUpdateSuccess) {
        onPhotoUpdateSuccess();
      }
    } catch (error) {
      toast.error('Failed to update image');
    }
  };

  return (
    <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Edit className="h-5 w-5" />
        Admin Editor
      </h3>

      {/* Shape Subcategory Display */}
      <div className="space-y-2">
        <Label htmlFor="shape-category">Shape Subcategory</Label>
        {categoriesLoading ? (
          <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading categories...</span>
          </div>
        ) : (
          <Select value={currentShapeCategory} disabled>
            <SelectTrigger id="shape-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shapeCategories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground">
          Shape subcategory editing is currently read-only. Use the Shape Categories management page to rename categories.
        </p>
      </div>

      {/* Description Editor */}
      <div className="space-y-3">
        <Label htmlFor="description">Item Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Enter item description..."
          className="resize-none"
        />
        <Button 
          onClick={handleSaveDescription} 
          disabled={updateDescription.isPending || description === currentDescription}
          size="sm"
        >
          {updateDescription.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            'Save Description'
          )}
        </Button>
      </div>

      {/* Image Replacement */}
      <div className="space-y-3">
        <Label htmlFor="photo" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Replace Item Image
        </Label>
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="flex-1"
          />
          <Button 
            onClick={handleSavePhoto} 
            disabled={updatePhoto.isPending || !selectedFile}
            size="sm"
          >
            {updatePhoto.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>
    </div>
  );
}
