import { Item } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAudFromCents } from '../utils/currency';
import { getLabelFromCategory } from '../utils/itemCategory';
import { getShapeCategoryLabel } from '../utils/shapeCategory';
import { Tag, Package } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const imageUrl = item.photo.getDirectURL();

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/assets/product-placeholder.dim_800x800.png';
          }}
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Tag className="h-3 w-3" />
            {getShapeCategoryLabel(item.shapeCategory)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Package className="h-3 w-3" />
            {getLabelFromCategory(item.category)}
          </Badge>
          {item.sold && (
            <Badge variant="destructive" className="text-xs">Sold</Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        <p className="text-xl font-bold text-primary">{formatAudFromCents(Number(item.priceInCents))}</p>
      </CardContent>
    </Card>
  );
}
