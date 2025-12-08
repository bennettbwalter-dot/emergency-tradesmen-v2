import { Link } from "react-router-dom";
import { Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">ET</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground">Emergency</span>
              <span className="font-bold text-lg text-accent">Trades</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Open 24/7</span>
            </div>
            
            <Button variant="cta" size="lg" asChild>
              <a href="tel:08001234567" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">0800 123 4567</span>
                <span className="sm:hidden">Call Now</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
