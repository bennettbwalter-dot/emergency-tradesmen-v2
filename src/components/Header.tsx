import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/UserMenu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Menu,
  Home,
  Info,
  MapPin,
  Phone,
  FileText,
  HelpCircle,
  ShieldCheck,
  Rocket,
  ChevronRight
} from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";
import { getSocialUrls } from "@/lib/siteConfig";


interface HeaderProps {
  countryCode?: string;
}

export function Header({ countryCode }: HeaderProps) {
  const { settings } = useLocalization();
  const location = useLocation();

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');

  const activeCountry = countryCode || settings.countryCode;
  const isUS = activeCountry === 'US';

  const siteNameMain = 'Emergency';
  const siteNameSub = isUSDomain ? 'Contractors' : (isUS ? 'Contractors' : 'Tradesmen');
  const signupText = isUS ? 'Pro Sign Up' : 'Tradesmen Sign Up';
  
  // Rule: On US domain, we NEVER use the /us prefix. On UK domain, we use it for US content.
  const countryPrefix = isUS && !isUSDomain ? '/us' : '';

  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Always show on desktop (md and up)
      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }

      // Hide immediately on scroll start
      setIsVisible(false);

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Show after scroll stops (200ms)
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${!isVisible ? 'md:translate-y-0 -translate-y-full md:opacity-100 opacity-0' : 'translate-y-0 opacity-100'}`}>
      {/* Gradient bottom line instead of flat border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* LEFT AREA: Logo */}
          <div className="flex-shrink-0 z-50">
            <Link to={`${countryPrefix}/`} className="flex items-center gap-3 group relative">
              <div className="relative">
                <img src="/et-logo-v2.webp" alt="Emergency Trades Logo" loading="eager" onError={(e) => { e.currentTarget.style.display='none'; }} className="w-12 h-12 rounded-full object-cover border border-gold/30 group-hover:border-gold/80 transition-colors" />
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-2xl tracking-wide text-foreground group-hover:text-white transition-colors">{siteNameMain}</span>
                <span className="font-display text-2xl tracking-wide text-gold ml-1.5">{siteNameSub}</span>
              </div>
            </Link>
          </div>

          {/* CENTER AREA: Desktop Nav / Mobile Tradesmen Sign Up */}
          <div className="flex-1 flex justify-center items-center px-4 min-w-0 pointer-events-none">
            {/* Mobile (Text Only) - Center Link */}
            <div className="md:hidden z-50 pointer-events-auto flex items-center justify-center w-full">
              <Link
                to={`${countryPrefix}/pricing`}
                className="text-[10px] font-black tracking-widest text-gold hover:text-white transition-all uppercase whitespace-nowrap bg-gold/5 border border-gold/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                data-tour="tour-signup"
              >
                {signupText}
              </Link>
            </div>

            {/* Desktop Nav - strictly hidden on mobile */}
            <nav className="hidden md:flex items-center gap-8 pointer-events-auto">
              {['About', 'Blog'].map((item) => (
                <Link
                  key={item}
                  to={`${countryPrefix}/${item.toLowerCase()}`}
                  className="relative text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors group/link"
                  data-tour={item === 'Blog' ? 'tour-blog-link' : undefined}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover/link:w-full" />
                </Link>
              ))}

              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold px-5 rounded-full transition-all duration-300"
                data-tour="tour-signup"
              >
                <Link to={`${countryPrefix}/pricing`}>
                  {signupText}
                </Link>
              </Button>

              <Link 
                to={isUSDomain ? "/contact" : (isUS ? "/us/contact" : "/contact")} 
                className="relative text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors group/link"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover/link:w-full" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 z-50 min-w-[40px] justify-end">
            <div className="hidden md:block">
              <UserMenu />
            </div>
            <div className="block">
              <ModeToggle />
            </div>

            {/* Mobile Menu Button - Locked Position */}
            <div className="md:hidden flex items-center shrink-0">

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 text-muted-foreground hover:text-gold hover:bg-gold/5">
                    {/* Invisible targets for the mobile tour to highlight the menu button */}
                    <div data-tour="tour-signup" className="absolute inset-0 pointer-events-none" />
                    <div data-tour="tour-blog-link" className="absolute inset-0 pointer-events-none" />
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[320px] p-4 bg-[#0B0F19] border-r border-white/5 text-slate-300">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                  {/* Top Header Match */}
                  <div className="flex items-center justify-between mb-8 mt-2 px-2">
                    <div className="flex items-center gap-3">
                      <img src="/et-logo-v2.webp" alt="Logo" loading="lazy" className="w-8 h-8 rounded-full border border-gold/30" />
                      <span className="font-display tracking-wide text-lg text-white">{siteNameMain}<span className="text-gold ml-1">{siteNameSub}</span></span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 overflow-y-auto pb-8">
                    {/* NAVIGATE */}
                    <div className="px-3 mb-2 mt-2">
                      <span className="text-[10px] font-bold tracking-[0.15em] text-[#6b7280] uppercase">Navigate</span>
                    </div>

                    <Link to={`${countryPrefix}/`} className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors">
                      <Home className="w-[18px] h-[18px] text-[#9ca3af]" />
                      Home
                    </Link>

                    <Link to={`${countryPrefix}/about`} className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors">
                      <Info className="w-[18px] h-[18px] text-[#9ca3af]" />
                      About Us
                    </Link>

                    <Link to={`${countryPrefix}/locations`} className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors">
                      <MapPin className="w-[18px] h-[18px] text-[#9ca3af]" />
                      Locations
                    </Link>

                    <Link 
                      to={isUSDomain ? "/contact" : (isUS ? "/us/contact" : "/contact")} 
                      className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors"
                    >
                      <Phone className="w-[18px] h-[18px] text-[#9ca3af]" />
                      Contact
                    </Link>

                    {/* ADVANCED TOOLS */}
                    <div className="px-3 mb-2 mt-6 flex justify-between items-center group cursor-pointer">
                      <span className="text-[10px] font-bold tracking-[0.15em] text-[#325e46] uppercase">Advanced Tools</span>
                      <ChevronRight className="w-3 h-3 text-[#325e46] group-hover:text-[#4ade80] transition-colors" />
                    </div>

                    <Link to={`${countryPrefix}/pricing`} className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors">
                      <Rocket className="w-[18px] h-[18px] text-[#9ca3af]" />
                      {signupText}
                    </Link>

                    <div className="mt-1">
                      <div className="flex flex-col py-1">
                        <UserMenu orientation="vertical" />
                      </div>
                    </div>

                    {/* LEARN */}
                    <div className="px-3 mb-2 mt-6 flex justify-between items-center group cursor-pointer">
                      <span className="text-[10px] font-bold tracking-[0.15em] text-[#325e46] uppercase">Learn</span>
                    </div>

                    <Link to={`${countryPrefix}/blog`} className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors">
                      <FileText className="w-[18px] h-[18px] text-[#9ca3af]" />
                      Tutorials & News
                    </Link>

                    <Link to={`${countryPrefix}/vetting-process`} className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors">
                      <ShieldCheck className="w-[18px] h-[18px] text-[#9ca3af]" />
                      Vetting Process
                    </Link>

                    <Link to={`${countryPrefix}/faq`} className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1d27] text-[#e5e7eb] transition-colors">
                      <HelpCircle className="w-[18px] h-[18px] text-[#9ca3af]" />
                      FAQ
                    </Link>

                    {/* Socials */}
                    <div className="mt-8 px-3 pt-6 border-t border-white/5">
                        <div className="flex gap-4">
                        {(() => { const socials = getSocialUrls(); return (
                            <>
                                <GlassSocialIcon platform="facebook" href={socials.facebook} className="w-10 h-10 bg-[#1a1d27] border-0" />
                                <GlassSocialIcon platform="instagram" href={socials.instagram} className="w-10 h-10 bg-[#1a1d27] border-0" />
                                <GlassSocialIcon platform="twitter" href={socials.twitter} className="w-10 h-10 bg-[#1a1d27] border-0" />
                                <GlassSocialIcon platform="tiktok" href={socials.tiktok || "https://www.tiktok.com/@emergencytradesmen"} className="w-10 h-10 bg-[#1a1d27] border-0" />
                            </>
                        ); })()}
                        </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
