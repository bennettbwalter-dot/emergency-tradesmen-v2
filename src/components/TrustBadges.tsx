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
    description: "30-60 minute arrival",
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {badges.map((badge, index) => (
        <div
          key={badge.title}
          className="group relative flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border/50 hover:border-gold/30 transition-all duration-300"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-lg bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mb-4 group-hover:border-gold/50 transition-colors">
              <badge.icon className="w-7 h-7 text-gold" />
            </div>
            <h3 className="font-display text-lg text-foreground mb-1">{badge.title}</h3>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}