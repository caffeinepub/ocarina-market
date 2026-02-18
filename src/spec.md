# Specification

## Summary
**Goal:** Add a guest basket/cart with multi-item Stripe Checkout, while keeping the existing single-item “Buy Now” flow on item detail pages.

**Planned changes:**
- Add a guest basket that allows adding multiple items, persisting basket contents across refreshes, and reviewing/removing/clearing items before checkout.
- Add a dedicated Basket/Cart route (e.g., `/basket` or `/cart`) and a global header entry point that shows a basket item count badge when non-empty.
- Implement multi-item Stripe Checkout from the Basket page using the existing success/cancel return pages, ensuring only eligible items (priced and not sold) can be checked out and preventing checkout if items become unavailable.
- Update backend inventory protection so multi-item completed Stripe sessions mark all purchased items as sold, with correct handling for cancelled/failed sessions and concurrent purchase attempts.
- Keep item detail pages as single-item checkout only; restrict multi-item checkout initiation to the Basket page.

**User-visible outcome:** Users can add items to a basket without logging in, manage the basket, and complete a single Stripe checkout for multiple eligible items from the Basket page, while item pages still support only single-item “Buy Now” purchases.
