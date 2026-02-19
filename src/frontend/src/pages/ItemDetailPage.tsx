import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetItem, useIsCallerAdmin } from '../hooks/useQueries';
import { useCreateCheckoutSession } from '../hooks/useStripe';
import { useBasket } from '../hooks/useBasket';
import { decodeItemId } from '../lib/idEncoding';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShoppingCart, CreditCard, ArrowLeft, Package, Tag } from 'lucide-react';
import { formatAudFromCents } from '../utils/currency';
import { getLabelFromCategory } from '../utils/itemCategory';
import { getShapeCategoryLabel } from '../utils/shapeCategory';
import { toast } from 'sonner';
import PriceEditor from '../components/PriceEditor';
import AdminItemEditor from '../components/AdminItemEditor';
import AdminPublishToggle from '../components/AdminPublishToggle';
import { useState } from 'react';

export default function ItemDetailPage() {
  const { itemId: encodedId } = useParams({ from: '/item/$itemId' });
  const navigate = useNavigate();
  const itemId = decodeItemId(encodedId);
  const { data: item, isLoading, refetch } = useGetItem(itemId);
  const { data: isAdmin } = useIsCallerAdmin();
  const createCheckoutSession = useCreateCheckoutSession();
  const { addItem, hasItem } = useBasket();
  const [imageKey, setImageKey] = useState(0);

  const isInBasket = item ? hasItem(item.id) : false;

  const handleAddToBasket = () => {
    if (!item) return;
    addItem(item.id);
    toast.success('Added to basket');
  };

  const handleBuyNow = async () => {
    if (!item) return;

    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const session = await createCheckoutSession.mutateAsync({
        items: [{
          productName: item.title,
          productDescription: item.description,
          priceInCents: item.priceInCents,
          quantity: BigInt(1),
          currency: 'aud',
        }],
        successUrl,
        cancelUrl,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session');
    }
  };

  const handlePhotoUpdateSuccess = () => {
    setImageKey(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Item not found</h1>
        <Button onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Button>
      </div>
    );
  }

  const imageUrl = item.photo.getDirectURL();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Store
      </Button>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
            <img
              key={imageKey}
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/product-placeholder.dim_800x800.png';
              }}
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-bold">{item.title}</h1>
              {isAdmin && <AdminPublishToggle itemId={item.id} isPublished={item.published} />}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {getShapeCategoryLabel(item.shapeCategory)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {getLabelFromCategory(item.category)}
              </Badge>
              {item.sold && (
                <Badge variant="destructive">Sold</Badge>
              )}
            </div>

            <p className="text-3xl font-bold text-primary mb-2">
              {formatAudFromCents(Number(item.priceInCents))}
            </p>

            {isAdmin && (
              <div className="mb-4">
                <PriceEditor itemId={item.id} currentPriceInCents={item.priceInCents} />
              </div>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </CardContent>
          </Card>

          {!item.sold && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAddToBasket}
                disabled={isInBasket}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInBasket ? 'In Basket' : 'Add to Basket'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={createCheckoutSession.isPending}
                size="lg"
                className="flex-1"
              >
                {createCheckoutSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          )}

          {item.sold && (
            <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
              <p className="text-center font-medium text-destructive">
                This item has been sold
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Editor Section */}
      {isAdmin && (
        <div className="mt-8">
          <AdminItemEditor
            itemId={item.id}
            currentDescription={item.description}
            currentShapeCategory={item.shapeCategory}
            onPhotoUpdateSuccess={handlePhotoUpdateSuccess}
          />
        </div>
      )}
    </div>
  );
}
