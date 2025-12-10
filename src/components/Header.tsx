import { Link } from "react-router-dom";
import { Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full border border-gold/50 flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors">
              <span className="text-gold font-display text-xl font-semibold">ET</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-2xl tracking-wide text-foreground">Emergency</span>
              <span className="font-display text-2xl tracking-wide text-gold">Trades</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/emergency-electrician/all-locations" className="text-sm font-medium hover:text-gold transition-colors">
              Electrician
            </Link>
            <Link to="/emergency-plumber/all-locations" className="text-sm font-medium hover:text-gold transition-colors">
              Plumber
            </Link>
            <Link to="/locations" className="text-sm font-medium hover:text-gold transition-colors">
              Locations
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-gold transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-gold" />
              <span className="uppercase tracking-wider text-xs">Open 24/7</span>
            </div>

            <ModeToggle />

            <Button variant="luxury" size="lg" asChild>
              <a href="tel:08001234567" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">0800 123 4567</span>
                <span className="sm:hidden">Call</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}