import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-bold mb-4">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate({ to: '/basket' })} variant="outline">
            Return to Basket
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
