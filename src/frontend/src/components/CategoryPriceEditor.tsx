import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, DollarSign } from 'lucide-react';
import { useUpdateAllItemPricesByCategory } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function CategoryPriceEditor() {
  const updatePrices = useUpdateAllItemPricesByCategory();

  const handleUpdatePrices = async () => {
    try {
      await updatePrices.mutateAsync();
      toast.success('Category prices updated successfully', {
        description: '3D printed items: A$9.00, Ceramic items: A$19.00',
      });
    } catch (error: any) {
      console.error('Price update error:', error);
      toast.error(error.message || 'Failed to update category prices');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Bulk Pricing by Category
        </CardTitle>
        <CardDescription>
          Set prices for all items based on their category: 3D printed items to A$9.00, Ceramic items to A$19.00
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg bg-muted/30">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">3D printed items:</span>
                <span className="text-muted-foreground">A$9.00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ceramic items:</span>
                <span className="text-muted-foreground">A$19.00</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleUpdatePrices}
            disabled={updatePrices.isPending}
            className="w-full"
          >
            {updatePrices.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Prices...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Apply Category Pricing
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
