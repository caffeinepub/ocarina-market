import { useState } from 'react';
import { useSetStripeConfiguration } from '../hooks/useStripe';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface StripeSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StripeSetup({ open, onOpenChange }: StripeSetupProps) {
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  const setStripeConfig = useSetStripeConfiguration();

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length === 2);

    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success('Stripe configured successfully');
      onOpenChange(false);
      setSecretKey('');
    } catch (error) {
      toast.error('Failed to configure Stripe');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configure Stripe Payments
          </DialogTitle>
          <DialogDescription>
            Enter your Stripe secret key and allowed countries to enable payments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              placeholder="US,CA,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use 2-letter country codes (e.g., US, CA, GB, FR)
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={setStripeConfig.isPending}
            className="w-full"
          >
            {setStripeConfig.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
