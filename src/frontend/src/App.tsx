import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBasket } from './hooks/useBasket';
import StorefrontPage from './pages/StorefrontPage';
import ItemDetailPage from './pages/ItemDetailPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminBulkUploadPage from './pages/AdminBulkUploadPage';
import AdminBrandingPage from './pages/AdminBrandingPage';
import AdminShapeCategoriesPage from './pages/AdminShapeCategoriesPage';
import BasketPage from './pages/BasketPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import LoginButton from './components/LoginButton';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import { Toaster } from '@/components/ui/sonner';
import { ShoppingBasket } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function Layout() {
  const { itemCount } = useBasket();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Ocarina Shop
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/basket"
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Shopping basket"
            >
              <ShoppingBasket className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </a>
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()}</span>
              <span>•</span>
              <span>Built with ❤️ using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <SiX className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
      <ProfileSetupDialog />
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

const itemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/item/$itemId',
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

const adminShapeCategoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/shape-categories',
  component: AdminShapeCategoriesPage,
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
  itemRoute,
  basketRoute,
  adminPanelRoute,
  adminUploadRoute,
  adminBrandingRoute,
  adminShapeCategoriesRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
