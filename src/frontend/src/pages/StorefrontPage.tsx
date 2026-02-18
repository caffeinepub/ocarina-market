import { useGetItems, useGetBranding } from '../hooks/useQueries';
import ItemCard from '../components/ItemCard';
import { Loader2 } from 'lucide-react';

export default function StorefrontPage() {
  const { data: items, isLoading } = useGetItems();
  const { data: branding } = useGetBranding();

  const heroImageUrl = branding?.heroImage?.getDirectURL() || '/assets/generated/hero-bg.dim_1600x600.png';

  return (
    <div className="relative">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/80" />
        <div className="relative z-10 text-center space-y-2 px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Handcrafted Ocarinas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover unique, beautifully crafted ocarinas perfect for collectors and musicians
          </p>
        </div>
      </div>

      {/* Items Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No items available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id.toString()} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
