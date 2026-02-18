# Specification

## Summary
**Goal:** Ensure item photos uploaded in Ocarina Store are persisted and reliably displayed, and make it clear to admins why newly uploaded items might not show on the public storefront.

**Planned changes:**
- Fix backend blob/image persistence so images uploaded via bulk upload and the admin “Replace Item Image” flow are stored in blob storage and remain retrievable via the saved `ExternalBlob` reference (including correct `contentType`).
- Update the admin bulk upload UI to explicitly explain that newly uploaded items start as unpublished/drafts and won’t appear on the public storefront until published, and provide an obvious next step to publish them.
- Improve admin-facing frontend diagnostics for broken/missing item images: fall back to the existing placeholder and show a small “Image failed to load” indicator on the item detail page for admins, without exposing broken-image UI to storefront users.

**User-visible outcome:** Admins can upload/replace item photos and see them load consistently even after refresh/new sessions; the storefront still only shows published items, and admins get clear guidance when uploads don’t appear due to draft status or when an image URL is broken.
