import { useState, useMemo } from 'react';
import { useGetStorefrontItems } from '../hooks/useQueries';
import ItemCard from '../components/ItemCard';
import StorefrontHeroMedia from '../components/StorefrontHeroMedia';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyViewMode, getViewModeLabel, ViewMode } from '../utils/storefrontListing';
import { ItemCategory } from '../backend';

export default function StorefrontPage() {
  const { data: storefrontData, isLoading } = useGetStorefrontItems();
  const [viewMode, setViewMode] = useState<ViewMode>({ kind: 'all' });

  // Apply view mode to items
  const displayedItems = useMemo(() => {
    if (!storefrontData?.items) return [];
    return applyViewMode(storefrontData.items, viewMode);
  }, [storefrontData?.items, viewMode]);

  const handleViewModeChange = (value: string) => {
    switch (value) {
      case 'all':
        setViewMode({ kind: 'all' });
        break;
      case 'priceAsc':
        setViewMode({ kind: 'priceAsc' });
        break;
      case 'priceDesc':
        setViewMode({ kind: 'priceDesc' });
        break;
      case 'category-printed':
        setViewMode({ kind: 'category', category: ItemCategory.printed });
        break;
      case 'category-ceramic':
        setViewMode({ kind: 'category', category: ItemCategory.ceramic });
        break;
    }
  };

  const getSelectValue = (): string => {
    switch (viewMode.kind) {
      case 'all':
        return 'all';
      case 'priceAsc':
        return 'priceAsc';
      case 'priceDesc':
        return 'priceDesc';
      case 'category':
        return viewMode.category === ItemCategory.printed ? 'category-printed' : 'category-ceramic';
    }
  };

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
        ) : !storefrontData ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No items available yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* View Mode Control - Always visible when not loading and storefrontData exists */}
            <div className="mb-8 flex justify-end">
              <div className="w-full sm:w-64">
                <Select value={getSelectValue()} onValueChange={handleViewModeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="View options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All items</SelectItem>
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                    <SelectItem value="category-printed">Category: 3D printed</SelectItem>
                    <SelectItem value="category-ceramic">Category: Ceramic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Grid or Empty State */}
            {!storefrontData.items || storefrontData.items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No items available yet. Check back soon!
                </p>
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No items match your selection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedItems.map((item) => (
                  <ItemCard key={item.id.toString()} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
