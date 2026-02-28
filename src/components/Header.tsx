import { Link, useLocation } from "react-router-dom";
import { Phone, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/UserMenu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";


interface HeaderProps {
  countryCode?: string;
}

export function Header({ countryCode }: HeaderProps) {
  const { settings } = useLocalization();
  const location = useLocation();

  // STRICT OVERRIDE: Prioritize prop, fallback to context
  const activeCountry = countryCode || settings.countryCode;
  const isUS = activeCountry === 'US';

  const signupText = isUS ? 'Pro Sign Up' : 'Tradesmen Sign Up';
  const countryPrefix = isUS ? '/us' : '';

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      {/* Gradient bottom line instead of flat border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          <Link to={`${countryPrefix}/`} className="flex items-center gap-3 group relative z-50">
            <div className="relative">
              <img src="/et-logo-v2.png" alt="Emergency Trades Logo" className="w-12 h-12 rounded-full object-cover border border-gold/30 group-hover:border-gold/80 transition-colors" />
              <div className="absolute inset-0 rounded-full bg-gold/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-2xl tracking-wide text-foreground group-hover:text-white transition-colors">Emergency</span>
              <span className="font-display text-2xl tracking-wide text-gold ml-1.5">{isUS ? 'Contractors' : 'Tradesmen'}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {/* Nav Links with animated underline */}
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

            <Link to="/contact" className="relative text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors group/link">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover/link:w-full" />
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <UserMenu />
            <ModeToggle />

            {/* Mobile Menu & Help Hub */}
            <div className="md:hidden flex items-center gap-1">
              <Button asChild variant="outline" className="h-9 px-3.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold bg-black/40 backdrop-blur-md shadow-sm gap-2 transition-all">
                <Link to={`${location.pathname}?tour=true`}>
                  <div className="relative flex items-center">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
                  </div>
                  <span className="font-display font-bold tracking-wide text-xs">Need Help?</span>
                </Link>
              </Button>

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
                <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-gold/10 bg-black/95 backdrop-blur-xl">
                  <SheetTitle className="text-left font-display text-3xl mb-10 mt-4">
                    <span className="text-white">Emergency</span>
                    <span className="text-gold ml-2">{isUS ? 'Contractors' : 'Tradesmen'}</span>
                  </SheetTitle>
                  <nav className="flex flex-col gap-8">
                    <Link to={`${countryPrefix}/about`} className="text-2xl font-display font-medium text-white/80 hover:text-gold transition-colors block">
                      About Us
                    </Link>
                    <Link to={`${countryPrefix}/blog`} className="text-2xl font-display font-medium text-white/80 hover:text-gold transition-colors block">
                      Latest News
                    </Link>

                    <Link to="/contact" className="text-2xl font-display font-medium text-white/80 hover:text-gold transition-colors block">
                      Contact
                    </Link>

                    <div className="h-px bg-white/10 my-2" />

                    <Button variant="outline" asChild className="border-gold text-gold hover:bg-gold/10 w-full justify-start text-lg h-14 rounded-xl">
                      <Link to={`${countryPrefix}/pricing`}>
                        {signupText}
                      </Link>
                    </Button>

                    <div className="mt-auto pt-8 border-t border-white/10">
                      <p className="text-xs text-gold/60 uppercase tracking-widest mb-6 font-medium">Follow Our Updates</p>
                      <div className="flex gap-6">
                        <GlassSocialIcon platform="facebook" href="https://www.facebook.com/profile.php?id=61588024972553" className="w-12 h-12" />
                        <GlassSocialIcon platform="instagram" href="https://www.instagram.com/emergencytradesmen/" className="w-12 h-12" />
                        <GlassSocialIcon platform="twitter" href="https://x.com/etemergenc26245" className="w-12 h-12" />
                        <GlassSocialIcon platform="tiktok" href="https://www.tiktok.com/@emergencytradesmen" className="w-12 h-12" />
                      </div>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}