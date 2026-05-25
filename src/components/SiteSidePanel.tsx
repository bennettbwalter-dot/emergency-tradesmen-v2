import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  BookOpen,
  Crown,
  CreditCard,
  Globe2,
  HelpCircle,
  Home,
  Info,
  LogIn,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Siren,
  Star,
  UserCircle,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { getSocialUrls, isUSDomain as getIsUSDomain } from "@/lib/siteConfig";
import { trades } from "@/lib/trades";
import { cn } from "@/lib/utils";

type SiteSidePanelMode = "home" | "site";

interface SiteSidePanelProps {
  mode?: SiteSidePanelMode;
  onNavigate?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const slugifyCity = (city: string) => city.toLowerCase().trim().replace(/\s+/g, "-");

const sideIconClass = "h-4 w-4 shrink-0";

export function SiteSidePanel({
  mode = "site",
  onNavigate,
  onClose,
  showCloseButton = true,
}: SiteSidePanelProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { detectedTrade, detectedCity } = useChatbot();
  const { settings, detectedCity: geoCity } = useLocalization();

  const isUS = settings.countryCode === "US";
  const isUSDomain = getIsUSDomain();
  const countryPrefix = isUS && !isUSDomain ? "/us" : "";
  const siteTradeTerm = isUS ? "Contractors" : "Tradesmen";
  const findLabel = isUS ? "Find a contractor" : "Find a trade";
  const signupLabel = "Pro Sign-Up";
  const servicePageLabel = isUS ? "Build a Website" : "Website Services";
  const websiteServicesRoute = isUS ? "/for-contractors/website-showroom" : "/for-tradesmen/website-showroom";
  const serviceRoute = isUS ? "/for-contractors" : "/for-tradesmen";
  const contactRoute = isUSDomain ? "/contact" : isUS ? "/us/contact" : "/contact";
  const pricingRoute = `${countryPrefix}/pricing`;
  const resolvedCity = detectedCity || geoCity;
  const selectedTrade = useMemo(
    () => trades.find((trade) => trade.slug === detectedTrade),
    [detectedTrade],
  );
  const selectedTradeName = selectedTrade ? (isUS ? selectedTrade.usName : selectedTrade.name) : null;
  const canLaunchListings = Boolean(detectedTrade && resolvedCity);

  const closeForNavigation = () => {
    onNavigate?.();
  };

  const launchListings = () => {
    closeForNavigation();
    if (detectedTrade && resolvedCity) {
      navigate(`/emergency-${detectedTrade}/${slugifyCity(resolvedCity)}`);
      return;
    }
    navigate(`${countryPrefix}/#manual-search`);
  };

  const startTour = () => {
    closeForNavigation();
    window.dispatchEvent(new Event("start-tour"));
  };

  const navItemClass = (path: string) =>
    cn("home-search-nav-item", location.pathname === path && "home-search-nav-item-active");

  return (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto pr-1 text-sm [scrollbar-width:thin]">
      <div className="flex items-center justify-between px-2">
        <Link to={`${countryPrefix}/`} className="group flex items-center gap-3" onClick={closeForNavigation}>
          <img
            src="/et-logo-v3.webp"
            alt=""
            className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Emergency</p>
            <p className="font-display text-lg text-slate-950 transition-colors group-hover:text-gold dark:text-white">
              {siteTradeTerm}
            </p>
          </div>
        </Link>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-950/5 hover:text-slate-950 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white"
            title="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <p className="home-search-section-label">Business Actions</p>

        <div className="grid gap-1">
          <Link to="/claim-your-business" className="home-search-nav-item" onClick={closeForNavigation}>
            <BadgeCheck className={cn(sideIconClass, "text-emerald-500 dark:text-emerald-300")} />
            Claim Your Business
          </Link>
          <Link to={serviceRoute} className="home-search-nav-item" onClick={closeForNavigation}>
            <Crown className={cn(sideIconClass, "text-amber-500 dark:text-amber-300")} />
            {servicePageLabel}
          </Link>
          <Link to={websiteServicesRoute} className="home-search-nav-item" onClick={closeForNavigation}>
            <Star className={cn(sideIconClass, "text-fuchsia-500 dark:text-fuchsia-300")} />
            Website Showroom
          </Link>
          <Link to={pricingRoute} className="home-search-nav-item" onClick={closeForNavigation}>
            <CreditCard className={cn(sideIconClass, "text-sky-500 dark:text-sky-300")} />
            Pricing
          </Link>
          <Link to={contactRoute} className={navItemClass(contactRoute)} onClick={closeForNavigation}>
            <Phone className={cn(sideIconClass, "text-lime-500 dark:text-lime-300")} />
            Contact
          </Link>
        </div>
      </div>

      <div className="space-y-1">
        <p className="home-search-section-label">Navigate</p>
        <Link to={`${countryPrefix}/`} className={navItemClass(`${countryPrefix}/`)} onClick={closeForNavigation}>
          <Home className={cn(sideIconClass, "text-gold")} />
          Home
        </Link>
        <Link to={`${countryPrefix}/#manual-search`} className="home-search-nav-item" onClick={closeForNavigation}>
          <Search className={cn(sideIconClass, "text-cyan-500 dark:text-cyan-300")} />
          {findLabel}
        </Link>
        <Link to={`${countryPrefix}/about`} className={navItemClass(`${countryPrefix}/about`)} onClick={closeForNavigation}>
          <Info className={cn(sideIconClass, "text-indigo-500 dark:text-indigo-300")} />
          About Us
        </Link>
        <Link
          to={`${countryPrefix}/locations`}
          className={navItemClass(`${countryPrefix}/locations`)}
          onClick={closeForNavigation}
        >
          <MapPin className={cn(sideIconClass, "text-rose-500 dark:text-rose-300")} />
          Locations
        </Link>
        <Link to="/landing" className={navItemClass("/landing")} onClick={closeForNavigation}>
          <Globe2 className={cn(sideIconClass, "text-teal-500 dark:text-teal-300")} />
          Landing Page
        </Link>
      </div>

      <div className="space-y-1">
        <p className="home-search-section-label">Learn & Support</p>
        <Link
          to={`${countryPrefix}/blog`}
          className={navItemClass(`${countryPrefix}/blog`)}
          onClick={closeForNavigation}
          data-tour="tour-blog-link"
        >
          <BookOpen className={cn(sideIconClass, "text-violet-500 dark:text-violet-300")} />
          Blog
        </Link>
        <Link
          to={`${countryPrefix}/vetting-process`}
          className={navItemClass(`${countryPrefix}/vetting-process`)}
          onClick={closeForNavigation}
        >
          <ShieldCheck className={cn(sideIconClass, "text-emerald-500 dark:text-emerald-300")} />
          Vetting Process
        </Link>
        <Link to={`${countryPrefix}/faq`} className={navItemClass(`${countryPrefix}/faq`)} onClick={closeForNavigation}>
          <HelpCircle className={cn(sideIconClass, "text-orange-500 dark:text-orange-300")} />
          FAQ
        </Link>
        <button type="button" onClick={startTour} className="home-search-nav-item w-full cursor-pointer text-left">
          <HelpCircle className={cn(sideIconClass, "animate-pulse text-gold")} />
          Interactive Tour
        </button>
      </div>

      <div className="space-y-2 pt-1">
        <p className="home-search-sidebar-title">{mode === "home" ? "Current Search" : "Emergency Search"}</p>
        <div className="mt-1 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 dark:text-slate-500">Trade</span>
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {selectedTradeName || "Not selected"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 dark:text-slate-500">Area</span>
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {resolvedCity || "Not selected"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1 border-t border-slate-950/10 pt-4 dark:border-white/10">
        <p className="home-search-section-label">Account</p>
        <Link to="/user/dashboard" onClick={closeForNavigation} className="home-search-nav-item">
          <UserCircle className={cn(sideIconClass, "text-blue-500 dark:text-blue-300")} />
          Account Dashboard
        </Link>
        <Link to="/account/billing" onClick={closeForNavigation} className="home-search-nav-item">
          <CreditCard className={cn(sideIconClass, "text-sky-500 dark:text-sky-300")} />
          Billing
        </Link>
      </div>

      <div className="mt-auto space-y-3 border-t border-slate-950/10 pt-4 dark:border-white/10">
        <p className="home-search-section-label">Follow Us</p>
        <div className="flex gap-2.5 px-2">
          {(() => {
            const socials = getSocialUrls();
            return (
              <>
                <GlassSocialIcon platform="facebook" href={socials.facebook} className="h-9 w-9 border-slate-950/10 bg-slate-950/5 dark:border-white/10 dark:bg-white/5" />
                <GlassSocialIcon platform="instagram" href={socials.instagram} className="h-9 w-9 border-slate-950/10 bg-slate-950/5 dark:border-white/10 dark:bg-white/5" />
                <GlassSocialIcon platform="twitter" href={socials.twitter} className="h-9 w-9 border-slate-950/10 bg-slate-950/5 dark:border-white/10 dark:bg-white/5" />
                <GlassSocialIcon platform="tiktok" href={socials.tiktok || "https://www.tiktok.com/@emergencytradesmen"} className="h-9 w-9 border-slate-950/10 bg-slate-950/5 dark:border-white/10 dark:bg-white/5" />
              </>
            );
          })()}
        </div>
      </div>
    </nav>
  );
}
