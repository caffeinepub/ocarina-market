# Ocarina Market - Production Deployment Checklist

## Draft Version 13 - Go Live Verification

This checklist ensures that the production deployment matches Draft Version 13 functionality.

### Pre-Deployment Verification

- [ ] Backend canister is deployed and accessible
- [ ] Frontend build completes without errors
- [ ] All environment variables are correctly configured

### Storefront Route ("/") - Core Functionality

The following features must be visible and functional on the live storefront:

#### Item Listing Controls
- [ ] View mode dropdown is visible when page loads (even with zero items)
- [ ] "All items" option is available and functional
- [ ] "Price: Low to High" sorting option works correctly
- [ ] "Price: High to Low" sorting option works correctly
- [ ] "Category: 3D printed" filter displays only 3D printed items
- [ ] "Category: Ceramic" filter displays only ceramic items

#### Display States
- [ ] Loading state shows spinner while fetching data
- [ ] Empty state message appears when no items are published
- [ ] "No items match your selection" message appears when filters return zero results
- [ ] Item grid displays correctly with published items
- [ ] Hero section displays branding media and text

#### Navigation & Interaction
- [ ] Clicking on item cards navigates to item detail page
- [ ] Basket icon in header shows correct item count
- [ ] Login/logout functionality works correctly
- [ ] Footer displays correct branding and attribution

### Admin Functionality

- [ ] Admin panel is accessible at "/admin"
- [ ] Bulk upload page works at "/admin/upload"
- [ ] Branding configuration page works at "/admin/branding"
- [ ] Publish/unpublish toggle functions correctly
- [ ] Price editor saves changes successfully

### Payment Flow

- [ ] Stripe configuration is set up (if applicable)
- [ ] Checkout redirects to Stripe correctly
- [ ] Payment success page ("/payment-success") handles completion
- [ ] Payment failure page ("/payment-failure") preserves basket

### Cross-Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Checks

- [ ] Page load time is acceptable (< 3 seconds)
- [ ] Images load correctly via ExternalBlob direct URLs
- [ ] No console errors in browser developer tools
- [ ] React Query caching works as expected

### Final Sign-Off

- [ ] All acceptance criteria from implementation plan are met
- [ ] User visiting "/" can see and use all listing controls
- [ ] No regressions from previous draft versions
- [ ] Ready for production traffic

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Version:** Draft 13 → Production

**Notes:**
