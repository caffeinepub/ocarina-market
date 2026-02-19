import { useState } from 'react';
import { useSetItemPrice } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface PriceEditorProps {
  itemId: Uint8Array;
  currentPriceInCents: bigint;
}

export default function PriceEditor({ itemId, currentPriceInCents }: PriceEditorProps) {
  const [price, setPrice] = useState((Number(currentPriceInCents) / 100).toFixed(2));
  const setItemPrice = useSetItemPrice();

  const handleSave = async () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const priceInCents = Math.round(priceValue * 100);
    try {
      await setItemPrice.mutateAsync({ itemId, priceInCents: BigInt(priceInCents) });
      toast.success('Price updated successfully');
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <h3 className="font-semibold flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Set Item Price
      </h3>
      <div className="space-y-2">
        <Label htmlFor="price">Price (AUD)</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">A$</span>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={setItemPrice.isPending}
          >
            {setItemPrice.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
