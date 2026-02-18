import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was cancelled. No charges were made to your account. Your basket items are still saved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            Return to Storefront
          </Button>
          <Button onClick={() => navigate({ to: '/basket' })}>
            View Basket
          </Button>
        </div>
      </div>
    </div>
  );
}
