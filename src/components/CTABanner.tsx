import { Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTABannerProps {
  trade: string;
  city: string;
}

export function CTABanner({ trade, city }: CTABannerProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium">Tradespeople available now</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
            Need an Emergency {trade} in {city}?
          </h2>
          <p className="text-primary-foreground/80 flex items-center justify-center md:justify-start gap-2">
            <Clock className="w-4 h-4" />
            Average response time: 30-60 minutes
          </p>
        </div>

        <Button variant="hero" asChild>
          <a href="tel:08001234567" className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            Call Now: 0800 123 4567
          </a>
        </Button>
      </div>
    </section>
  );
}
