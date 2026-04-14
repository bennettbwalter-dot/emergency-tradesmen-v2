import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { trades } from "@/lib/trades";
import { Newsletter } from "./Newsletter";
import { GlassSocialIcon } from "./ui/GlassSocialIcon";
import { useLocalization } from "@/contexts/LocalizationContext";
import { getSocialUrls } from "@/lib/siteConfig";

export interface FooterProps {
  countryCode?: string;
}

export function Footer({ countryCode }: FooterProps) {
  const { settings: globalSettings } = useLocalization();
  const activeCountry = countryCode || globalSettings.countryCode;
  const isUS = activeCountry === 'US';

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');

  const siteNameMain = 'Emergency';
  const siteNameSub = isUSDomain ? 'Contractors' : (isUS ? 'Contractors' : 'Tradesmen');
  const siteName = `${siteNameMain} ${siteNameSub}`;

  const countryPrefix = isUS && !isUSDomain ? '/us' : '';
  const FOOTER_TRADE_COUNT = 7;
  const displayCities = isUS
    ? ["Los Angeles", "New York", "Dallas", "Houston", "Miami", "Phoenix", "Seattle", "San Francisco"]
    : ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bristol", "Liverpool"];
  const tradeTerm = isUS ? "Contractor" : "Tradesperson";

  return (
    <footer className="relative bg-black text-white pt-24 pb-12 mt-24 overflow-hidden border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50" />
      <div className="absolute -top-[500px] -left-[500px] w-[1000px] h-[1000px] bg-gold/5 rounded-full blur-3xl pointer-events-none opacity-20" />

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-20">

          {/* Brand Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            <Link to={`${countryPrefix}/`} className="flex items-center gap-4 group">
              <div className="relative">
                <img src="/et-logo-v2.webp" alt="Emergency Trades Logo" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-gold/50 transition-colors" />
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl tracking-tight text-white leading-none">Emergency</span>
                <span className="font-display font-bold text-2xl tracking-tight text-gold leading-none">{tradeTerm === 'Contractor' ? 'Contractors' : 'Tradesmen'}</span>
              </div>
            </Link>

            <p className="text-white/60 text-base leading-relaxed max-w-sm font-light">
              The gold standard in emergency property response. Connecting verified {tradeTerm.toLowerCase()}s with homeowners in crisis, 24/7/365.
            </p>

            <div className="flex gap-3">
              {(() => {
                const socials = getSocialUrls(); return (
                  <>
                    <GlassSocialIcon platform="facebook" href={socials.facebook} />
                    <GlassSocialIcon platform="instagram" href={socials.instagram} />
                    <GlassSocialIcon platform="twitter" href={socials.twitter} />
                    <GlassSocialIcon platform="tiktok" href={socials.tiktok || "https://www.tiktok.com/@emergencytradesmen"} />
                  </>
                );
              })()}
            </div>

            <div className="pt-6">
              <Newsletter />
            </div>
          </div>

          {/* Links Grid (8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12">

            {/* Services */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-gold mb-8">Expert Services</h4>
              <ul className="space-y-4">
                {trades.slice(0, FOOTER_TRADE_COUNT).map((trade, idx) => {
                  const landingCities = isUS ? ["los-angeles", "new-york", "dallas", "miami", "phoenix", "seattle", "detroit"] : ["london", "manchester", "birmingham", "leeds", "glasgow", "cardiff"];
                  const city = landingCities[idx % landingCities.length];
                  const tradeName = isUS ? (trade as any).usName : trade.name;
                  return (
                    <li key={trade.slug}>
                      <Link
                        to={`${countryPrefix}/emergency-${trade.slug}/${city}`}
                        className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-block"
                      >
                        Emergency {tradeName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-gold mb-8">Major Cities</h4>
              <ul className="space-y-4">
                {displayCities.map((city) => (
                  <li key={city}>
                    <Link
                      to={`${countryPrefix}/emergency-plumber/${city.toLowerCase().replace(/ /g, '-')}`}
                      className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-block"
                    >
                      {city}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to={`${countryPrefix}/locations`} className="mt-6 inline-flex items-center text-gold text-xs font-bold uppercase tracking-wider hover:text-white transition-colors group">
                All Locations <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Support & Trust */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-gold mb-8">Trust & Safety</h4>
              <ul className="space-y-4 mb-8">
                <li><Link to={`${countryPrefix}/vetting-process`} className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-block">Vetting Process</Link></li>
                <li><Link to={`${countryPrefix}/faq`} className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-block">Help Center</Link></li>
                <li><Link to={isUSDomain ? "/contact" : (isUS ? "/us/contact" : "/contact")} className="text-white/50 hover:text-white text-sm transition-all hover:translate-x-1 inline-block">Contact Support</Link></li>
              </ul>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Accredited By</p>
                <div className="flex flex-wrap gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                  {isUS ? (
                    <>
                      <div className="h-6 px-2 bg-white/10 rounded items-center flex text-[10px] font-bold border border-white/5">TSBPE</div>
                      <div className="h-6 px-2 bg-white/10 rounded items-center flex text-[10px] font-bold border border-white/5">TDLR</div>
                    </>
                  ) : (
                    <>
                      <div className="h-6 px-2 bg-white/10 rounded items-center flex text-[10px] font-bold border border-white/5">Gas Safe</div>
                      <div className="h-6 px-2 bg-white/10 rounded items-center flex text-[10px] font-bold border border-white/5">NICEIC</div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Contact</p>
                <Link
                  to={isUSDomain ? "/contact" : (isUS ? "/us/contact" : "/contact")}
                  className="flex items-center gap-2 text-white/50 hover:text-gold text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  Send Us a Message
                </Link>
                <p className="text-white/30 text-xs leading-relaxed max-w-[160px]">
                  {isUSDomain || isUS
                    ? 'Service areas across the United States'
                    : 'Serving properties across the United Kingdom'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} {siteName}.
            <span className="hidden md:inline mx-2">•</span>
            <br className="md:hidden" />
            Built with precision on <span className="text-white/50">Meridian OS</span>.
          </p>
          <div className="flex gap-8 text-xs font-medium text-white/40">
            <Link to={`${countryPrefix}/privacy`} className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to={`${countryPrefix}/terms`} className="hover:text-gold transition-colors">Terms of Service</Link>
            <Link to={`${countryPrefix}/sitemap`} className="hover:text-gold transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
