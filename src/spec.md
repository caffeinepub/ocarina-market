# Specification

## Summary
**Goal:** Add a required category selection to the Admin Bulk Photo Upload flow and store that category on created items.

**Planned changes:**
- Add a required, clearly labeled category selector to the Admin Bulk Photo Upload page with exactly two options: "3D printed" and "Ceramic".
- Update the bulk upload request from the frontend to include the selected category and show a clear English error if category is missing/invalid.
- Extend the backend Item model to persist a category field limited to "3D printed" or "Ceramic", and include it in item fetch responses.
- Update the bulk upload backend API to accept the selected category and store it on each created item.
- Add a backend state migration to backfill a default category for all existing items so existing pages continue to load safely.

**User-visible outcome:** Admins must choose either "3D printed" or "Ceramic" before starting a bulk upload, and newly created (and existing) items have a stored category returned by item APIs.
