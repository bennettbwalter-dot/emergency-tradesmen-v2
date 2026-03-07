import { useLocalization } from "@/contexts/LocalizationContext";
import { Link } from "react-router-dom";
import { PremiumModelerDialog } from "./PremiumModelerDialog";

export function HomeEmergencyAdUK() {
    const { settings } = useLocalization();

    // STRICT RULE: UK Focus only.
    if (settings.countryCode !== 'GB') {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto my-12 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">

                {/* Affiliate Image & Link Wrapper - Using STRICT Awin Logic */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <a
                        rel="sponsored"
                        href="https://www.awin1.com/cread.php?s=3179410&v=31950&q=441083&r=2736972"
                        target="_blank"
                        className="hover:opacity-90 transition-opacity block group relative"
                    >
                        <div className="relative">
                            <img
                                src="/affiliate/home-emergency-creative.webp"
                                alt="Home Emergency Assist Cover"
                                className="rounded-lg shadow-lg w-full max-w-[350px] object-cover border-4 border-white dark:border-slate-800"
                            />
                            {/* Tracking Pixel - Invisible */}
                            <img
                                src="https://www.awin1.com/cshow.php?s=3179410&v=31950&q=441083&r=2736972"
                                alt=""
                                style={{ border: 0 }}
                                className="absolute top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none"
                            />
                        </div>
                    </a>
                </div>

                {/* Copy & Compliance Text */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <h3 className="text-2xl font-display font-bold text-emerald-950 dark:text-emerald-50 mb-3">
                        Protect Your Home for Less
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Get comprehensive boiler and central heating cover. Avoid unexpected repair bills with <strong>Home Emergency Assist</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-6">
                        <a
                            href="https://www.awin1.com/cread.php?s=3179410&v=31950&q=441083&r=2736972"
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-lg shadow-emerald-600/20"
                        >
                            View Cover Options
                        </a>
                        <PremiumModelerDialog>
                            <button className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-full border-2 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold transition-colors whitespace-nowrap">
                                2026 Modeler Tool
                            </button>
                        </PremiumModelerDialog>
                    </div>

                    {/* MANDATORY FCA DISCLOSURE */}
                    <div className="text-[10px] text-muted-foreground/60 leading-tight border-t border-emerald-200/50 pt-3">
                        <p>
                            Home Emergency Assist is an Appointed Representative of Insure Group Limited which is authorised and regulated by the Financial Conduct Authority (FRN: 584710).
                        </p>
                        <p className="mt-1">
                            *Exclusions apply: Boilers 15+ years and appliances 10+ years old are not covered.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
