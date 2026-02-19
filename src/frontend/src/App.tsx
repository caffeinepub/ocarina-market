import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Link } from '@tanstack/react-router';
import LoginButton from './components/LoginButton';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import StorefrontPage from './pages/StorefrontPage';
import ItemDetailPage from './pages/ItemDetailPage';
import BasketPage from './pages/BasketPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminBulkUploadPage from './pages/AdminBulkUploadPage';
import { useBasket } from './hooks/useBasket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function Layout() {
  const { getBasketItemCount } = useBasket();
  const basketCount = getBasketItemCount();

  const appName = 'Folk Market';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-serif font-semibold text-foreground">{appName}</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/basket"
              className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              {basketCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {basketCount}
                </span>
              )}
            </Link>
            <LoginButton />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/40 bg-muted/30 py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {appName}. Built with{' '}
            <span className="text-destructive">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
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
  path: '/item/$itemId',
  component: ItemDetailPage,
});

const basketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/basket',
  component: BasketPage,
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

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanelPage,
});

const adminBulkUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/bulk-upload',
  component: AdminBulkUploadPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  itemDetailRoute,
  basketRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminPanelRoute,
  adminBulkUploadRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
