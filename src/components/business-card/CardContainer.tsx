import { cn } from "@/lib/utils";
import Squares from "@/components/ui/Squares";
import { useSimpleTheme } from "@/components/simple-theme";

interface CardContainerProps {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    backgroundImage?: string;
}

export function CardContainer({ children, className, contentClassName, backgroundImage }: CardContainerProps) {
    const { theme } = useSimpleTheme();

    return (
        <div className={cn("relative w-full max-w-[85vw] sm:max-w-[20rem] md:max-w-[22rem] mx-auto font-sans p-1 sm:p-2", className)}>
            {/* === Main Card Background === */}
            {/* Detailed Glassmorphism & Texture Layer */}
            <div className={cn(
                "absolute inset-0 -z-10 rounded-[2rem] overflow-hidden border transition-all duration-300 bg-transparent border-none shadow-none"
            )}>
                <div
                    className="absolute inset-[3px] bg-center z-[-1] rounded-[1.8rem]"
                    style={{
                        backgroundImage: `url(${backgroundImage || "/images/ui/parchment-provided.jpg"})`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        filter: 'brightness(1.2) contrast(0.9) saturate(0.8)'
                    }}
                />

                {/* Noise Texture for 'Premium' feel — self-hosted (external transparenttextures.com URL was blocked by ORB) */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/images/ui/stardust.png')] pointer-events-none mix-blend-soft-light" />
            </div>

            <div className={cn("relative z-10 flex flex-col gap-3 px-6 pt-5 pb-4", contentClassName)}>
                {children}
            </div>
        </div>
    );
}
