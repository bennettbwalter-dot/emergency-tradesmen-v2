import { Shield, Clock, BadgeCheck, Phone } from "lucide-react";

const badges = [
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round the clock emergency response",
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description: "Complete peace of mind guaranteed",
  },
  {
    icon: BadgeCheck,
    title: "Verified Pros",
    description: "All tradespeople vetted & certified",
  },
  {
    icon: Phone,
    title: "Fast Response",
    description: "Average arrival 30-60 minutes",
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {badges.map((badge, index) => (
        <div
          key={badge.title}
          className={`flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow animate-fade-up-delay-${Math.min(index, 3)}`}
        >
          <div className="w-14 h-14 rounded-full bg-trust-light flex items-center justify-center mb-4">
            <badge.icon className="w-7 h-7 text-trust" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">{badge.title}</h3>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
