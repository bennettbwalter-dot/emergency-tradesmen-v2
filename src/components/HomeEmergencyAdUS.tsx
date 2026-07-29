import { useLocalization } from "@/contexts/LocalizationContext";
import { Link } from "react-router-dom";
import { USPremiumModelerDialog } from "./USPremiumModelerDialog";
import { AffiliateDisclosure } from "./AffiliateDisclosure";

// Set in env once a real US home-warranty affiliate deal exists.
// Without it the ad must NOT render  -  never ship a placeholder sponsored link.
const US_AFFILIATE_URL = import.meta.env.VITE_US_HOME_WARRANTY_AFF_URL as string | undefined;

export function HomeEmergencyAdUS() {
    const { settings } = useLocalization();

    // STRICT RULE: US Focus only.
    if (settings.countryCode !== 'US') {
        return null;
    }

    if (!US_AFFILIATE_URL) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto my-12 p-6 rounded-2xl border border-gold-dark/20 bg-gold/5 dark:bg-gold-dark/10 shadow-sm transition-all duration-300 hover:shadow-glow-gold-dark/10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Advertisement</p>
            <div className="flex flex-col md:flex-row items-center gap-8">

                {/* Affiliate Image & Link Wrapper */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <a
                        rel="sponsored"
                        href={US_AFFILIATE_URL}
                        target="_blank"
                        className="hover:opacity-90 transition-opacity block group relative"
                    >
                        <div className="relative">
                            <img
                                src="/affiliate/home-emergency-creative-us.webp" // We might need a generic placeholder image here, falling back to same for now
                                onError={(e) => {
                                    // Fallback if US creative doesn't exist yet
                                    e.currentTarget.src = "/affiliate/home-emergency-creative.webp"
                                }}
                                alt="Home Warranty Plan"
                                className="rounded-lg shadow-lg w-full max-w-[350px] object-cover border-4 border-white dark:border-slate-800"
                            />
                        </div>
                    </a>
                </div>

                {/* Copy & Compliance Text */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <h3 className="text-2xl font-display font-bold text-gold-dark dark:text-gold-light mb-3">
                        Protect Your Home for Less
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Get comprehensive HVAC, plumbing, and electrical cover. Avoid unexpected repair bills with a <strong>Home Warranty plan</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-6">
                        <a
                            href={US_AFFILIATE_URL}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full bg-gold-dark hover:bg-gold text-white font-bold transition-colors shadow-lg shadow-gold-dark/20"
                        >
                            View Cover Options
                        </a>
                        <USPremiumModelerDialog>
                            <button className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full border-2 border-gold-dark hover:bg-gold/5 dark:hover:bg-gold-dark/20 text-gold-dark dark:text-gold-light font-bold transition-colors whitespace-nowrap">
                                2026 Modeler Tool
                            </button>
                        </USPremiumModelerDialog>
                    </div>

                    {/* US DISCLOSURE */}
                    <div className="text-[10px] text-muted-foreground/60 leading-tight border-t border-gold-dark/20 pt-3">
                        <p>
                            Home Warranty terms and conditions apply. Coverage varies by state and plan selected.
                        </p>
                        <p className="mt-1">
                            *Exclusions apply: Pre-existing conditions and units beyond useful life may not be covered.
                        </p>
                        <AffiliateDisclosure className="mt-2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
