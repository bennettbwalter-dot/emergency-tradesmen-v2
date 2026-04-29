import { AuthProvider } from "@/contexts/AuthContext";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense, useEffect, useState } from "react";
import { SimpleThemeProvider } from "@/components/simple-theme";
import { useDeferredMount } from "@/hooks/useDeferredMount";
import { initGA } from "@/lib/analytics";
import { Loader2 } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobilePreviewWrapper } from "@/components/MobilePreviewWrapper";
import { LockoutOverlay } from "@/components/LockoutOverlay";
import { useAuth } from "@/contexts/AuthContext";

import ErrorBoundary from "@/components/ErrorBoundary";

// Below-the-fold UI: lazy-load to keep them out of the LCP critical path.
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const BottomNav = lazy(() => import("@/components/BottomNav").then(m => ({ default: m.BottomNav })));
const InstallPWA = lazy(() => import("@/components/InstallPWA").then(m => ({ default: m.InstallPWA })));
const LiveChat = lazy(() => import("@/components/LiveChat").then(m => ({ default: m.LiveChat })));
const CookieConsent = lazy(() => import("@/components/CookieConsent").then(m => ({ default: m.CookieConsent })));
const FloatingBackButton = lazy(() => import("@/components/FloatingBackButton").then(m => ({ default: m.FloatingBackButton })));
const CustomCursor = lazy(() => import("@/components/CustomCursor").then(m => ({ default: m.CustomCursor })));
const AnalyticsTracker = lazy(() => import("@/components/AnalyticsTracker").then(m => ({ default: m.AnalyticsTracker })));
const LocationOverrideTool = lazy(() => import("@/components/dev/LocationOverrideTool").then(m => ({ default: m.LocationOverrideTool })));

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const TradeCityPage = lazy(() => import("./pages/TradeCityPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const BusinessProfilePage = lazy(() => import("./pages/BusinessProfilePage"));
const About = lazy(() => import("./pages/About"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("./pages/PaymentCancelPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ProProfileEditor = lazy(() => import("./pages/NewProfileEditor"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const FAQ = lazy(() => import("./pages/FAQ"));
const VettingProcess = lazy(() => import("./pages/VettingProcess"));
const VerifyDocumentsPage = lazy(() => import("./pages/VerifyDocumentsPage"));
const LocationsDirectory = lazy(() => import("./pages/LocationsDirectory"));
const VoiceReporter = lazy(() => import("./components/VoiceReporter"));

// Admin Pages Lazy Load
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const BusinessesPage = lazy(() => import("./pages/admin/Businesses"));
const PhotosPage = lazy(() => import("./pages/admin/Photos"));
const ReviewsPage = lazy(() => import("./pages/admin/Reviews"));
const SubscriptionsPage = lazy(() => import("./pages/admin/Subscriptions"));
const AdminAvailability = lazy(() => import("./pages/admin/Availability"));
const AdminProfileEditor = lazy(() => import("./pages/admin/ProfileEditor"));
const DataExportPage = lazy(() => import("./pages/admin/DataExportPage"));
const AnalyticsPage = lazy(() => import("./pages/admin/Analytics"));
const EmailOutreachDashboard = lazy(() => import("./pages/admin/EmailOutreachDashboard"));

const queryClient = new QueryClient();
const APP_CHROME_EVENTS: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll"];
const ADMIN_EMAILS = ['nicholas.bennett247@gmail.com', 'bennett.b.walter@gmail.com'];
const isAdminEmail = (email?: string | null) => !!email && ADMIN_EMAILS.includes(email.toLowerCase());

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const DeferredLiveChat = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enable = () => setEnabled(true);
    const timer = window.setTimeout(enable, 8000);
    window.addEventListener("pointerdown", enable, { once: true, passive: true });
    window.addEventListener("keydown", enable, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    };
  }, []);

  return enabled ? <LiveChat /> : null;
};

const DeferredAnalyticsTracker = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const enabled = useDeferredMount({
    delay: isHome ? 16000 : 800,
    events: APP_CHROME_EVENTS,
  });

  return enabled ? (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  ) : null;
};

const DeferredAppChrome = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const enabled = useDeferredMount({
    delay: isHome ? 16000 : 800,
    events: APP_CHROME_EVENTS,
  });

  return enabled ? (
    <Suspense fallback={null}>
      <InstallPWA />
      <CookieConsent />
      <BottomNav />
      <DeferredLiveChat />
      <FloatingBackButton />
      <CustomCursor />
    </Suspense>
  ) : null;
};

const HashCleaner = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.location.href.endsWith('#') || window.location.hash === '#') {
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, [location]);

  return null;
};

const ProtectedAdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdminEmail(user?.email)) return <Navigate to="/" replace />;

  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<AuthPage defaultTab="login" />} />
    <Route path="/register" element={<AuthPage defaultTab="register" />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/voice-report" element={<VoiceReporter />} />

    {/* Explicit Trade Routes (Highest Priority) */}
    {[
      "plumber", "electrician", "locksmith", "gas-engineer", 
      "drain-specialist", "glazier", "roofer", "breakdown", 
      "builder", "water-restoration", "hvac"
    ].map(trade => (
      <Route key={`trade-${trade}`} path={`/emergency-${trade}`}>
        <Route index element={<TradeCityPage />} />
        <Route path=":city" element={<TradeCityPage />} />
      </Route>
    ))}
    
    {/* Near Me Landing Pages Strategy (P3.7) */}
    {[
      "plumber", "electrician", "locksmith", "gas-engineer", 
      "drain-specialist", "glazier", "roofer", "breakdown", 
      "builder", "water-restoration", "hvac"
    ].map(trade => (
      <Route key={`near-me-${trade}`} path={`/emergency-${trade}-near-me`} element={<TradeCityPage />} />
    ))}

    {/* Core Pages */}
    <Route path="/" element={<Index />} />
    <Route path="/about" element={<About />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/tradesmen" element={<PricingPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/blog/:slug" element={<BlogPostPage />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/locations" element={<LocationsDirectory />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/vetting-process" element={<VettingProcess />} />
    <Route path="/verify-documents" element={<VerifyDocumentsPage />} />
    <Route path="/user/dashboard" element={<UserDashboard />} />
    <Route path="/account/billing" element={<BillingPage />} />
    <Route path="/billing" element={<Navigate to="/account/billing" replace />} />
    <Route path="/business/:businessId" element={<BusinessProfilePage />} />
    <Route path="/business/claim/:businessId" element={<Navigate to="/pricing" replace />} />
    <Route path="/premium-profile" element={<ProProfileEditor />} />
    <Route path="/payment/success" element={<PaymentSuccessPage />} />
    <Route path="/payment/cancel" element={<PaymentCancelPage />} />

    {/* Admin Routes */}
    <Route element={<ProtectedAdminRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="profile-editor" element={<AdminProfileEditor />} />
        <Route path="availability" element={<AdminAvailability />} />
        <Route path="photos" element={<PhotosPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="export" element={<DataExportPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="email-outreach" element={<EmailOutreachDashboard />} />
      </Route>
    </Route>

    {/* US Specific Hierarchy Routes */}
    <Route path="/:state/:city" element={<TradeCityPage />} />
    <Route path="/:state/:city/:tradePath" element={<TradeCityPage />} />
    <Route path="/:state/:metro/:city/:tradePath" element={<TradeCityPage />} />
    <Route path="/:state/:metro/:city/:suburb/:tradePath" element={<TradeCityPage />} />

    {/* Catch-all for simple trade/city paths */}
    <Route path="/:tradePath" element={<TradeCityPage />} />
    <Route path="/:tradePath/:city" element={<TradeCityPage />} />

    {/* Compatibility for old /us paths */}
    <Route path="/us/*" element={<NotFound />} />
    <Route path="/usa/*" element={<NotFound />} />
    <Route path="/gb/*" element={<NotFound />} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const AppContent = () => {
  const { isLocked, refreshUser } = useAuth();

  const handleRetry = async () => {
    await refreshUser();
  };
  // Initialize GA and handle hash cleanup at the root level before any returns
  useEffect(() => {
    initGA();

    // Global hash cleanup
    if (window.location.hash === '#') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Debug: Check if Supabase URL is available
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center font-sans md:p-20">
        <div className="max-w-xl space-y-6">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
          <p className="text-lg text-gray-700">The app cannot connect to the database.</p>
          <div className="bg-gray-100 p-6 rounded-lg text-left border border-gray-300">
            <p className="font-mono text-sm mb-2"><strong>Missing Variable:</strong> VITE_SUPABASE_URL</p>
            <p className="text-sm text-gray-600 mb-4">
              This usually means the Environment Variables are missing in Cloudflare Pages.
            </p>
            <p className="font-semibold text-sm">How to fix:</p>
            <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
              <li>Go to Cloudflare Dashboard &rarr; Pages &rarr; Your Project</li>
              <li>Settings &rarr; Environment Variables &rarr; Production</li>
              <li>Ensure <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> are set</li>
              <li>Value: Copy from your local <code className="bg-gray-200 px-1 rounded">.env</code> file</li>
              <li><strong>Clear Cache → Retry Deployment</strong></li>
            </ol>
          </div>
          <p className="text-xs text-gray-400">Current Value: {import.meta.env.VITE_SUPABASE_URL || 'undefined'}</p>
        </div>
      </div>
    );
  }



  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {isLocked && <LockoutOverlay onRetry={handleRetry} />}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LocalizationProvider>
          {import.meta.env.DEV && (
            <Suspense fallback={null}>
              <LocationOverrideTool />
            </Suspense>
          )}
          {import.meta.env.DEV && (window.self === window.top) ? (
            <MobilePreviewWrapper>
              <ScrollToTop />
              <HashCleaner />
              <DeferredAnalyticsTracker />
              <ErrorBoundary>
                <main className="pb-16 md:pb-0">
                  <Suspense fallback={<PageLoader />}>
                    <AppRoutes />
                  </Suspense>
                </main>
              </ErrorBoundary>
              <DeferredAppChrome />
            </MobilePreviewWrapper>
          ) : (
            <>
              <ScrollToTop />
              <HashCleaner />
              <DeferredAnalyticsTracker />
              <ErrorBoundary>
                <main className="pb-16 md:pb-0">
                  <Suspense fallback={<PageLoader />}>
                    <AppRoutes />
                  </Suspense>
                </main>
              </ErrorBoundary>
              <DeferredAppChrome />
            </>
          )}
        </LocalizationProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <SimpleThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ChatbotProvider>
              <AppContent />
            </ChatbotProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SimpleThemeProvider>
    </HelmetProvider>
  );
};

export default App;
