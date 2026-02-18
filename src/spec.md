# Specification

## Summary
**Goal:** Let admins upload a logo image and edit the storefront hero title/subtitle via Branding settings, and have the public storefront render these values instead of hard-coded text.

**Planned changes:**
- Extend backend Branding data to persist `heroTitle` and `heroSubtitle`, return them via `getBranding`, and persist via `setBranding` (admin-only).
- Include hero title/subtitle fields in the public `getStorefrontItems` response so the storefront can render hero text without authenticated calls.
- Add migration/defaulting so existing deployments get safe defaults for the new hero text fields.
- Update `/admin/branding` to add text inputs for hero title and hero subtitle, prefilled from current branding, saved via the existing branding save flow, and treated as fallback-to-default when cleared.
- Update `/admin/branding` to add a logo file upload control (image-only) with preview, uploading/storing the logo using the existing blob upload approach; keep existing logo if no file is selected.
- Update the storefront hero component to use branding-provided hero title/subtitle (with fallbacks to the current default English strings) for both image and 3D hero variants.

**User-visible outcome:** Admins can upload a new logo and edit the hero headline/subheadline in Branding Settings; the storefront header logo and hero text update accordingly, with sensible defaults when fields are unset.
