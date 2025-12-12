import { Link } from "react-router-dom";
import { trades, cities } from "@/lib/trades";

export function Footer() {
  return (
    <footer className="bg-primary border-t border-border/50 pt-16 pb-24 md:pb-16 mt-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full border border-gold/50 flex items-center justify-center bg-gold/5">
                <span className="text-gold font-display text-xl font-semibold">ET</span>
              </div>
              <div>
                <span className="font-display text-xl tracking-wide text-foreground">Emergency</span>
                <span className="font-display text-xl tracking-wide text-gold">Trades</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connecting you with trusted local tradespeople for emergency repairs, 24 hours a day, 7 days a week.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-foreground mb-6">Our Services</h4>
            <ul className="space-y-3">
              {trades.map((trade) => (
                <li key={trade.slug}>
                  <Link
                    to={`/emergency-${trade.slug}/manchester`}
                    className="text-muted-foreground hover:text-gold text-sm transition-colors duration-300"
                  >
                    Emergency {trade.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-foreground mb-6">Popular Locations</h4>
            <ul className="space-y-3">
              {cities.slice(0, 6).map((city) => (
                <li key={city}>
                  <Link
                    to={`/emergency-plumber/${city.toLowerCase()}`}
                    className="text-muted-foreground hover:text-gold text-sm transition-colors duration-300"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wide text-foreground mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">24/7 Emergency Line</p>
                <a
                  href="tel:08001234567"
                  className="block font-display text-2xl text-gold hover:text-gold-light transition-colors duration-300 tracking-wide"
                >
                  0800 123 4567
                </a>
                <p className="text-muted-foreground text-sm mt-1">
                  Free to call from mobiles and landlines
                </p>
              </div>

              <div className="pt-4 border-t border-border/30">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Email Support</p>
                <a
                  href="mailto:emergencytradesmen@outlook.com"
                  className="text-sm text-gold hover:text-gold-light transition-colors duration-300"
                >
                  emergencytradesmen@outlook.com
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Trusted by thousands across the UK
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} EmergencyTrades. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-muted-foreground hover:text-gold text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-gold text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-gold text-sm transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}