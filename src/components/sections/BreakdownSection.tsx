import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RoadsideScroll } from "@/components/animations/RoadsideScroll";
import { TradesmenScroll } from "@/components/animations/TradesmenScroll";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function BreakdownSection() {
    const { settings } = useLocalization();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Refs for pinning
    const roadsideContainerRef = useRef<HTMLDivElement>(null);
    const tradesmenContainerRef = useRef<HTMLDivElement>(null);
    const roadsideTitleRef = useRef<HTMLDivElement>(null);
    const tradesmenTitleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="bg-black relative">
            {/* 1 & 2. Roadside Group */}
            <div className="relative z-10">
                {/* Dedicated Intro Section - Sticky on Mobile */}
                <div ref={roadsideTitleRef} className="w-full bg-black sticky top-0 z-[9999] md:relative md:z-[150]">
                    <section className="w-full flex items-center justify-center pt-12 pb-4 md:py-20 overflow-hidden bg-black">
                        <div className="w-full px-4 md:px-0">
                            <h1 className="font-sans font-[900] text-[15.5vw] md:text-[18vw] lg:text-[16rem] text-white leading-none md:leading-[0.8] tracking-tighter md:tracking-[-0.04em] uppercase text-left w-full">
                                <span className="block whitespace-nowrap">RAPID</span>
                                <span className="block whitespace-nowrap">RESISTANCE</span>
                            </h1>
                        </div>
                    </section>
                </div>

                {/* Roadside Sequence */}
                <div ref={roadsideContainerRef} className="relative z-0">
                    <RoadsideScroll />
                </div>
            </div>

            {/* Spacer to detach Roadside from Tradesmen section */}
            <div className="w-full h-32 md:h-64 bg-black relative z-10" />

            {/* 3.5 & 4. Tradesmen Group */}
            <div className="relative z-10">
                {/* Tradesmen Mobile Intro - Sticky on Mobile */}
                <div ref={tradesmenTitleRef} className="w-full md:hidden bg-black sticky top-0 z-[9999]">
                    <section className="w-full flex items-center justify-center pt-12 overflow-hidden bg-black">
                        <div className="w-full px-4">
                            <h2 className="font-sans font-[900] text-[15.5vw] text-white leading-none tracking-tighter uppercase text-left w-full">
                                <span className="block whitespace-nowrap">FOR</span>
                                <span className="block whitespace-nowrap">TRADESMEN</span>
                            </h2>
                        </div>
                    </section>
                </div>

                {/* Tradesmen Experience */}
                <div ref={tradesmenContainerRef} className="relative z-0">
                    <TradesmenScroll />
                </div>
            </div>
        </div>
    );
}
