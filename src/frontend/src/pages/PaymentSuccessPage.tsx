import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useBasket } from '../hooks/useBasket';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearBasket } = useBasket();

  useEffect(() => {
    // Clear basket on successful payment
    clearBasket();
    queryClient.invalidateQueries({ queryKey: ['items'] });
  }, [clearBasket, queryClient]);

  return (
    <div className="container px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <Button onClick={() => navigate({ to: '/' })} size="lg">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
