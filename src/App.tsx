import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import BusinessesPage from "./pages/admin/Businesses";
import PhotosPage from "./pages/admin/Photos";
import ReviewsPage from "./pages/admin/Reviews";
import QuotesPage from "./pages/admin/Quotes";
import { SimpleThemeProvider } from "@/components/simple-theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { InstallPWA } from "@/components/InstallPWA";
import { LiveChat } from "@/components/LiveChat";
import { CookieConsent } from "@/components/CookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <SimpleThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ComparisonProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ThemeToggle />
              <BrowserRouter>
                <InstallPWA />
                <CookieConsent />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/user/dashboard" element={<UserDashboard />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/business/:businessId" element={<BusinessProfilePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/tradesmen" element={<PricingPage />} /> {/* Alias */}
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="businesses" element={<BusinessesPage />} />
                    <Route path="quotes" element={<QuotesPage />} />
                    <Route path="photos" element={<PhotosPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                  </Route>

                  <Route path="/:tradePath/:city" element={<TradeCityPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNav />
                <LiveChat />
              </BrowserRouter>
            </TooltipProvider>
          </ComparisonProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SimpleThemeProvider>
  </HelmetProvider>
);

export default App;
