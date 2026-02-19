import { useNavigate } from '@tanstack/react-router';
import { useBasket } from '../hooks/useBasket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function BasketPage() {
  const navigate = useNavigate();
  const { getBasketItemCount, clearBasket } = useBasket();
  const basketCount = getBasketItemCount();

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Basket
            </CardTitle>
          </CardHeader>
          <CardContent>
            {basketCount === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Your basket is empty</p>
                <Button onClick={() => navigate({ to: '/' })}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You have {basketCount} item{basketCount !== 1 ? 's' : ''} in your basket.
                </p>
                <p className="text-sm text-muted-foreground">
                  Backend functionality is being updated. Full basket details will appear here soon.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={clearBasket}>
                    Clear Basket
                  </Button>
                  <Button onClick={() => navigate({ to: '/' })}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
