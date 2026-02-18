import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublishItems, useUnpublishItems } from '../hooks/useQueries';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPublishToggleProps {
  itemId: Uint8Array;
  isPublished: boolean;
}

export default function AdminPublishToggle({ itemId, isPublished }: AdminPublishToggleProps) {
  const publishItems = usePublishItems();
  const unpublishItems = useUnpublishItems();

  const isLoading = publishItems.isPending || unpublishItems.isPending;

  const handleToggle = async () => {
    try {
      if (isPublished) {
        await unpublishItems.mutateAsync([itemId]);
        toast.success('Item unpublished successfully');
      } else {
        await publishItems.mutateAsync([itemId]);
        toast.success('Item published successfully');
      }
    } catch (error) {
      console.error('Error toggling publish state:', error);
      toast.error(`Failed to ${isPublished ? 'unpublish' : 'publish'} item`);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Badge variant={isPublished ? 'default' : 'secondary'}>
          {isPublished ? 'Published' : 'Unpublished'}
        </Badge>
      </div>
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant={isPublished ? 'outline' : 'default'}
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isPublished ? 'Unpublishing...' : 'Publishing...'}
          </>
        ) : (
          <>
            {isPublished ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
