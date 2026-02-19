import { useState } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useStripe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { StripeConfiguration } from '../backend';

export default function StripeSetup() {
  const { data: isConfigured } = useIsStripeConfigured();
  const setConfiguration = useSetStripeConfiguration();
  const [open, setOpen] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('AU,US,GB,CA');

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error('Please enter a Stripe secret key');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    try {
      const config: StripeConfiguration = {
        secretKey: secretKey.trim(),
        allowedCountries,
      };

      await setConfiguration.mutateAsync(config);
      toast.success('Stripe configuration saved');
      setOpen(false);
      setSecretKey('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isConfigured ? 'outline' : 'default'} className="w-full">
          {isConfigured ? 'Reconfigure Stripe' : 'Configure Stripe'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="AU,US,GB,CA"
            />
            <p className="text-xs text-muted-foreground">
              Enter country codes separated by commas (e.g., AU, US, GB, CA)
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={setConfiguration.isPending}
            className="w-full"
          >
            {setConfiguration.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
