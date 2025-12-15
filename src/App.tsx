import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import TradeCityPage from "./pages/TradeCityPage";
import NotFound from "./pages/NotFound";
import UserDashboard from "./pages/UserDashboard";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import ComparePage from "./pages/ComparePage";
import About from "./pages/About";
import PricingPage from "./pages/PricingPage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import AuthPage from "./pages/AuthPage";
import PremiumProfileEditor from "./pages/PremiumProfileEditor";
import ClaimBusinessPage from "./pages/ClaimBusinessPage";
import ContactPage from "./pages/ContactPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import BusinessesPage from "./pages/admin/Businesses";
import PhotosPage from "./pages/admin/Photos";
import ReviewsPage from "./pages/admin/Reviews";
import QuotesPage from "./pages/admin/Quotes";
import SubscriptionsPage from "./pages/admin/Subscriptions";
import { SimpleThemeProvider } from "@/components/simple-theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { InstallPWA } from "@/components/InstallPWA";
import { LiveChat } from "@/components/LiveChat";
import { CookieConsent } from "@/components/CookieConsent";
import { FloatingBackButton } from "@/components/FloatingBackButton";
import { CustomCursor } from "@/components/CustomCursor";
import { AuthRedirectHandler } from "@/components/AuthRedirectHandler";

const queryClient = new QueryClient();

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

  return (
    <HelmetProvider>
      <SimpleThemeProvider>
        <QueryClientProvider client={queryClient}>
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
            <AuthProvider>
              <ComparisonProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <ThemeToggle />
                  <BrowserRouter>
                    <InstallPWA />
                    <CookieConsent />
                    <AuthRedirectHandler />
                    <Routes>
                      <Route path="/login" element={<AuthPage defaultTab="login" />} />
                      <Route path="/register" element={<AuthPage defaultTab="register" />} />
                      <Route path="/" element={<Index />} />
                      <Route path="/user/dashboard" element={<UserDashboard />} />
                      <Route path="/compare" element={<ComparePage />} />
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

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="businesses" element={<BusinessesPage />} />
                        <Route path="quotes" element={<QuotesPage />} />
                        <Route path="photos" element={<PhotosPage />} />
                        <Route path="reviews" element={<ReviewsPage />} />
                        <Route path="subscriptions" element={<SubscriptionsPage />} />
                      </Route>

                      <Route path="/:tradePath/:city" element={<TradeCityPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <BottomNav />
                    <LiveChat />
                    <FloatingBackButton />
                    <CustomCursor />
                  </BrowserRouter>
                </TooltipProvider>
              </ComparisonProvider>
            </AuthProvider>
          </APIProvider>
        </QueryClientProvider>
      </SimpleThemeProvider>
    </HelmetProvider>
  );
};

export default App;
