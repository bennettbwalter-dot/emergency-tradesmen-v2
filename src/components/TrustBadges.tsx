import { Shield, Clock, BadgeCheck, Phone } from "lucide-react";

const badges = [
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round the clock service",
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description: "Complete peace of mind",
  },
  {
    icon: BadgeCheck,
    title: "Verified Pros",
    description: "Vetted & certified experts",
  },
  {
    icon: Phone,
    title: "Fast Response",
    description: "30-90 minute arrival",
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="group relative flex flex-row md:flex-col items-center gap-2.5 md:gap-0 md:justify-center px-3 py-3 md:p-5 rounded-xl md:rounded-2xl bg-card/40 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-card/60"
        >
          {/* Icon — compact on mobile, larger on desktop */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 md:w-11 md:h-11 md:mb-3 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/10 transition-all duration-300">
              <badge.icon className="w-4 h-4 md:w-5 md:h-5 text-gold" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text — left-aligned on mobile, centered on desktop */}
          <div className="min-w-0 md:text-center">
            <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight">{badge.title}</h3>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium opacity-80 leading-tight mt-0.5">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}