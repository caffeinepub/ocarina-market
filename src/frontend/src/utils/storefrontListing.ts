import { Item, ItemCategory } from '../backend';

/**
 * View mode options for storefront listing display
 */
export type ViewMode =
  | { kind: 'all' }
  | { kind: 'priceAsc' }
  | { kind: 'priceDesc' }
  | { kind: 'category'; category: ItemCategory };

/**
 * Apply filtering and sorting to items based on view mode
 * Returns a new array without mutating the original
 */
export function applyViewMode(items: Item[], mode: ViewMode): Item[] {
  let result = [...items];

  switch (mode.kind) {
    case 'all':
      // No filtering or sorting, return as-is
      break;

    case 'priceAsc':
      result.sort((a, b) => Number(a.priceInCents) - Number(b.priceInCents));
      break;

    case 'priceDesc':
      result.sort((a, b) => Number(b.priceInCents) - Number(a.priceInCents));
      break;

    case 'category':
      result = result.filter((item) => item.category === mode.category);
      break;
  }

  return result;
}

/**
 * Get display label for a view mode
 */
export function getViewModeLabel(mode: ViewMode): string {
  switch (mode.kind) {
    case 'all':
      return 'All items';
    case 'priceAsc':
      return 'Price: Low to High';
    case 'priceDesc':
      return 'Price: High to Low';
    case 'category':
      return mode.category === ItemCategory.printed ? 'Category: 3D printed' : 'Category: Ceramic';
  }
}
