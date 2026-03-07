import { cn } from "@/lib/utils";
import Squares from "@/components/ui/Squares";
import { useSimpleTheme } from "@/components/simple-theme";

interface CardContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContainer({ children, className }: CardContainerProps) {
    const { theme } = useSimpleTheme();

    return (
        <div className={cn("relative w-full max-w-[22rem] mx-auto font-sans p-1 sm:p-2", className)}>
            {/* === Main Card Background === */}
            {/* Detailed Glassmorphism & Texture Layer */}
            <div className="absolute inset-0 -z-10 rounded-[2rem] overflow-hidden
          bg-card/95 border border-white/20 dark:border-white/5 
          shadow-elevation-3 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]
          backdrop-blur-md transition-all duration-300
      ">
                {/* Background Patterns */}
                <div className="absolute inset-0 opacity-80 mix-blend-overlay">
                    <Squares
                        direction="diagonal"
                        speed={0.5}
                        squareSize={40}
                        borderColor={theme === 'light' ? "#e4e4e7" : "rgba(255,255,255,0.15)"}
                        hoverFillColor={theme === 'light' ? "#f4f4f5" : "#222222"}
                        lineThickness={theme === 'light' ? 0.5 : 1}
                        className="opacity-100"
                    />
                </div>

                {/* Ambient Glows (Dark Mode) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#0A0A0A] to-[#000000] opacity-90 hidden dark:block pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-gold/10 rounded-full blur-[80px] pointer-events-none hidden dark:block" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                {/* Noise Texture for 'Premium' feel */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.webp')] pointer-events-none mix-blend-soft-light" />
            </div>

            <div className="relative z-10 flex flex-col gap-3 p-4 pt-5">
                {children}
            </div>
        </div>
    );
}
