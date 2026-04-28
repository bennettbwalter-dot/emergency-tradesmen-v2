import { SVGTrustBadges } from "../SVGTrustBadges";
import { SoloTradeSelector } from "@/components/SoloTradeSelector";

export function EmergencyServicesSection() {
    return (
        <section className="container-wide py-16 relative z-20 min-h-[800px]">
            <div className="text-center mb-10 md:mb-14">
                <div className="w-full max-w-5xl mx-auto px-4 animate-fade-up flex flex-col items-center py-0 overflow-visible group">
                    <SVGTrustBadges />
                </div>
            </div>

            <SoloTradeSelector />
        </section>
    );
}
