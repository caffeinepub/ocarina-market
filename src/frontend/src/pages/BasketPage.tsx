import { useNavigate } from '@tanstack/react-router';
import { useBasket } from '../hooks/useBasket';
import { useGetMultipleItems } from '../hooks/useQueries';
import { useCreateCheckoutSessionFromBasket, useIsStripeConfigured } from '../hooks/useStripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { encodeItemId } from '../lib/idEncoding';
import { formatAudFromCents } from '../utils/currency';

export default function BasketPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { itemIds, itemCount, removeItem, clearBasket } = useBasket();
  const { data: items = [], isLoading, refetch } = useGetMultipleItems(itemIds);
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const createCheckoutSession = useCreateCheckoutSessionFromBasket();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const eligibleItems = items.filter(item => !item.sold && item.priceInCents > 0);
  const ineligibleItems = items.filter(item => item.sold || item.priceInCents <= 0);

  const totalPrice = eligibleItems.reduce((sum, item) => sum + Number(item.priceInCents), 0);
  const formattedTotal = formatAudFromCents(totalPrice);

  const handleRemoveItem = (itemId: Uint8Array) => {
    removeItem(itemId);
    toast.success('Item removed from basket');
  };

  const handleClearBasket = () => {
    clearBasket();
    toast.success('Basket cleared');
  };

  const handleCheckout = async () => {
    if (eligibleItems.length === 0) {
      toast.error('No eligible items in basket');
      return;
    }

    if (!isStripeConfigured) {
      toast.error('Payment system is not configured yet');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Force refresh items to check for sold status
      await queryClient.invalidateQueries({ queryKey: ['multipleItems'] });
      const { data: refreshedItems } = await refetch();

      if (!refreshedItems) {
        throw new Error('Failed to refresh items');
      }

      // Check if any items became sold
      const nowSold = refreshedItems.filter(item => 
        eligibleItems.some(eligible => 
          Array.from(eligible.id).join(',') === Array.from(item.id).join(',')
        ) && item.sold
      );

      if (nowSold.length > 0) {
        toast.error('Some items in your basket are no longer available. Please review and update your basket.');
        setIsCheckingOut(false);
        return;
      }

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const session = await createCheckoutSession.mutateAsync({
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failure`,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleItemClick = (itemId: Uint8Array) => {
    navigate({ 
      to: '/items/$itemId', 
      params: { itemId: encodeItemId(itemId) } 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Your Basket is Empty</h1>
          <p className="text-muted-foreground">
            Browse our collection and add items to your basket.
          </p>
          <Button onClick={() => navigate({ to: '/' })} size="lg">
            Continue Shopping
          </Button>
        </div>
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
        Continue Shopping
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Shopping Basket</h1>
            {itemCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearBasket}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Eligible Items */}
          {eligibleItems.length > 0 && (
            <div className="space-y-3">
              {eligibleItems.map((item) => (
                <Card key={Array.from(item.id).join(',')} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div 
                        className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                        onClick={() => handleItemClick(item.id)}
                      >
                        <img
                          src={item.photo.getDirectURL()}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/generated/product-placeholder.dim_800x800.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div 
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleItemClick(item.id)}
                          >
                            <h3 className="font-semibold capitalize">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-semibold text-primary mt-2">
                          {formatAudFromCents(item.priceInCents)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Ineligible Items */}
          {ineligibleItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Unavailable Items</p>
              </div>
              {ineligibleItems.map((item) => (
                <Card key={Array.from(item.id).join(',')} className="overflow-hidden opacity-60">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div 
                        className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                        onClick={() => handleItemClick(item.id)}
                      >
                        <img
                          src={item.photo.getDirectURL()}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/generated/product-placeholder.dim_800x800.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleItemClick(item.id)}
                          >
                            <h3 className="font-semibold capitalize">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {item.sold && (
                                <Badge variant="secondary">Sold</Badge>
                              )}
                              {item.priceInCents <= 0 && (
                                <Badge variant="secondary">Price Not Set</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({eligibleItems.length})</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={isCheckingOut || eligibleItems.length === 0 || !isStripeConfigured}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Checkout
                  </>
                )}
              </Button>

              {ineligibleItems.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {ineligibleItems.length} unavailable {ineligibleItems.length === 1 ? 'item' : 'items'} will not be included
                </p>
              )}

              {!isStripeConfigured && (
                <p className="text-xs text-destructive text-center">
                  Payment system not configured
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
