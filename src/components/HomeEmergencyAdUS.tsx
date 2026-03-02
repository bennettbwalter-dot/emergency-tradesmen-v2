import { useLocalization } from "@/contexts/LocalizationContext";
import { Link } from "react-router-dom";
import { USPremiumModelerDialog } from "./USPremiumModelerDialog";

export function HomeEmergencyAdUS() {
    const { settings } = useLocalization();

    // STRICT RULE: US Focus only.
    if (settings.countryCode !== 'US') {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto my-12 p-6 rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">

                {/* Affiliate Image & Link Wrapper */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <a
                        rel="sponsored"
                        href="https://homewarranty.com/affiliate-link-placeholder" // Needs actual US affiliate link later
                        target="_blank"
                        className="hover:opacity-90 transition-opacity block group relative"
                    >
                        <div className="relative">
                            <img
                                src="/affiliate/home-emergency-creative-us.jpg" // We might need a generic placeholder image here, falling back to same for now
                                onError={(e) => {
                                    // Fallback if US creative doesn't exist yet
                                    e.currentTarget.src = "/affiliate/home-emergency-creative.jpg"
                                }}
                                alt="Home Warranty Plan"
                                className="rounded-lg shadow-lg w-full max-w-[350px] object-cover border-4 border-white dark:border-slate-800"
                            />
                        </div>
                    </a>
                </div>

                {/* Copy & Compliance Text */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <h3 className="text-2xl font-display font-bold text-blue-950 dark:text-blue-50 mb-3">
                        Protect Your Home for Less
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Get comprehensive HVAC, plumbing, and electrical cover. Avoid unexpected repair bills with a <strong>Top Rated Home Warranty</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-6">
                        <a
                            href="https://homewarranty.com/affiliate-link-placeholder" // Needs actual US affiliate link later
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-lg shadow-blue-600/20"
                        >
                            View Cover Options
                        </a>
                        <USPremiumModelerDialog>
                            <button className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full border-2 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold transition-colors whitespace-nowrap">
                                2026 Modeler Tool
                            </button>
                        </USPremiumModelerDialog>
                    </div>

                    {/* US DISCLOSURE */}
                    <div className="text-[10px] text-muted-foreground/60 leading-tight border-t border-blue-200/50 pt-3">
                        <p>
                            Home Warranty terms and conditions apply. Coverage varies by state and plan selected.
                        </p>
                        <p className="mt-1">
                            *Exclusions apply: Pre-existing conditions and units beyond useful life may not be covered.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
