import { Link } from "react-router-dom";
import { trades, cities } from "@/lib/trades";
import { Newsletter } from "./Newsletter";

export function Footer() {
  return (
    <footer className="bg-primary border-t border-border/50 pt-16 pb-12 mt-16 text-white">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src="/et-logo-v2.png" alt="Emergency Trades Logo" className="w-12 h-12 rounded-full object-cover border border-gold/50" />
              <div>
                <span className="font-display text-xl tracking-wide text-white">Emergency</span>
                <span className="font-display text-xl tracking-wide text-gold">Trades</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Connecting you with trusted local tradespeople for emergency repairs, 24 hours a day, 7 days a week.
            </p>
            <Newsletter />
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-white mb-6">Our Services</h4>
            <ul className="space-y-3">
              {trades.slice(0, 6).map((trade, idx) => {
                const landingCities = ["london", "manchester", "birmingham", "leeds", "glasgow", "cardiff"];
                const city = landingCities[idx % landingCities.length];
                return (
                  <li key={trade.slug}>
                    <Link
                      to={`/emergency-${trade.slug}/${city}`}
                      className="text-white/60 hover:text-gold text-sm transition-colors duration-300"
                    >
                      Emergency {trade.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-white mb-6">Popular Locations</h4>
            <ul className="space-y-3">
              {["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield"].map((city) => (
                <li key={city}>
                  <Link
                    to={`/emergency-plumber/${city.toLowerCase()}`}
                    className="text-white/60 hover:text-gold text-sm transition-colors duration-300"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-white mb-6">Trust & Support</h4>
            <div className="space-y-4">
              <ul className="space-y-3">
                <li><Link to="/vetting-process" className="text-white/60 hover:text-gold text-sm transition-colors">Vetting Process</Link></li>
                <li><Link to="/faq" className="text-white/60 hover:text-gold text-sm transition-colors">Trust & Safety</Link></li>
                <li><Link to="/contact" className="text-white/60 hover:text-gold text-sm transition-colors">Contact Support</Link></li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-4">
                <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">Gas Safe</span>
                <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">NICEIC</span>
                <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter">City & Guilds</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} EmergencyTrades.net. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-white/40 hover:text-gold text-sm transition-colors">Privacy</Link>
            <Link to="/terms" className="text-white/40 hover:text-gold text-sm transition-colors">Terms</Link>
            <Link to="/about" className="text-white/40 hover:text-gold text-sm transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}