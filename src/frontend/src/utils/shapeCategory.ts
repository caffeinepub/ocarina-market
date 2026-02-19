/**
 * Utility functions for working with dynamic shape subcategories.
 * Shape subcategories are now stored as strings in the backend and managed dynamically.
 */

/**
 * Get display label for a shape subcategory (identity function for dynamic strings)
 */
export function getShapeCategoryLabel(shapeCategory: string): string {
  return shapeCategory;
}

/**
 * Validate if a shape category string is non-empty
 */
export function isValidShapeCategory(shapeCategory: string): boolean {
  return shapeCategory.trim().length > 0;
}
