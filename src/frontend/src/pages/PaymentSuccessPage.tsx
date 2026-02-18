import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetStripeSessionStatus } from '../hooks/useStripe';
import { useBasket } from '../hooks/useBasket';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearBasket } = useBasket();

  // Extract session_id from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  const { data: sessionStatus, isLoading, isError } = useGetStripeSessionStatus(sessionId);

  useEffect(() => {
    // Invalidate items to refresh sold status regardless of session status
    // This ensures the storefront reflects any changes after payment
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['multipleItems'] });
    
    // Clear basket on successful payment
    clearBasket();
  }, [queryClient, clearBasket]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center space-y-6">
        {isLoading ? (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Confirming Payment...</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your payment.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            {sessionStatus?.__kind__ === 'completed' && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You will receive a confirmation email shortly.
                </p>
              </div>
            )}
            {isError && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Payment completed successfully. Thank you for your purchase!
                </p>
              </div>
            )}
            <Button onClick={() => navigate({ to: '/' })} size="lg">
              Return to Storefront
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
