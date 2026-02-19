import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams({ from: '/item/$itemId' });

  return (
    <div className="container px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Storefront
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-serif font-bold mb-4">Item Details</h1>
          <p className="text-muted-foreground">
            Backend functionality is being updated. Item details will appear here soon.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Item ID: {itemId}
          </p>
        </div>
      </div>
    </div>
  );
}
