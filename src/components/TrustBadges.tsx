import { Shield, Clock, BadgeCheck, Phone } from "lucide-react";

const badges = [
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round the clock service",
  },
  {
    icon: Shield,
    title: "Check Details",
    description: "Confirm before booking",
  },
  {
    icon: BadgeCheck,
    title: "Public Listings",
    description: "Business details may change",
  },
  {
    icon: Phone,
    title: "Fast Response",
    description: "30-90 minute arrival",
  },
];

export function TrustBadges() {
  return (
    <div data-tour="tour-trust-badges" className="grid grid-cols-4 gap-1.5 md:gap-4">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="group relative flex flex-col items-center justify-center gap-1 md:gap-0 px-1 py-2.5 md:p-6 rounded-xl md:rounded-2xl bg-card/30 border border-white/5 backdrop-blur-md transition-all duration-500 hover:border-gold/40 hover:bg-gold/[0.03] hover:-translate-y-1 shadow-sm hover:shadow-gold/5"
        >
          {/* Subtle reflection effect */}
          <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Icon — compact on mobile, larger on desktop */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 md:w-14 md:h-14 md:mb-4 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/40 transition-all duration-500 group-hover:scale-110">
              <badge.icon className="w-4 h-4 md:w-6 md:h-6 text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" strokeWidth={1.5} />
            </div>

            {/* Particle glow */}
            <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>

          {/* Text — centered for all sizes to fit 4-in-a-row */}
          <div className="text-center relative z-10 w-full px-0.5">
            <h3 className="font-display font-bold text-[9px] sm:text-[10px] md:text-lg text-foreground leading-[1.1] tracking-tight group-hover:text-gold transition-colors">{badge.title}</h3>
            <p className="hidden md:block text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-semibold opacity-70 leading-tight mt-1 group-hover:opacity-100 transition-all">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
