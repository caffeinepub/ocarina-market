/**
 * Formats a price in cents as Australian Dollars (AUD)
 * @param priceInCents - Price value in cents
 * @returns Formatted price string (e.g., "A$12.50")
 */
export function formatPrice(priceInCents: number): string {
  const amount = priceInCents / 100;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}
