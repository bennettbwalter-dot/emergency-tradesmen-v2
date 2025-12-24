import { Link } from "react-router-dom";
import { Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/UserMenu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/et-logo-new.png" alt="Emergency Trades Logo" className="w-14 h-14 rounded-full object-cover border border-gold/50" />
            <div className="hidden sm:block">
              <span className="font-display text-2xl tracking-wide text-foreground">Emergency</span>
              <span className="font-display text-2xl tracking-wide text-gold">Trades</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">

            <Link to="/about" className="text-sm font-medium hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/blog" className="text-sm font-medium hover:text-gold transition-colors">
              Blog
            </Link>

            <Button variant="outline" size="sm" asChild className="border-gold text-gold hover:bg-gold/10 px-4 rounded-md">
              <Link to="/tradesmen">
                Tradesmen Sign Up
              </Link>
            </Button>
            <Link to="/contact" className="text-sm font-medium hover:text-gold transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <UserMenu />
            <ModeToggle />

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-gold/20">
                  <SheetTitle className="text-left font-display text-2xl mb-8">
                    <span className="text-foreground">Emergency</span>
                    <span className="text-gold">Trades</span>
                  </SheetTitle>
                  <nav className="flex flex-col gap-6">
                    <Link to="/about" className="text-lg font-medium hover:text-gold transition-colors block">
                      About
                    </Link>
                    <Link to="/blog" className="text-lg font-medium hover:text-gold transition-colors block">
                      Blog
                    </Link>
                    <Link to="/contact" className="text-lg font-medium hover:text-gold transition-colors block">
                      Contact
                    </Link>
                    <div className="h-px bg-border/50 my-2" />
                    <Button variant="outline" asChild className="border-gold text-gold hover:bg-gold/10 w-full justify-start text-lg h-12">
                      <Link to="/tradesmen">
                        Tradesmen Sign Up
                      </Link>
                    </Button>
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