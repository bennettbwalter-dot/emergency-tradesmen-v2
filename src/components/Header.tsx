import { Link } from "react-router-dom";
import { Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/UserMenu";
import { useComparison } from "@/contexts/ComparisonContext";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/et-logo.jpg" alt="Emergency Trades Logo" className="w-12 h-12 rounded-full object-cover border border-gold/50" />
            <div className="hidden sm:block">
              <span className="font-display text-2xl tracking-wide text-foreground">Emergency</span>
              <span className="font-display text-2xl tracking-wide text-gold">Trades</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">

            <Link to="/about" className="text-sm font-medium hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/tradesmen" className="text-sm font-medium hover:text-gold transition-colors">
              For Tradesmen
            </Link>
            <Link to="/compare" className="text-sm font-medium hover:text-gold transition-colors flex items-center gap-1">
              Compare
              <ComparisonBadge />
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="default" size="sm" asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/contact">
                Contact
              </Link>
            </Button>
            <UserMenu />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function ComparisonBadge() {
  const { items } = useComparison();
  if (items.length === 0) return null;

  return (
    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-gold/20 text-gold hover:bg-gold/30 ml-1">
      {items.length}
    </Badge>
  );
}