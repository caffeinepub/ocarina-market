import { Item } from '../backend';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { encodeItemId } from '../lib/idEncoding';
import { useState } from 'react';
import { formatAudFromCents } from '../utils/currency';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const imageUrl = imageError 
    ? '/assets/generated/product-placeholder.dim_800x800.png'
    : item.photo.getDirectURL();

  const formattedPrice = item.priceInCents > 0 
    ? formatAudFromCents(item.priceInCents)
    : 'Price not set';

  const handleClick = () => {
    const encodedId = encodeItemId(item.id);
    navigate({ to: '/items/$itemId', params: { itemId: encodedId } });
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg capitalize line-clamp-1">
            {item.title}
          </h3>
          {item.sold && (
            <Badge variant="secondary" className="shrink-0">
              Sold
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="text-xl font-bold text-primary">
          {formattedPrice}
        </p>
      </CardFooter>
    </Card>
  );
}
