import { useState, useEffect } from "react";
import {
  HelpCircle,
  Menu,
} from "lucide-react";
import { GuestGate } from "@/components/GuestGate";
import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SEO } from "@/components/SEO";
import { useLocalization } from "@/contexts/LocalizationContext";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";
import { useSimpleTheme } from "@/components/simple-theme";
import { FloatingTourHub } from "@/components/FloatingTourHub";
import { SiteSidePanel } from "@/components/SiteSidePanel";
import { Link } from "react-router-dom";
import SoftAurora from "./SoftAurora";

const emergencyTrustSteps = [
  "Tell us the emergency",
  "Choose trade and area",
  "Call the business directly",
];


export default function HomeSearch() {
  const { settings } = useLocalization();
  const { theme } = useSimpleTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  // Listen for tour events to automatically expand/open the sidebar/drawer
  useEffect(() => {
    const handleOpenSidebar = () => {
      if (window.innerWidth < 1024) {
        setDrawerOpen(true);
      } else {
        setDesktopSidebarOpen(true);
      }
    };
    const handleCloseSidebar = () => {
      setDrawerOpen(false);
    };
    window.addEventListener('et-open-sidebar', handleOpenSidebar);
    window.addEventListener('et-close-sidebar', handleCloseSidebar);
    return () => {
      window.removeEventListener('et-open-sidebar', handleOpenSidebar);
      window.removeEventListener('et-close-sidebar', handleCloseSidebar);
    };
  }, []);

  const siteTradeTerm = settings.countryCode === "US" ? "Contractors" : "Tradesmen";
  const appTitle = settings.countryCode === "US" ? "EmergencyContractors" : "EmergencyTradesmen";
  const pricingRoute = settings.countryCode === "US" ? "/us/pricing" : "/pricing";

  const sidebar = (
    <SiteSidePanel
      mode="home"
      onNavigate={() => setDrawerOpen(false)}
      onClose={() => {
        setDrawerOpen(false);
        setDesktopSidebarOpen(false);
      }}
    />
  );

  return (
    <>
      <GuestGate />
      <FloatingTourHub />
      <SEO
        title={`Search Emergency ${siteTradeTerm} Near You`}
        description={`Search local emergency ${siteTradeTerm.toLowerCase()}, use voice or manual search, and open public listings for plumbers, electricians, locksmiths, roofers, HVAC and more.`}
        canonical="/"
      />

      <main className="min-h-screen bg-[#f7f5ef] text-slate-950 dark:bg-[#05070b] dark:text-white">
        <div className="flex min-h-screen">
          {desktopSidebarOpen && (
            <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-hidden overscroll-contain border-r border-slate-950/10 bg-white/82 p-5 shadow-[18px_0_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#080c14]/95 dark:shadow-[18px_0_80px_rgba(0,0,0,0.28)] lg:block">
              {sidebar}
            </aside>
          )}

          <section className="relative min-w-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(212,175,55,0.16),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(15,23,42,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.55),transparent_36%)] dark:bg-[radial-gradient(circle_at_50%_10%,rgba(212,175,55,0.14),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(18,55,92,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30 z-0">
              <SoftAurora
                speed={0.6}
                scale={1.5}
                brightness={1}
                color1={theme === "dark" ? "#f7f7f7" : "#000000"}
                color2="#EAB308"
                noiseFrequency={2.5}
                noiseAmplitude={1}
                bandHeight={0.5}
                bandSpread={1}
                octaveDecay={0.1}
                layerOffset={0}
                colorSpeed={1}
                enableMouseInteraction
                mouseInfluence={0.25}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <div className="relative mx-auto flex min-h-screen w-full flex-col px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between w-full z-10">
                <div className="flex items-center gap-3">
                  {/* Desktop collapsed trigger */}
                  <div className={cn("hidden lg:block", desktopSidebarOpen && "lg:hidden")}>
                    <Button
                      variant="outline"
                      onClick={() => setDesktopSidebarOpen(true)}
                      className="border-slate-950/15 bg-white/70 text-slate-950 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 rounded-full px-4 py-2 font-bold text-xs uppercase tracking-wider"
                    >
                      <Menu className="mr-2 h-4 w-4" />
                      Show Sidebar
                    </Button>
                  </div>

                  {/* Mobile sheet trigger */}
                  <div className="lg:hidden">
                    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="border-slate-950/15 bg-white/70 text-slate-950 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                          <Menu className="h-5 w-5" />
                          <span className="sr-only">Open search menu</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[310px] border-r border-slate-950/10 bg-[#f8f7f2] p-5 text-slate-950 dark:border-white/10 dark:bg-[#090d15] dark:text-white">
                        <SheetTitle className="sr-only">Search tools</SheetTitle>
                        <SheetDescription className="sr-only">Main website navigation, account links, business tools, and emergency search.</SheetDescription>
                        <SiteSidePanel
                          mode="home"
                          onNavigate={() => setDrawerOpen(false)}
                          onClose={() => setDrawerOpen(false)}
                          showCloseButton={false}
                        />
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center flex-1">
                  <Link
                    to={pricingRoute}
                    className="flex items-center gap-2 px-5 py-2 rounded-full border border-gold/35 bg-gold/5 text-gold hover:bg-gold hover:text-black dark:border-gold/30 dark:bg-gold/10 transition-all duration-300 font-display text-xs font-black uppercase tracking-[0.14em] shadow-[0_0_24px_rgba(212,175,55,0.06)] hover:shadow-[0_0_24px_rgba(212,175,55,0.22)]"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                    </span>
                    <span>Pro Sign-Up</span>
                  </Link>
                </div>

                {/* Quick controls in top right corner */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.dispatchEvent(new Event('start-tour'))}
                    className="border-slate-950/15 bg-white/70 text-slate-950 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 rounded-full"
                    title="Interactive Help Tour"
                  >
                    <HelpCircle className="h-5 w-5 text-gold animate-pulse" />
                  </Button>
                  <UserMenu />
                  <ModeToggle />
                </div>
              </div>

              <div id="manual-search" className="flex flex-1 items-center justify-center py-10 lg:py-12">
                <div className="w-full max-w-[64rem]">
                  <div className="mb-6 text-center">
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
                      <span className="text-slate-950 dark:text-white">Emergency</span><span className="text-gold">{settings.countryCode === "US" ? "Contractors" : "Tradesmen"}</span>
                    </h1>
                    <p className="sr-only">{appTitle} emergency AI search</p>
                  </div>
                  <div className="mx-auto mb-5 max-w-[48rem]">
                    <div className="home-search-trust-grid" aria-label="Emergency search steps">
                      {emergencyTrustSteps.map((step, index) => (
                        <div key={step} className="home-search-trust-pill">
                          <strong>{index + 1}</strong>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative mx-auto max-w-[60rem]">
                    <div className="pointer-events-none absolute -inset-x-12 -top-12 h-32 rounded-full bg-gold/10 blur-3xl" />
                    <EmergencyChatInterface launchMode="direct" surface="search" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
