import { TradesmenScroll } from "@/components/animations/TradesmenScroll";
import { RoadsideScroll } from "@/components/animations/RoadsideScroll";

interface BreakdownSectionProps {
    compact?: boolean;
}

export function BreakdownSection({ compact = false }: BreakdownSectionProps) {
    return (
        <section className="py-12 md:py-16 bg-black relative z-20 w-full">
            <div className="container-wide flex flex-col gap-10 md:gap-14 px-4 md:px-0">
                {/* 1. Tradesmen Get Seen */}
                <div className="relative z-10 w-full flex justify-center">
                    <TradesmenScroll compact={compact} />
                </div>

                {/* 2. Roadside Help */}
                <div className="relative z-10 w-full flex justify-center">
                    <RoadsideScroll compact={compact} />
                </div>
            </div>
        </section>
    );
}
