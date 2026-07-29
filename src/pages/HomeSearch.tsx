import { lazy, Suspense, useState, useEffect, Component, type ReactNode } from "react";
import {
  MapPinned,
  Menu,
  MessageSquareText,
  PhoneCall,
} from "lucide-react";
import { GuestGate } from "@/components/GuestGate";
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

const EmergencyChatInterface = lazy(() =>
  import("@/components/EmergencyChatInterface").then((module) => ({
    default: module.EmergencyChatInterface,
  }))
);

const SoftAurora = lazy(() =>
  import("./SoftAurora").catch((err) => {
    console.warn("Failed to load SoftAurora dynamically, falling back to static background:", err);
    return { default: () => null };
  })
);

class SafeBackgroundBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.warn("SoftAurora background error caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const emergencyTrustSteps = [
  {
    title: "Tell us the emergency",
    short: "Tell us",
    desc: "Describe what's happened  -  a power cut, leak, lockout or breakdown.",
    Icon: MessageSquareText,
  },
  {
    title: "Choose trade and area",
    short: "Trade & area",
    desc: "Pick the trade you need and your town or city to see local listings.",
    Icon: MapPinned,
  },
  {
    title: "Call the business directly",
    short: "Call direct",
    desc: "Speak straight to a local pro  -  no middlemen, no booking fees.",
    Icon: PhoneCall,
  },
];


export default function HomeSearch() {
  const { settings } = useLocalization();
  const { theme } = useSimpleTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  // Mobile only: which "how it works" step has its details revealed (null = all collapsed)
  const [activeStep, setActiveStep] = useState<number | null>(null);

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

  // smooth-scroll to the search when arriving via /home#manual-search
  useEffect(() => {
    if (window.location.hash === "#manual-search") {
      window.setTimeout(() => {
        document.getElementById("manual-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, []);

  const siteTradeTerm = settings.countryCode === "US" ? "Contractors" : "Tradesmen";
  const appTitle = settings.countryCode === "US" ? "EmergencyContractors" : "EmergencyTradesmen";
  const pricingRoute = settings.countryCode === "US" ? "/us/pricing" : "/pricing";

  const sidebar = (
    <SiteSidePanel
      mode="home"
      onNavigate={() => {
        setDrawerOpen(false);
        setDesktopSidebarOpen(false);
      }}
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
        canonical="/home"
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
              <SafeBackgroundBoundary>
                <Suspense fallback={null}>
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
                </Suspense>
              </SafeBackgroundBoundary>
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
                          onNavigate={() => {
                            setDrawerOpen(false);
                            setDesktopSidebarOpen(false);
                          }}
                          onClose={() => {
                            setDrawerOpen(false);
                            setDesktopSidebarOpen(false);
                          }}
                          showCloseButton={false}
                        />
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center flex-1">
                  <Link
                    to={pricingRoute}
                    onClick={() => {
                      setDrawerOpen(false);
                      setDesktopSidebarOpen(false);
                    }}
                    className="rounded-full px-4 py-2 font-display text-[11px] font-black uppercase tracking-[0.16em] text-gold/90 transition-all duration-300 hover:bg-gold/10 hover:text-gold"
                  >
                    <span>Pro Sign-Up</span>
                  </Link>
                </div>

                {/* Quick controls in top right corner */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <UserMenu />
                  <ModeToggle className="hidden border-transparent bg-transparent sm:inline-flex" />
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
                  <div className="mx-auto mb-7 max-w-[56rem]">
                    <p className="mb-4 text-center font-display text-[11px] font-black uppercase tracking-[0.22em] text-gold/90">
                      How it works  -  fast help in 3 steps
                    </p>
                    {/* Mobile: compact side-by-side tiles, full details reveal on tap */}
                    <div className="sm:hidden">
                      <div className="grid grid-cols-3 gap-2" aria-label="Emergency search steps">
                        {emergencyTrustSteps.map((step, index) => {
                          const active = activeStep === index;
                          return (
                            <button
                              key={step.title}
                              type="button"
                              onClick={() => setActiveStep(active ? null : index)}
                              aria-expanded={active ? "true" : "false"}
                              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all duration-300 ${
                                active
                                  ? "border-gold/40 bg-gold/[0.08] shadow-[0_8px_24px_rgba(15,23,42,0.10)]"
                                  : "border-slate-950/10 bg-white/80 dark:border-white/10 dark:bg-white/[0.05]"
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-gold ring-1 transition-colors ${
                                  active ? "bg-gold/25 ring-gold/40" : "bg-gold/15 ring-gold/25"
                                }`}
                              >
                                <step.Icon className="h-4 w-4" aria-hidden />
                              </span>
                              <span className="text-[11px] font-semibold leading-tight text-slate-800 dark:text-slate-200">
                                {step.short}
                              </span>
                              <span className="font-display text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                                Step {index + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          activeStep !== null ? "mt-2 grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="rounded-xl border border-gold/20 bg-gold/[0.06] px-3.5 py-3 text-center">
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300/85">
                              {activeStep !== null ? emergencyTrustSteps[activeStep].desc : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      {activeStep === null && (
                        <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
                          Tap a step for details
                        </p>
                      )}
                    </div>

                    {/* Desktop: full cards side by side */}
                    <div className="hidden gap-4 sm:grid sm:grid-cols-3" aria-label="Emergency search steps">
                      {emergencyTrustSteps.map((step, index) => (
                        <div
                          key={step.title}
                          className="group relative rounded-2xl border border-slate-950/10 bg-white/85 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_10px_32px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_16px_44px_rgba(0,0,0,0.5)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/25">
                              <step.Icon className="h-5 w-5" aria-hidden />
                            </span>
                            <span className="font-display text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                              Step {index + 1}
                            </span>
                          </div>
                          <h2 className="mt-3.5 text-[0.95rem] font-bold text-slate-950 dark:text-white">
                            {step.title}
                          </h2>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300/80">
                            {step.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative mx-auto max-w-[60rem]">
                    <div className="pointer-events-none absolute -inset-x-12 -top-12 h-32 rounded-full bg-gold/10 blur-3xl" />
                    <Suspense
                      fallback={
                        <div className="min-h-[360px] rounded-2xl border border-slate-950/10 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5" />
                      }
                    >
                      <EmergencyChatInterface launchMode="direct" surface="search" />
                    </Suspense>
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
