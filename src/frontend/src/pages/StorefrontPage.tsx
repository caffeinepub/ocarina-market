import { useGetStorefrontItems } from '../hooks/useQueries';
import ItemCard from '../components/ItemCard';
import StorefrontHeroMedia from '../components/StorefrontHeroMedia';
import { Loader2 } from 'lucide-react';

export default function StorefrontPage() {
  const { data: storefrontData, isLoading } = useGetStorefrontItems();

  return (
    <div className="relative">
      {/* Hero Section */}
      <StorefrontHeroMedia 
        heroMedia={storefrontData?.headerAsset || null}
        heroText={storefrontData?.heroText || null}
      />

      {/* Items Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !storefrontData?.items || storefrontData.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No items available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {storefrontData.items.map((item) => (
              <ItemCard key={item.id.toString()} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
