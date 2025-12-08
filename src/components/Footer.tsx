import { Link } from "react-router-dom";
import { trades, cities } from "@/lib/trades";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <span className="font-bold text-lg">ET</span>
              </div>
              <div>
                <span className="font-bold text-lg">Emergency</span>
                <span className="font-bold text-lg text-accent">Trades</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Connecting you with trusted local tradespeople for emergency repairs, 24 hours a day, 7 days a week.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              {trades.map((trade) => (
                <li key={trade.slug}>
                  <Link 
                    to={`/emergency-${trade.slug}/manchester`}
                    className="text-primary-foreground/70 hover:text-accent text-sm transition-colors"
                  >
                    Emergency {trade.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Popular Locations</h4>
            <ul className="space-y-2">
              {cities.slice(0, 6).map((city) => (
                <li key={city}>
                  <Link 
                    to={`/emergency-plumber/${city.toLowerCase()}`}
                    className="text-primary-foreground/70 hover:text-accent text-sm transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">24/7 Emergency Line</h4>
            <a 
              href="tel:08001234567" 
              className="text-2xl font-bold text-accent hover:text-accent/90 transition-colors"
            >
              0800 123 4567
            </a>
            <p className="text-primary-foreground/70 text-sm mt-2">
              Free to call from mobiles and landlines
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-primary-foreground/50 text-sm">
          <p>&copy; {new Date().getFullYear()} EmergencyTrades. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
