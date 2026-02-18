import { ItemCategory } from '../backend';

/**
 * UI labels for item categories
 */
export const CATEGORY_LABELS = {
  PRINTED: '3D printed',
  CERAMIC: 'Ceramic',
} as const;

/**
 * Map UI label to backend ItemCategory enum
 */
export function getCategoryFromLabel(label: string): ItemCategory {
  switch (label) {
    case CATEGORY_LABELS.PRINTED:
      return ItemCategory.printed;
    case CATEGORY_LABELS.CERAMIC:
      return ItemCategory.ceramic;
    default:
      throw new Error(`Unknown category label: ${label}`);
  }
}

/**
 * Map backend ItemCategory enum to UI label
 */
export function getLabelFromCategory(category: ItemCategory): string {
  switch (category) {
    case ItemCategory.printed:
      return CATEGORY_LABELS.PRINTED;
    case ItemCategory.ceramic:
      return CATEGORY_LABELS.CERAMIC;
    default:
      return 'Unknown';
  }
}

/**
 * Get all available category options for UI selection
 */
export function getCategoryOptions(): string[] {
  return [CATEGORY_LABELS.PRINTED, CATEGORY_LABELS.CERAMIC];
}
