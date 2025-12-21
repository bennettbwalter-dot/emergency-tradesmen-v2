import { AuthProvider } from "@/contexts/AuthContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { AuthRedirectHandler } from "@/components/AuthRedirectHandler";
import { initGA } from "@/lib/analytics";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Loader2 } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const TradeCityPage = lazy(() => import("./pages/TradeCityPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const BusinessProfilePage = lazy(() => import("./pages/BusinessProfilePage"));
const About = lazy(() => import("./pages/About"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("./pages/PaymentCancelPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PremiumProfileEditor = lazy(() => import("./pages/PremiumProfileEditor"));
const ClaimBusinessPage = lazy(() => import("./pages/ClaimBusinessPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const FAQ = lazy(() => import("./pages/FAQ"));

// Admin Pages Lazy Load
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const BusinessesPage = lazy(() => import("./pages/admin/Businesses"));
const PhotosPage = lazy(() => import("./pages/admin/Photos"));
const ReviewsPage = lazy(() => import("./pages/admin/Reviews"));
const SubscriptionsPage = lazy(() => import("./pages/admin/Subscriptions"));
const AdminAvailability = lazy(() => import("./pages/admin/Availability"));
const AdminProfileEditor = lazy(() => import("./pages/admin/ProfileEditor"));
const DataExportPage = lazy(() => import("./pages/admin/DataExportPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => {
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

  useEffect(() => {
    initGA();
  }, []);

  return (
    <HelmetProvider>
      <SimpleThemeProvider>
        <QueryClientProvider client={queryClient}>
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""} libraries={["places"]}>
            <AuthProvider>
              <ChatbotProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <ThemeToggle />
                  <BrowserRouter>
                    <ScrollToTop />
                    <Suspense fallback={<PageLoader />}>
                      <AnalyticsTracker />
                      <InstallPWA />
                      <CookieConsent />
                      <AuthRedirectHandler />
                      <Routes>
                        <Route path="/login" element={<AuthPage defaultTab="login" />} />
                        <Route path="/register" element={<AuthPage defaultTab="register" />} />
                        <Route path="/" element={<Index />} />
                        <Route path="/user/dashboard" element={<UserDashboard />} />
                        <Route path="/business/:businessId" element={<BusinessProfilePage />} />
                        <Route path="/business/claim/:businessId" element={<ClaimBusinessPage />} />
                        <Route path="/premium-profile" element={<PremiumProfileEditor />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/tradesmen" element={<PricingPage />} /> {/* Alias */}
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/payment/success" element={<PaymentSuccessPage />} />
                        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogPostPage />} />
                        <Route path="/faq" element={<FAQ />} />

                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="businesses" element={<BusinessesPage />} />

                          <Route path="profile-editor" element={<AdminProfileEditor />} />
                          <Route path="availability" element={<AdminAvailability />} />

                          <Route path="photos" element={<PhotosPage />} />
                          <Route path="reviews" element={<ReviewsPage />} />
                          <Route path="subscriptions" element={<SubscriptionsPage />} />
                          <Route path="export" element={<DataExportPage />} />
                        </Route>

                        <Route path="/:tradePath/:city" element={<TradeCityPage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <BottomNav />
                      <LiveChat />
                      <FloatingBackButton />
                      <CustomCursor />
                    </Suspense>
                  </BrowserRouter>
                </TooltipProvider>
              </ChatbotProvider>
            </AuthProvider>
          </APIProvider>
        </QueryClientProvider>
      </SimpleThemeProvider>
    </HelmetProvider>
  );
};

export default App;



