import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetBranding } from './hooks/useQueries';
import { useBasket } from './hooks/useBasket';
import { useState, useEffect } from 'react';
import StorefrontPage from './pages/StorefrontPage';
import ItemDetailPage from './pages/ItemDetailPage';
import BasketPage from './pages/BasketPage';
import AdminBulkUploadPage from './pages/AdminBulkUploadPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminBrandingPage from './pages/AdminBrandingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import LoginButton from './components/LoginButton';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

function Layout() {
  const navigate = useNavigate();
  const { data: branding } = useGetBranding();
  const { itemCount } = useBasket();

  const storeName = branding?.appName || 'Ocarina Market';
  const logoUrl = branding?.logo?.getDirectURL() || '/assets/generated/logo.dim_512x512.png';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logoUrl} 
              alt={storeName} 
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.src = '/assets/generated/logo.dim_512x512.png';
              }}
            />
            <h1 className="text-2xl font-bold text-foreground">{storeName}</h1>
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ to: '/basket' })}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
            <LoginButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {storeName}. Built with ❤️ using{' '}
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
      
      <ProfileSetupDialog />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StorefrontPage,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/items/$itemId',
  component: ItemDetailPage,
});

const basketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/basket',
  component: BasketPage,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanelPage,
});

const adminUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/upload',
  component: AdminBulkUploadPage,
});

const adminBrandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/branding',
  component: AdminBrandingPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  itemDetailRoute,
  basketRoute,
  adminPanelRoute,
  adminUploadRoute,
  adminBrandingRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
