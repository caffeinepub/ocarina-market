# Specification

## Summary
**Goal:** Ensure admin image uploads and replacements actually persist image bytes in blob storage, reliably reference retrievable photo blobs, and only show success in the UI after verification.

**Planned changes:**
- Fix backend bulk photo upload + item creation so uploaded image bytes are persisted in blob storage and new Item records reference a retrievable photo blob.
- Fix backend single-item “Replace Item Image” flow so the new image bytes persist and the updated photo renders correctly while keeping the item’s stable URL id unchanged.
- Update Admin Bulk Photo Upload UI to verify created item IDs/items can be fetched before showing “Successfully uploaded”; show a clear English error and stay on the page if verification fails.
- Invalidate/refresh relevant item/storefront React Query caches on successful upload so newly created items appear without a hard reload.

**User-visible outcome:** Admins can bulk upload items with photos and replace item images, and the images reliably appear in the admin/storefront; the UI only reports success when uploads are actually retrievable.
