import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetItem, useIsCallerAdmin } from '../hooks/useQueries';
import { useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useStripe';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useBasket } from '../hooks/useBasket';
import { decodeItemId } from '../lib/idEncoding';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import PriceEditor from '../components/PriceEditor';
import AdminItemEditor from '../components/AdminItemEditor';
import StripeSetup from '../components/StripeSetup';
import { toast } from 'sonner';

export default function ItemDetailPage() {
  const { itemId } = useParams({ from: '/items/$itemId' });
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const { identity } = useInternetIdentity();
  const { addItem, hasItem } = useBasket();

  const itemIdBytes = decodeItemId(itemId);
  const { data: item, isLoading } = useGetItem(itemIdBytes);
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const createCheckoutSession = useCreateCheckoutSession();

  const isAuthenticated = !!identity;
  const isInBasket = item ? hasItem(item.id) : false;

  const imageUrl = imageError 
    ? '/assets/generated/product-placeholder.dim_800x800.png'
    : item?.photo.getDirectURL();

  const formattedPrice = item && item.priceInCents > 0 
    ? `$${(Number(item.priceInCents) / 100).toFixed(2)}`
    : null;

  // Guest checkout enabled: only check item availability, price, and Stripe config
  const canPurchase = item && !item.sold && item.priceInCents > 0 && isStripeConfigured;

  const handleAddToBasket = () => {
    if (!item) return;

    if (item.sold) {
      toast.error('This item is already sold');
      return;
    }

    if (item.priceInCents <= 0) {
      toast.error('This item does not have a valid price set');
      return;
    }

    addItem(item.id);
    toast.success('Added to basket');
  };

  const handleBuyNow = async () => {
    if (!item) return;

    if (!isStripeConfigured) {
      if (isAdmin) {
        setShowStripeSetup(true);
      } else {
        toast.error('Payment system is not configured yet');
      }
      return;
    }

    if (item.priceInCents <= 0) {
      toast.error('This item does not have a valid price set');
      return;
    }

    try {
      const shoppingItems = [{
        productName: item.title,
        productDescription: item.description,
        priceInCents: item.priceInCents,
        quantity: BigInt(1),
        currency: 'usd',
      }];

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const session = await createCheckoutSession.mutateAsync({
        items: shoppingItems,
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failure`,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  const handlePhotoUpdateSuccess = () => {
    setImageError(false);
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
        <p className="text-muted-foreground">Item not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Return to Storefront
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate({ to: '/' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Storefront
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold capitalize">{item.title}</h1>
              {item.sold && (
                <Badge variant="secondary" className="text-base px-3 py-1">Sold</Badge>
              )}
            </div>
            {formattedPrice && (
              <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
            )}
            {!formattedPrice && !isAdmin && (
              <p className="text-lg text-muted-foreground">Price not set</p>
            )}
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/90 leading-relaxed">{item.description}</p>
          </div>

          {/* Admin Price Editor */}
          {isAdmin && (
            <PriceEditor 
              itemId={item.id} 
              currentPriceInCents={item.priceInCents} 
            />
          )}

          {/* Admin Item Editor */}
          {isAdmin && (
            <AdminItemEditor 
              itemId={item.id} 
              currentDescription={item.description}
              onPhotoUpdateSuccess={handlePhotoUpdateSuccess}
            />
          )}

          {/* Action Buttons */}
          {!item.sold && (
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleBuyNow}
                disabled={createCheckoutSession.isPending || !isStripeConfigured || item.priceInCents <= 0}
              >
                {createCheckoutSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={handleAddToBasket}
                disabled={isInBasket || item.priceInCents <= 0}
              >
                {isInBasket ? (
                  'Already in Basket'
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Add to Basket
                  </>
                )}
              </Button>
            </div>
          )}

          {item.sold && (
            <div className="p-4 border border-border rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">This item has been sold</p>
            </div>
          )}

          {!isStripeConfigured && isAdmin && (
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <p className="text-sm text-destructive">
                Stripe is not configured. Visit the Admin Panel to set up payments.
              </p>
            </div>
          )}
        </div>
      </div>

      <StripeSetup open={showStripeSetup} onOpenChange={setShowStripeSetup} />
    </div>
  );
}
