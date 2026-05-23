import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BadgeCheck,
  CreditCard,
  Globe2,
  Home,
  LogIn,
  MapPin,
  Menu,
  Mic,
  Phone,
  Plus,
  Search,
  Siren,
  SlidersHorizontal,
  UserCircle,
  UserPlus,
  Wrench,
  Info,
  HelpCircle,
  ShieldCheck,
  Crown,
  Star,
  X,
  Rocket,
} from "lucide-react";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";
import { getSocialUrls } from "@/lib/siteConfig";
import { GuestGate } from "@/components/GuestGate";
import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SEO } from "@/components/SEO";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trades } from "@/lib/trades";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";
import { FloatingTourHub } from "@/components/FloatingTourHub";

const emergencyShortcuts = [
  { label: "Burst Pipe", trade: "plumber" },
  { label: "Power Outage", trade: "electrician" },
  { label: "Locked Out", trade: "locksmith" },
  { label: "Roof Leak", trade: "roofer" },
  { label: "Broken Glass", trade: "glazier" },
  { label: "Drain Blocked", trade: "drain-specialist" },
];

const emergencyTrustSteps = [
  "Tell us the emergency",
  "Choose trade and area",
  "Call the business directly",
];

const slugifyCity = (city: string) => city.toLowerCase().trim().replace(/\s+/g, "-");

export default function HomeSearch() {
  const navigate = useNavigate();
  const { detectedTrade, detectedCity, setDetectedTrade, setDetectedCity } = useChatbot();
  const { settings, detectUserLocation, isLocating, detectedCity: geoCity } = useLocalization();
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

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
  const isUS = settings.countryCode === 'US';
  const countryPrefix = isUS && !isUSDomain ? '/us' : '';
  const selectedTrade = useMemo(
    () => trades.find((trade) => trade.slug === detectedTrade),
    [detectedTrade]
  );
  const selectedTradeName = selectedTrade
    ? settings.countryCode === "US"
      ? selectedTrade.usName
      : selectedTrade.name
    : null;
  const resolvedCity = detectedCity || geoCity;
  const canLaunchListings = Boolean(detectedTrade && resolvedCity);

  const resetSearch = () => {
    setDetectedTrade(null);
    setDetectedCity(null);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const launchListings = () => {
    if (!detectedTrade || !resolvedCity) return;
    navigate(`/emergency-${detectedTrade}/${slugifyCity(resolvedCity)}`);
  };

  const pickTrade = (tradeSlug: string) => {
    setDetectedTrade(tradeSlug);
    setDrawerOpen(false);
  };

  const websiteServicesRoute = settings.countryCode === "US"
    ? "/for-contractors/website-showroom"
    : "/for-tradesmen/website-showroom";
  const signupLabel = settings.countryCode === "US" ? "Contractors Sign Up" : "Tradesmen Sign Up";

  const sidebar = (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto pr-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center justify-between px-2">
        <Link to={`${countryPrefix}/`} className="flex items-center gap-3 group">
          <img src="/et-logo-v3.webp" alt="" className="h-9 w-9 object-contain transition-transform group-hover:scale-105 duration-200" loading="lazy" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Emergency</p>
            <p className="font-display text-lg text-slate-950 dark:text-white group-hover:text-gold transition-colors">{siteTradeTerm}</p>
          </div>
        </Link>
        {/* Close button for both mobile sheet and desktop sidebar */}
        <button
          type="button"
          onClick={() => {
            setDrawerOpen(false);
            setDesktopSidebarOpen(false);
          }}
          className="p-1.5 rounded-full hover:bg-slate-950/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-950 dark:text-slate-500 dark:hover:text-white transition-colors"
          title="Close Sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1">
        <p className="home-search-section-label">Navigate</p>
        <Link to={`${countryPrefix}/`} className="home-search-nav-item" onClick={() => { setDrawerOpen(false); setDesktopSidebarOpen(true); }}>
          <Home className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Home
        </Link>
        <Link to={`${countryPrefix}/about`} className="home-search-nav-item" onClick={() => setDrawerOpen(false)}>
          <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          About Us
        </Link>
        <Link to={`${countryPrefix}/locations`} className="home-search-nav-item" onClick={() => setDrawerOpen(false)}>
          <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Locations
        </Link>
        <Link to={`${isUSDomain ? "/contact" : (isUS ? "/us/contact" : "/contact")}`} className="home-search-nav-item" onClick={() => setDrawerOpen(false)}>
          <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Contact
        </Link>
        <Link to="/landing" className="home-search-nav-item" onClick={() => setDrawerOpen(false)}>
          <Globe2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Landing Page
        </Link>
      </div>

      <div className="space-y-1">
        <p className="home-search-section-label">Learn & Support</p>
        <Link to={`${countryPrefix}/blog`} className="home-search-nav-item" onClick={() => setDrawerOpen(false)} data-tour="tour-blog-link">
          <BookOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Tutorials & News
        </Link>
        <Link to={`${countryPrefix}/vetting-process`} className="home-search-nav-item" onClick={() => setDrawerOpen(false)}>
          <ShieldCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Vetting Process
        </Link>
        <Link to={`${countryPrefix}/faq`} className="home-search-nav-item" onClick={() => setDrawerOpen(false)}>
          <HelpCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          FAQ
        </Link>
        <button
          type="button"
          onClick={() => {
            setDrawerOpen(false);
            window.dispatchEvent(new Event('start-tour'));
          }}
          className="home-search-nav-item w-full text-left cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-gold animate-pulse" />
          Interactive Tour
        </button>
      </div>

      <div className="home-search-sidebar-panel">
        <p className="home-search-sidebar-title">Current Search</p>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 dark:text-slate-500">Trade</span>
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{selectedTradeName || "Not selected"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 dark:text-slate-500">Area</span>
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{resolvedCity || "Not selected"}</span>
          </div>
        </div>
        <Button
          type="button"
          onClick={launchListings}
          disabled={!canLaunchListings}
          className="mt-4 h-10 w-full rounded-full bg-gold text-xs font-black uppercase tracking-[0.12em] text-black hover:bg-gold-light disabled:opacity-35"
        >
          <Search className="mr-2 h-4 w-4" />
          Find Help
        </Button>
      </div>

      <div className="space-y-4 border-t border-slate-950/10 pt-4 dark:border-white/10">
        <p className="home-search-section-label">Grow Your Business</p>
        
        {/* Card 1: Join the Network (Pricing) */}
        <Link
          to={`${countryPrefix}/pricing`}
          onClick={() => setDrawerOpen(false)}
          className="group block text-left rounded-xl border border-gold/30 bg-gold/5 p-4 transition-all duration-300 hover:border-gold/60 hover:bg-gold/10 hover:shadow-lg dark:border-gold/20 dark:bg-gold/5 dark:hover:border-gold/40"
          data-tour="tour-signup"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors shrink-0">
              <Rocket className="w-4 h-4 text-gold" />
            </div>
            <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white">
              {settings.countryCode === "US" ? "Pro Sign Up" : "Join our Network"}
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Get listed on our directory and receive urgent emergency leads directly in your local area.
          </p>
          <div className="flex items-center text-xs font-black uppercase tracking-[0.08em] text-gold group-hover:text-gold-light">
            View pricing & plans →
          </div>
        </Link>

        {/* Card 2: Claim Your Business */}
        <Link
          to="/claim-your-business"
          onClick={() => setDrawerOpen(false)}
          className="group block text-left rounded-xl border border-slate-950/10 bg-white/70 p-4 transition-all duration-300 hover:border-gold/50 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-black/25 dark:hover:border-gold/50 dark:hover:bg-black/40"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors shrink-0">
              <ShieldCheck className="w-4 h-4 text-gold" />
            </div>
            <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white">Claim Your Business</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Already listed? Send a manual claim request so we can verify ownership before any listing changes are made.
          </p>
          <div className="flex items-center text-xs font-black uppercase tracking-[0.08em] text-gold group-hover:text-gold-light">
            Start claim →
          </div>
        </Link>

        {/* Card 3: Website Showroom */}
        <Link
          to={websiteServicesRoute}
          onClick={() => setDrawerOpen(false)}
          className="group block text-left rounded-xl border border-slate-950/10 bg-white/70 p-4 transition-all duration-300 hover:border-gold/50 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-black/25 dark:hover:border-gold/50 dark:hover:bg-black/40"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors shrink-0">
              <Star className="w-4 h-4 text-gold" />
            </div>
            <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white">Website Showroom</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Browse 11 emergency-ready website styles and enquire about the one that fits your trade.
          </p>
          <div className="flex items-center text-xs font-black uppercase tracking-[0.08em] text-gold group-hover:text-gold-light">
            View showroom →
          </div>
        </Link>

        {/* Card 4: Websites for Tradespeople / Contractors */}
        <Link
          to={settings.countryCode === "US" ? "/for-contractors" : "/for-tradesmen"}
          onClick={() => setDrawerOpen(false)}
          className="group block text-left rounded-xl border border-slate-950/10 bg-white/70 p-4 transition-all duration-300 hover:border-gold/50 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-black/25 dark:hover:border-gold/50 dark:hover:bg-black/40"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors shrink-0">
              <Crown className="w-4 h-4 text-gold" />
            </div>
            <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white">
              Websites for {settings.countryCode === "US" ? "Contractors" : "Tradespeople"}
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Full-service website design, hosting, and setup — we build it, you go live with a working enquiry form.
          </p>
          <div className="flex items-center text-xs font-black uppercase tracking-[0.08em] text-gold group-hover:text-gold-light">
            Learn more →
          </div>
        </Link>
      </div>

      {/* Social Links */}
      <div className="space-y-3 border-t border-slate-950/10 pt-4 dark:border-white/10">
        <p className="home-search-section-label">Follow Us</p>
        <div className="flex gap-2.5 px-2">
          {(() => {
            const socials = getSocialUrls();
            return (
              <>
                <GlassSocialIcon platform="facebook" href={socials.facebook} className="w-9 h-9 border-slate-950/10 dark:border-white/10 bg-slate-950/5 dark:bg-white/5" />
                <GlassSocialIcon platform="instagram" href={socials.instagram} className="w-9 h-9 border-slate-950/10 dark:border-white/10 bg-slate-950/5 dark:bg-white/5" />
                <GlassSocialIcon platform="twitter" href={socials.twitter} className="w-9 h-9 border-slate-950/10 dark:border-white/10 bg-slate-950/5 dark:bg-white/5" />
                <GlassSocialIcon platform="tiktok" href={socials.tiktok || "https://www.tiktok.com/@emergencytradesmen"} className="w-9 h-9 border-slate-950/10 dark:border-white/10 bg-slate-950/5 dark:bg-white/5" />
              </>
            );
          })()}
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-950/10 pt-4 dark:border-white/10 mt-auto">
        <p className="home-search-section-label">Account & Theme</p>
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex-1 flex justify-start">
            <UserMenu orientation="vertical" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setDrawerOpen(false);
                window.dispatchEvent(new Event('start-tour'));
              }}
              className="h-9 w-9 border-slate-950/15 bg-white/70 text-slate-950 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 rounded-full"
              title="Interactive Help Tour"
            >
              <HelpCircle className="h-5 w-5 text-gold animate-pulse" />
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <GuestGate />
      <FloatingTourHub />
      <Helmet>
        <style>{`
          .home-search-nav-item {
            display: flex;
            width: 100%;
            align-items: center;
            gap: 0.75rem;
            border-radius: 0.75rem;
            padding: 0.7rem 0.75rem;
            color: rgb(51 65 85 / 0.92);
            transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
            text-align: left;
          }
          .home-search-nav-item:hover {
            background: rgb(15 23 42 / 0.06);
            color: rgb(15 23 42);
            transform: translateX(2px);
          }
          .dark .home-search-nav-item {
            color: rgb(226 232 240 / 0.86);
          }
          .dark .home-search-nav-item:hover {
            background: rgb(255 255 255 / 0.08);
            color: white;
          }
          .home-search-section-label {
            color: rgb(100 116 139);
            font-size: 0.64rem;
            font-weight: 900;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            padding: 0 0.5rem 0.25rem;
          }
          .dark .home-search-section-label {
            color: rgb(148 163 184);
          }
          .home-search-sidebar-panel {
            border: 1px solid rgb(15 23 42 / 0.10);
            border-radius: 1rem;
            background:
              linear-gradient(180deg, rgb(255 255 255 / 0.78), rgb(248 250 252 / 0.62)),
              rgb(255 255 255 / 0.62);
            padding: 0.9rem;
            box-shadow: 0 1px 2px rgb(15 23 42 / 0.04), inset 0 1px 0 rgb(255 255 255 / 0.85);
          }
          .dark .home-search-sidebar-panel {
            border-color: rgb(255 255 255 / 0.08);
            background:
              linear-gradient(180deg, rgb(255 255 255 / 0.055), rgb(255 255 255 / 0.028)),
              rgb(2 6 23 / 0.28);
            box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05);
          }
          .home-search-sidebar-title {
            color: rgb(71 85 105);
            font-size: 0.66rem;
            font-weight: 800;
            letter-spacing: 0.2em;
            text-transform: uppercase;
          }
          .dark .home-search-sidebar-title {
            color: rgb(148 163 184);
          }
          .home-search-mini-link {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            border-radius: 0.7rem;
            padding: 0.55rem 0.45rem;
            color: rgb(203 213 225 / 0.9);
            font-size: 0.78rem;
            transition: background-color 160ms ease, color 160ms ease;
          }
          .home-search-mini-link:hover {
            background: rgb(255 255 255 / 0.06);
            color: white;
          }
          .home-search-chatbox {
            background: rgb(255 255 255 / 0.90);
            color: rgb(2 6 23);
            box-shadow: 0 22px 70px rgb(15 23 42 / 0.12), 0 0 42px rgb(212 175 55 / 0.08);
            outline: 1px solid rgb(15 23 42 / 0.10);
          }
          .home-search-chatbox:focus-within {
            outline-color: rgb(212 175 55 / 0.45);
            box-shadow: 0 24px 75px rgb(15 23 42 / 0.16), 0 0 58px rgb(212 175 55 / 0.14);
          }
          .dark .home-search-chatbox {
            background: rgb(21 21 21 / 0.94);
            color: white;
            outline-color: rgb(255 255 255 / 0.11);
            box-shadow: 0 24px 80px rgb(0 0 0 / 0.42), 0 0 52px rgb(212 175 55 / 0.07);
          }
          .dark .home-search-chatbox:focus-within {
            outline-color: rgb(212 175 55 / 0.35);
            box-shadow: 0 28px 90px rgb(0 0 0 / 0.50), 0 0 68px rgb(212 175 55 / 0.13);
          }
          .home-search-control-text,
          .home-search-control-icon {
            background: rgb(15 23 42 / 0.045);
            color: rgb(51 65 85);
            box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.65), 0 0 0 1px rgb(15 23 42 / 0.10);
          }
          .home-search-control-text:hover,
          .home-search-control-icon:hover {
            background: rgb(15 23 42 / 0.07);
            color: rgb(15 23 42);
            box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.65), 0 0 0 1px rgb(212 175 55 / 0.45);
          }
          .dark .home-search-control-text,
          .dark .home-search-control-icon {
            background: rgb(255 255 255 / 0.055);
            color: rgb(226 232 240);
            box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05), 0 0 0 1px rgb(255 255 255 / 0.10);
          }
          .dark .home-search-control-text:hover,
          .dark .home-search-control-icon:hover {
            background: rgb(255 255 255 / 0.085);
            color: white;
            box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.06), 0 0 0 1px rgb(212 175 55 / 0.35);
          }
          .home-search-send:disabled {
            background: rgb(15 23 42 / 0.045);
            color: rgb(148 163 184);
            box-shadow: 0 0 0 1px rgb(15 23 42 / 0.10);
          }
          .dark .home-search-send:disabled {
            background: rgb(255 255 255 / 0.055);
            color: rgb(100 116 139);
            box-shadow: 0 0 0 1px rgb(255 255 255 / 0.10);
          }
          .home-search-trust-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.75rem;
          }
          .home-search-trust-pill {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            min-height: 3.25rem;
            border-radius: 0.5rem;
            border: 1px solid rgb(15 23 42 / 0.10);
            background: rgb(255 255 255 / 0.68);
            padding: 0.75rem;
            color: rgb(51 65 85);
            box-shadow: 0 12px 30px rgb(15 23 42 / 0.06);
          }
          .dark .home-search-trust-pill {
            border-color: rgb(255 255 255 / 0.09);
            background: rgb(255 255 255 / 0.055);
            color: rgb(203 213 225);
            box-shadow: 0 18px 42px rgb(0 0 0 / 0.22);
          }
          .home-search-trust-pill strong {
            display: flex;
            width: 1.55rem;
            height: 1.55rem;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: rgb(212 175 55 / 0.16);
            color: rgb(139 104 16);
            font-size: 0.74rem;
            font-weight: 900;
          }
          .dark .home-search-trust-pill strong {
            color: rgb(255 215 85);
          }
          .home-search-trust-pill span {
            font-size: 0.82rem;
            font-weight: 800;
            line-height: 1.2;
          }
          @media (max-width: 640px) {
            .home-search-trust-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </Helmet>
      <SEO
        title={`Search Emergency ${siteTradeTerm} Near You`}
        description={`Search local emergency ${siteTradeTerm.toLowerCase()}, use voice or manual search, and open public listings for plumbers, electricians, locksmiths, roofers, HVAC and more.`}
        canonical="/"
      />

      <main className="min-h-screen bg-[#f7f5ef] text-slate-950 dark:bg-[#05070b] dark:text-white">
        <div className="flex min-h-screen">
          {desktopSidebarOpen && (
            <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto overscroll-contain border-r border-slate-950/10 bg-white/82 p-5 shadow-[18px_0_80px_rgba(15,23,42,0.08)] backdrop-blur-xl [scrollbar-width:thin] dark:border-white/10 dark:bg-[#080c14]/95 dark:shadow-[18px_0_80px_rgba(0,0,0,0.28)] lg:block">
              {sidebar}
            </aside>
          )}

          <section className="relative min-w-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(212,175,55,0.16),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(15,23,42,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.55),transparent_36%)] dark:bg-[radial-gradient(circle_at_50%_10%,rgba(212,175,55,0.14),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(18,55,92,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_30%)]" />
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
                        {sidebar}
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {/* Quick controls when sidebar is closed or on mobile */}
                <div className={cn("flex items-center gap-3", desktopSidebarOpen && "lg:hidden")}>
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
