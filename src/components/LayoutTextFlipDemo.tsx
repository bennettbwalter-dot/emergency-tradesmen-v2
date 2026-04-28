"use client";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { useLocalization } from "@/contexts/LocalizationContext";
import { motion } from "motion/react";

export function LayoutTextFlipDemo() {
    const { settings } = useLocalization();
    const primaryTrustText = settings.countryCode === "US"
        ? "VERIFIED CONTRACTORS"
        : "20,000+ VERIFIED TRADESMEN";

    return (
        <div>
            <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
                <LayoutTextFlip
                    words={[primaryTrustText, "FREE TO USE", "24/7 AVAILABILITY", "FAST RESPONSE"]}
                />
            </motion.div>
        </div>
    );
}
