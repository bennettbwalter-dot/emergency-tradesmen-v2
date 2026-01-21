"use client";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { motion } from "motion/react";

export function LayoutTextFlipDemo() {
    return (
        <div>
            <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
                <LayoutTextFlip
                    text="Our Local Tradesmen Are"
                    words={["24/7 Availability Round the clock service", "Verified Pros Vetted & certified experts", "Fast Response 30-120 minute arrival", "Fully Insured Complete peace of mind"]}
                />
            </motion.div>
        </div>
    );
}
