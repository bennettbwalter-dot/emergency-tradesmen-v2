import { Link } from "react-router-dom";
import { trades, cities } from "@/lib/trades";
import { Newsletter } from "./Newsletter";
import { GlassSocialIcon } from "./ui/GlassSocialIcon";
import { useLocalization } from "@/contexts/LocalizationContext";

export interface FooterProps {
  countryCode?: string;
}

export function Footer({ countryCode }: FooterProps) {
  const { settings: globalSettings } = useLocalization();

  // STRICT OVERRIDE: If countryCode is passed, we construct a local settings object to force the view
  const activeCountry = countryCode || globalSettings.countryCode;

  // We can mock the settings object if we don't want to import the strict type, 
  // or just use countryCode directly for logic.
  const isUS = activeCountry === 'US';

  const countryPrefix = isUS ? '/us' : '';
  const usCities = ["Los Angeles", "New York", "Dallas", "Houston", "Miami", "Phoenix", "Seattle", "San Francisco", "San Antonio"];
  const displayCities = isUS ? usCities : ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield"];
  const tradeTerm = isUS ? "Contractor" : "Tradesperson";

  return (
    <footer className="bg-primary border-t border-border/50 pt-16 pb-28 md:pb-12 mt-16 text-white">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Link to={`${countryPrefix}/`} className="flex items-center gap-3">
                <img src="/et-logo-v2.png" alt="Emergency Trades Logo" className="w-12 h-12 rounded-full object-cover border border-gold/50" />
                <div>
                  <span className="font-display text-xl tracking-wide text-white">Emergency</span>
                  <span className="font-display text-xl tracking-wide text-gold">Tradesmen</span>
                </div>
              </Link>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Connecting you with trusted local {tradeTerm.toLowerCase()} for emergency repairs, 24 hours a day, 7 days a week.
            </p>

            <div className="flex gap-4 mb-6">
              <GlassSocialIcon platform="facebook" href="https://www.facebook.com/profile.php?id=61588024972553" />
              <GlassSocialIcon platform="instagram" href="https://www.instagram.com/emergencytradesmen/" />
              <GlassSocialIcon platform="twitter" href="https://x.com/etemergenc26245" />
              <GlassSocialIcon platform="tiktok" href="https://www.tiktok.com/@emergencytradesmen" />
            </div>

            <Newsletter />
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-white mb-6">Our Services</h4>
            <ul className="space-y-3">
              {trades.slice(0, 6).map((trade, idx) => {
                const landingCities = isUS ? ["los-angeles", "new-york", "dallas", "miami", "phoenix", "seattle", "detroit"] : ["london", "manchester", "birmingham", "leeds", "glasgow", "cardiff"];
                const city = landingCities[idx % landingCities.length];
                const tradeName = isUS ? (trade as any).usName : trade.name;
                return (
                  <li key={trade.slug}>
                    <Link
                      to={`${countryPrefix}/emergency-${trade.slug}/${city}`}
                      className="text-white/60 hover:text-gold text-sm transition-colors duration-300"
                    >
                      Emergency {tradeName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-white mb-6">Popular Locations</h4>
            <ul className="space-y-3">
              {displayCities.map((city) => (
                <li key={city}>
                  <Link
                    to={`${countryPrefix}/emergency-plumber/${city.toLowerCase().replace(/ /g, '-')}`}
                    className="text-white/60 hover:text-gold text-sm transition-colors duration-300"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link to={`${countryPrefix}/`} className="text-gold hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
                {tradeTerm} Near Me &rarr;
              </Link>
              <Link to={`${countryPrefix}/locations`} className="text-white/40 hover:text-gold text-xs transition-colors flex items-center gap-2">
                View All Areas
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-white mb-6">Trust & Support</h4>
            <div className="space-y-4">
              <ul className="space-y-3">
                <li><Link to={`${countryPrefix}/vetting-process`} className="text-white/60 hover:text-gold text-sm transition-colors">Vetting Process</Link></li>
                <li><Link to={`${countryPrefix}/faq`} className="text-white/60 hover:text-gold text-sm transition-colors">Trust & Safety</Link></li>
                <li><Link to={`${countryPrefix}/contact`} className="text-white/60 hover:text-gold text-sm transition-colors">Contact Support</Link></li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-4">
                {isUS ? (
                  <>
                    <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">TSBPE Licensed</span>
                    <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">TDLR Certified</span>
                    <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">ALOA Member</span>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">Gas Safe</span>
                    <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">NICEIC</span>
                    <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">City & Guilds</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} EmergencyTradesmen.net. All rights reserved. <span className="opacity-50 text-[10px] ml-2">v2.1.8</span>
          </p>
          <div className="flex items-center gap-6">
            <Link to={`${countryPrefix}/privacy`} className="text-white/40 hover:text-gold text-sm transition-colors">Privacy</Link>
            <Link to={`${countryPrefix}/terms`} className="text-white/40 hover:text-gold text-sm transition-colors">Terms</Link>
            <Link to={`${countryPrefix}/about`} className="text-white/40 hover:text-gold text-sm transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer >
  );
}