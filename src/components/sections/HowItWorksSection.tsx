import { Search, PhoneCall, HeartHandshake } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { cn } from "@/lib/utils";

interface HowItWorksSectionProps {
  variant?: "default" | "spine";
}

export const HowItWorksSection = ({ variant = "default" }: HowItWorksSectionProps) => {
  const { settings } = useLocalization();
  const listingTerm = settings.countryCode === 'US' ? 'contractor' : 'tradesmen';
  const contactTerm = settings.countryCode === 'US' ? 'contractor' : 'tradesman';
  const isSpine = variant === "spine";

  const steps = [
    {
      icon: Search,
      title: "1. Find Your Local Expert",
      description: `Select your service and city to view public ${listingTerm} listings operating in your area right now.`
    },
    {
      icon: PhoneCall,
      title: "2. Contact Directly",
      description: `No middlemen, no hidden fees. Call, WhatsApp, or email the ${contactTerm} directly to explain your emergency and get an immediate ETA.`
    },
    {
      icon: HeartHandshake,
      title: "3. Problem Solved",
      description: "Your local expert arrives, provides a clear quote, and resolves the emergency safely and professionally."
    }
  ];

  return (
    <section className={cn("py-16 md:py-24 bg-secondary/20 relative overflow-hidden", isSpine && "landing-how-spine")}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-gold/5 to-transparent pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gold mb-3">How It Works</h2>
          <h3 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Emergency Help in 3 Simple Steps
          </h3>
          <p className="text-lg text-muted-foreground">
            We connect you directly with the best local professionals. Fast, transparent, and completely free to use.
          </p>
        </div>

        <div className={cn("relative", isSpine ? "landing-how-spine-grid" : "grid md:grid-cols-3 gap-8 lg:gap-12")}>
          {/* Connecting line for desktop */}
          {!isSpine && (
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
          )}

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className={cn("flex flex-col items-center text-center relative group", isSpine && "landing-how-spine-step")}>
                {isSpine && <span className="landing-how-spine-node" aria-hidden="true" />}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-card border-2 border-border flex items-center justify-center mb-6 shadow-sm group-hover:border-gold/50 group-hover:shadow-gold/10 group-hover:-translate-y-1 transition-all duration-300">
                  <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-gold opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3">{step.title}</h4>
                <p className="text-muted-foreground leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
