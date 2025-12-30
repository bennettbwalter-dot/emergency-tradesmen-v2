import { Link } from "react-router-dom";
import { trades, cities } from "@/lib/trades";
import { Newsletter } from "./Newsletter";

export function Footer() {
  return (
    <footer className="bg-primary border-t border-border/50 pt-16 pb-24 md:pb-16 mt-16 text-white">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
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
              {trades.map((trade, idx) => {
                // Diversify the initial landing pages for crawlers
                const landingCities = ["london", "manchester", "birmingham", "leeds", "glasgow", "cardiff", "belfast"];
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
            <h4 className="font-display text-lg tracking-wide text-white mb-6">Trust & Safety</h4>
            <div className="space-y-4">
              <p className="text-white/60 text-sm leading-relaxed">
                All engineers are fully vetted, insured, and registered with relevant bodies:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded border border-white/5">GAS SAFE</span>
                <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded border border-white/5">NICEIC</span>
                <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded border border-white/5">CITY & GUILDS</span>
              </div>

              <div className="pt-4 border-t border-border/30">
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Support</p>
                <Link
                  to="/contact"
                  className="text-sm text-gold hover:text-gold-light transition-colors duration-300 flex items-center gap-1"
                >
                  24/7 Priority Support →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} EmergencyTrades. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-white/40 hover:text-gold text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/40 hover:text-gold text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/about" className="text-white/40 hover:text-gold text-sm transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}