import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap, Search, MapPin, LocateFixed, BadgeCheck, TrendingUp,
} from "lucide-react";

/**
 * Landing Page 3 — quick actions + business CTA band.
 * Theme-aware (uses the site's design tokens) so it adapts to dark/light mode.
 */

const cardReveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
};

export const Landing3Services = () => {
  return (
    <section className="relative bg-background py-20 text-foreground">
      <div className="mx-auto max-w-6xl px-6">
        {/* Quick actions */}
        <motion.div {...cardReveal} transition={{ duration: 0.7 }}>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-sky-500">Fast Routes To Help</p>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold">
              One problem.{" "}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                One search.
              </span>{" "}
              The right tradesperson.
            </h2>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              to: "#get-help", icon: Search, accent: "text-sky-500",
              title: "Search By Trade & Area",
              body: "Tell us what went wrong and where you are - we surface vetted local pros instantly.",
              cta: "Start a search",
              anchor: true,
            },
            {
              to: "/locations", icon: MapPin, accent: "text-amber-500",
              title: "Browse By Location",
              body: "Explore coverage city by city and find emergency help available in your area right now.",
              cta: "View locations",
            },
            {
              to: "#get-help", icon: LocateFixed, accent: "text-cyan-500",
              title: "Locate Me",
              body: "Use your device location to jump straight to tradespeople closest to your door.",
              cta: "Find help near me",
              anchor: true,
            },
          ].map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <>
                <Icon className={`h-7 w-7 ${c.accent}`} />
                <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                <span className={`mt-4 inline-block text-sm font-semibold ${c.accent} group-hover:underline`}>
                  {c.cta} &rarr;
                </span>
              </>
            );
            const className =
              "group block rounded-3xl border border-border bg-card/60 p-7 transition-all hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_14px_40px_rgba(56,150,255,0.14)]";
            return (
              <motion.div key={c.title} {...cardReveal} transition={{ duration: 0.7, delay: i * 0.1 }}>
                {c.anchor ? (
                  <a
                    href={c.to}
                    className={className}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("get-help")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link to={c.to} className={className}>{inner}</Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Business CTA band */}
        <motion.div {...cardReveal} transition={{ duration: 0.8 }}>
          <div className="relative mt-16 overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-r from-card via-background to-card p-8 md:p-12">
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-amber-500">For Tradespeople</p>
                <h3 className="mt-3 font-display text-2xl md:text-4xl font-bold">
                  Your next emergency call-out is searching for you.
                </h3>
                <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    Claim your listing and stand out with a verified profile
                  </li>
                  <li className="flex items-start gap-2.5">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    Paid listings rank higher, show photos, reviews and instant contact
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    Get found at the exact moment customers urgently need you
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-stretch gap-4 md:items-end">
                <Link
                  to="/pricing"
                  className="rounded-full bg-gradient-to-r from-amber-400 to-amber-300 px-8 py-4 text-center text-base font-bold text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.35)] transition-transform hover:scale-105"
                >
                  Claim Your Trade
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-full border border-border px-8 py-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-foreground/5"
                >
                  See listing benefits
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Landing3Services;
