import { AuthProvider } from "@/contexts/AuthContext";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SimpleThemeProvider } from "@/components/simple-theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { InstallPWA } from "@/components/InstallPWA";
import { LiveChat } from "@/components/LiveChat";
import { CookieConsent } from "@/components/CookieConsent";
import { FloatingBackButton } from "@/components/FloatingBackButton";
import { CustomCursor } from "@/components/CustomCursor";
import { initGA } from "@/lib/analytics";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Loader2 } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobilePreviewWrapper } from "@/components/MobilePreviewWrapper";
import { LocationOverrideTool } from "@/components/dev/LocationOverrideTool";
import { LockoutOverlay } from "@/components/LockoutOverlay";
import { useAuth } from "@/contexts/AuthContext";

import ErrorBoundary from "@/components/ErrorBoundary";

import { PostHogProvider } from 'posthog-js/react';
import { posthog } from '@/lib/posthog';

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
const ClaimBusinessPage = lazy(() => import("./pages/ClaimBusinessPage"));
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

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

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

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<AuthPage defaultTab="login" />} />
    <Route path="/register" element={<AuthPage defaultTab="register" />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/voice-report" element={<VoiceReporter />} />

    {/* Explicit Trade Routes (Highest Priority) */}
    <Route path="/emergency-plumber" element={<TradeCityPage />} />
    <Route path="/emergency-plumber/:city" element={<TradeCityPage />} />
    <Route path="/emergency-electrician" element={<TradeCityPage />} />
    <Route path="/emergency-electrician/:city" element={<TradeCityPage />} />
    <Route path="/emergency-locksmith" element={<TradeCityPage />} />
    <Route path="/emergency-locksmith/:city" element={<TradeCityPage />} />
    <Route path="/emergency-gas-engineer" element={<TradeCityPage />} />
    <Route path="/emergency-gas-engineer/:city" element={<TradeCityPage />} />
    <Route path="/emergency-drain-specialist" element={<TradeCityPage />} />
    <Route path="/emergency-drain-specialist/:city" element={<TradeCityPage />} />
    <Route path="/emergency-glazier" element={<TradeCityPage />} />
    <Route path="/emergency-glazier/:city" element={<TradeCityPage />} />
    <Route path="/emergency-roofer" element={<TradeCityPage />} />
    <Route path="/emergency-roofer/:city" element={<TradeCityPage />} />
    <Route path="/emergency-breakdown" element={<TradeCityPage />} />
    <Route path="/emergency-breakdown/:city" element={<TradeCityPage />} />
    <Route path="/emergency-builder" element={<TradeCityPage />} />
    <Route path="/emergency-builder/:city" element={<TradeCityPage />} />
    <Route path="/emergency-water-restoration" element={<TradeCityPage />} />
    <Route path="/emergency-water-restoration/:city" element={<TradeCityPage />} />
    <Route path="/emergency-hvac" element={<TradeCityPage />} />
    <Route path="/emergency-hvac/:city" element={<TradeCityPage />} />

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
    <Route path="/business/claim/:businessId" element={<ClaimBusinessPage />} />
    <Route path="/premium-profile" element={<ProProfileEditor />} />
    <Route path="/payment/success" element={<PaymentSuccessPage />} />
    <Route path="/payment/cancel" element={<PaymentCancelPage />} />

    {/* Admin Routes */}
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
              This usually means the Environment Variables are missing in Netlify.
            </p>
            <p className="font-semibold text-sm">How to fix:</p>
            <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
              <li>Go to Netlify Dashboard</li>
              <li>Site Configuration &rarr; Environment variables</li>
              <li>Add key: <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_URL</code></li>
              <li>Value: (Copy from your local .env)</li>
              <li><strong>Re-deploy the site</strong></li>
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
          {import.meta.env.DEV && <LocationOverrideTool />}
          {import.meta.env.DEV && (window.self === window.top) ? (
            <MobilePreviewWrapper>
              <ScrollToTop />
              <HashCleaner />
              <Suspense fallback={<PageLoader />}>
                <AnalyticsTracker />
                <InstallPWA />
                <CookieConsent />
                <ErrorBoundary>
                  <main className="pb-16 md:pb-0">
                    <AppRoutes />
                  </main>
                </ErrorBoundary>
                <BottomNav />
                <LiveChat />
                <FloatingBackButton />
                <CustomCursor />
              </Suspense>
            </MobilePreviewWrapper>
          ) : (
            <>
              <ScrollToTop />
              <HashCleaner />
              <Suspense fallback={<PageLoader />}>
                <AnalyticsTracker />
                <InstallPWA />
                <CookieConsent />
                <ErrorBoundary>
                  <main className="pb-16 md:pb-0">
                    <AppRoutes />
                  </main>
                </ErrorBoundary>
                <BottomNav />
                <LiveChat />
                <FloatingBackButton />
                <CustomCursor />
              </Suspense>
            </>
          )}
        </LocalizationProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <PostHogProvider client={posthog}>
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
    </PostHogProvider>
  );
};

export default App;
