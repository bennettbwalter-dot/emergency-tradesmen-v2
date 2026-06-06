import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLocalization } from "@/contexts/LocalizationContext";
import { SiteSidePanel } from "@/components/SiteSidePanel";
import { isUSDomain as getIsUSDomain } from "@/lib/siteConfig";
import { UserMenu } from "@/components/UserMenu";

interface HeaderProps {
  countryCode?: string;
  showDesktopSidebar?: boolean;
}

export function Header({ countryCode, showDesktopSidebar = true }: HeaderProps) {
  const { settings } = useLocalization();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const isUSDomain = getIsUSDomain();
  const activeCountry = countryCode || settings.countryCode;
  const isUS = activeCountry === "US";
  const siteNameMain = "Emergency";
  const siteNameSub = isUSDomain ? "Contractors" : isUS ? "Contractors" : "Tradesmen";
  const countryPrefix = isUS && !isUSDomain ? "/us" : "";
  const findLabel = isUS ? "Find contractor" : "Find trade";
  const findRoute = `${countryPrefix}/home#manual-search`;
  const pricingRoute = `${countryPrefix}/pricing`;
  const isMarketingLanding = location.pathname === "/" || location.pathname === "/landing" || location.pathname === "/welcome";
  const isTransparentHeader = isMarketingLanding && !isScrolled;
  const closeNavigation = () => {
    setMobileSidebarOpen(false);
    setDesktopSidebarOpen(false);
  };

  useEffect(() => {
    setIsScrolled(window.scrollY > 20);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }

      setIsVisible(false);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("et-site-sidebar-open", showDesktopSidebar && desktopSidebarOpen);
    return () => {
      document.body.classList.remove("et-site-sidebar-open");
    };
  }, [desktopSidebarOpen, showDesktopSidebar]);

  useEffect(() => {
    closeNavigation();
  }, [location.pathname]);

  const headerClass = isMarketingLanding
    ? `fixed top-0 z-40 w-full ${isTransparentHeader ? "bg-transparent text-white" : "border-b border-white/10 bg-background/80 text-foreground backdrop-blur-xl"} transition-all duration-300 ${!isVisible ? "opacity-0 -translate-y-full md:translate-y-0 md:opacity-100" : "translate-y-0 opacity-100"}`
    : `sticky top-0 z-40 w-full bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${!isVisible ? "opacity-0 -translate-y-full md:translate-y-0 md:opacity-100" : "translate-y-0 opacity-100"}`;

  return (
    <>
      {showDesktopSidebar && desktopSidebarOpen && (
        <aside className="fixed left-0 top-0 z-50 hidden h-screen w-80 overflow-hidden overscroll-contain border-r border-slate-950/10 bg-white/88 p-5 shadow-[18px_0_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#080c14]/95 dark:shadow-[18px_0_80px_rgba(0,0,0,0.28)] lg:block">
          <SiteSidePanel
            mode="site"
            onNavigate={closeNavigation}
            onClose={() => setDesktopSidebarOpen(false)}
          />
        </aside>
      )}

      <header className={headerClass}>
        {!isTransparentHeader && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
        <div className="container-wide">
          <div className="flex h-16 items-center justify-between gap-5">
            <Link to={`${countryPrefix}/`} onClick={closeNavigation} className="group relative z-10 flex min-w-0 items-center gap-3">
              <img
                src="/et-logo-v3.webp"
                alt="Emergency Trades Logo"
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="hidden min-w-0 sm:block">
                <span className={`font-display text-[1.35rem] tracking-wide transition-colors ${isTransparentHeader ? "text-white group-hover:text-white/80" : "text-black dark:text-white group-hover:text-gold"}`}>
                  {siteNameMain}
                </span>
                <span className="ml-1.5 font-display text-[1.35rem] tracking-wide text-gold">{siteNameSub}</span>
              </div>
            </Link>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <Link
                to={pricingRoute}
                onClick={closeNavigation}
                className={`rounded-full px-4 py-2 font-display text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-300 ${
                  isTransparentHeader
                    ? "bg-white/8 text-gold hover:bg-gold hover:text-black"
                    : "text-gold/90 hover:bg-gold/10 hover:text-gold"
                }`}
              >
                <span>Pro Sign-Up</span>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                asChild
                size="sm"
                className={`hidden h-10 rounded-full bg-gold px-5 text-xs font-black uppercase tracking-[0.1em] text-black shadow-[0_10px_28px_rgba(212,175,55,0.18)] hover:bg-gold-light sm:inline-flex ${isTransparentHeader ? "shadow-[0_12px_34px_rgba(212,175,55,0.28)]" : ""}`}
              >
                <Link to={findRoute} onClick={closeNavigation}>
                  {findLabel}
                </Link>
              </Button>

              <UserMenu />
              <ModeToggle className={`hidden xl:inline-flex ${isTransparentHeader ? "border-white/12 bg-white/8 text-white/75 hover:bg-white/12" : "border-transparent bg-transparent"}`} />

              {showDesktopSidebar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDesktopSidebarOpen((open) => !open)}
                  className={`hidden h-9 w-9 rounded-full border border-transparent bg-transparent text-slate-500 transition-all duration-200 hover:border-gold/30 hover:bg-gold/5 hover:text-gold dark:text-slate-400 dark:hover:bg-gold/10 lg:inline-flex ${isTransparentHeader ? "border-white/10 bg-white/8 text-white/75 hover:bg-white/12" : ""}`}
                  title={desktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">{desktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}</span>
                </Button>
              )}

              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full border border-slate-200 text-slate-700 transition-all duration-200 hover:border-gold/50 hover:bg-gold/5 hover:text-gold dark:border-white/10 dark:text-slate-300 dark:hover:bg-gold/10 lg:hidden ${isTransparentHeader ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : ""}`}
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[310px] border-r border-slate-950/10 bg-[#f8f7f2] p-5 text-slate-950 dark:border-white/10 dark:bg-[#090d15] dark:text-white">
                  <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                  <SheetDescription className="sr-only">Main website navigation, account links, business tools, and emergency search.</SheetDescription>
                  <SiteSidePanel
                    mode="site"
                    onNavigate={closeNavigation}
                    onClose={closeNavigation}
                    showCloseButton={false}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
