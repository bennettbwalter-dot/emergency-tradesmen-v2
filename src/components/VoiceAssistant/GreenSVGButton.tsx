import React, { forwardRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '@/lib/audioService';
import { useTheme } from '@/components/theme-provider';

interface GreenSVGButtonProps {
    index?: number;
    onClick?: () => void;
    disabled?: boolean;
    dataTour?: string;
    ariaLabel?: string;
}

export const GreenSVGButton = forwardRef<HTMLButtonElement, GreenSVGButtonProps>(({ 
    index = 0, 
    onClick, 
    disabled,
    dataTour,
    ariaLabel = "Choose location"
}, ref) => {
    const { theme } = useTheme();
    const [isFlashing, setIsFlashing] = useState(false);

    // Detect dark mode
    const isDarkMode = useMemo(() => {
        if (theme === 'dark') return true;
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }, [theme]);

    const handlePress = () => {
        if (!disabled) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 300);
            audioService.playClick(2); // Location variant
            onClick?.();
        }
    };

    return (
        <motion.button 
            ref={ref}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
            transition={{ 
                delay: index * 0.1, 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
            }}
            className={`flex items-center justify-center p-0 border-none bg-transparent cursor-pointer w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handlePress}
            disabled={disabled}
            data-tour={dataTour}
            aria-label={ariaLabel}
        >
            {/* Click Flash Effect */}
            <AnimatePresence>
                {isFlashing && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full blur-xl z-10 bg-[hsl(var(--location-pulse))]"
                    />
                )}
            </AnimatePresence>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 256 256" className="w-full h-full">
                {/* SVG created with Arrow, by QuiverAI (https://quiver.ai) - Modified for Green color scheme with Pin Icon */}
                  <path d="m12 126.9 0.11 5.88c0.57 27.35 22.05 50.55 55.66 50.58h120.1c32.01-0.03 57.37-20.66 57.37-49.66v-9.92l-233.2 3.12z" fill="url(#paint0_radial_green)"/>
                  <path d="m12.38 124c0 26.94 21.88 46.79 56.05 48.01l11.39 0.39h103l9.14-0.66c29.99-2.3 53.17-21.65 53.17-46.99 0-11.54-3.19-20.8-6.41-26.61l-219.8-0.7c-3.98 7.53-6.52 16.22-6.52 26.56z" fill="url(#paint1_linear_green)"/>
                  <path d="m14.91 121.1c0 26 21.18 44.7 54.01 45.86l10.9 0.37h103.5l8.75-0.63c28.71-2.19 50.96-20.5 50.96-44.45 0-10.95-2.41-18.65-5.49-24.16l-218.8-0.69c-2.28 6.45-3.85 13.55-3.85 23.7z" fill="url(#paint2_linear_green)"/>
                  <path d="m17.79 86.82v30.8c0 25.4 20.43 43.67 50.86 43.67h118.5c29.02 0 51.6-20.08 51.6-46.28v-29.9c0-27.03-22.58-45.92-51.99-45.92h-115.3c-29.81 0-53.63 17.88-53.63 47.63z" fill="url(#paint3_linear_green)"/>
                  <path d="m21.48 86.12c0 24.99 20.68 44.41 51.21 44.41h113.1c29.62 0 51.92-18.56 51.92-44.1 0-26.41-20.88-45.95-50.7-45.95h-113.8c-29.51 0-51.74 17.2-51.74 45.64z" fill="url(#paint4_linear_green)"/>
                  <path d="m22.98 85.11c0 24.41 19.71 42.77 49.71 42.77h112.5c28.82 0 49.73-17.9 49.73-42.57 0-25.29-20.11-43.6-48.51-43.6h-112.8c-28.91 0-50.64 16.1-50.64 43.4z" fill="url(#paint5_linear_green)"/>
                  <path d="m12.81 122.2c0 24.85 20.58 44.98 53.31 46.42l11.5 0.48h106.4l8.74-0.8c28.72-2.7 51.47-21 51.47-43.59l-0.41-8.7-1.9 0.09c-0.29 23.6-19.7 43.61-50.25 46.21l-9.45 0.4h-107l-9.45-0.4c-30.14-2.1-50.36-19.31-50.36-44.7l-0.2-13.51-2.4 8v10.1z" fill="url(#paint6_linear_green)" opacity=".6"/>
                  <path d="m84.11 162.7 2.1-1h2.7l0.8 1v11.1l-1.6 1-2.4-1-1.6-1v-10.1z" fill="url(#paint7_linear_green)"/>
                  <path d="m169.1 162.7 2.1-1 2.2 0.6v11.5l-2.2 1-2.4-2-0.3-2 0.6-8.1z" fill="url(#paint8_linear_green)"/>
                  <path d="m89.71 162.7 78.89-0.5v3.6l-78.89 1.4v-4.5z" fill="url(#paint9_linear_green)"/>
                  <path d="m89.71 170.7 78.89-1.5v3.6l-2.5 1-74.89 0.5-1.5-1v-2.6z" fill="url(#paint10_linear_green)"/>
                  <path d="m86.06 167.6 1.95 0.5v4.1l-1.95 0.5-0.65-1.5v-2.6l0.65-1z" fill="url(#paint11_linear_green)"/>
                  <path d="m170.9 167.6 1.5 1v3.6l-1.5 1-1.5-2v-2.6l1.5-1z" fill="url(#paint12_linear_green)"/>
                  
                  {/* Pin/Location Icon from provided SVG - Positioned and scaled for parity */}
                  <g transform="translate(0, -15)">
                    <path d="m127.8 60.29c-15.39 0-26.75 13.69-26.75 28.23s26.12 49.96 26.75 49.96c0.62 0 25.55-32.27 25.55-49.96 0-13.54-11.05-28.23-25.55-28.23zm-0.15 40.32c-8.82 0-14.09-7.09-14.09-13.63 0-8.18 6.39-14.57 14.09-14.57 8.45 0 13.23 7.48 13.23 14.61 0 7.84-6.43 13.59-13.23 13.59z" fill="url(#paint10_linear_pin_green)"/>
                  </g>

                  <defs>
                    <radialGradient id="paint0_radial_green" cx="0" cy="0" r="1" gradientTransform="translate(128.6 151.2) scale(143.6 53.08)" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(var(--location-main))" offset="0"/>
                      <stop stopColor="#5D5D5D" offset=".6901"/>
                      <stop stopColor="#343434" offset="1"/>
                    </radialGradient>
                    <linearGradient id="paint1_linear_green" x1="128.8" x2="128.8" y1="97.41" y2="172.4" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9B9591" offset="0"/>
                      <stop stopColor="#B5B3B7" offset=".5763"/>
                      <stop stopColor="#625D5C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear_green" x1="129" x2="129" y1="97.41" y2="167.3" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#87827F" offset="0"/>
                      <stop stopColor="#B0ACA8" offset=".5763"/>
                      <stop stopColor="#66615E" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint3_linear_green" x1="128.2" x2="128.2" y1="39.19" y2="161.3" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(var(--location-gradient-1))" offset="0"/>
                      <stop stopColor="hsl(var(--location-gradient-2))" offset=".4604"/>
                      <stop stopColor="hsl(var(--location-gradient-3))" offset=".7859"/>
                      <stop stopColor="hsl(var(--location-gradient-5))" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint4_linear_green" x1="129.6" x2="129.6" y1="40.48" y2="130.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(var(--location-gradient-2))" offset="0"/>
                      <stop stopColor="hsl(var(--location-gradient-3))" offset=".5104"/>
                      <stop stopColor="hsl(var(--location-gradient-3))" offset=".775"/>
                      <stop stopColor="hsl(var(--location-gradient-4))" offset=".991"/>
                      <stop stopColor="hsl(var(--location-gradient-5))" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint5_linear_green" x1="128.9" x2="128.9" y1="41.71" y2="127.9" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(var(--location-gradient-2))" offset="0"/>
                      <stop stopColor="hsl(var(--location-gradient-3))" offset=".5104"/>
                      <stop stopColor="hsl(var(--location-gradient-3))" offset=".775"/>
                      <stop stopColor="hsl(var(--location-gradient-4))" offset=".991"/>
                      <stop stopColor="hsl(var(--location-gradient-5))" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint6_linear_green" x1="128.5" x2="128.5" y1="104.1" y2="169.2" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#928B87" offset="0"/>
                      <stop stopColor="#B8B5B8" offset=".5763"/>
                      <stop stopColor="#847E7C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint7_linear_green" x1="86.91" x2="86.91" y1="161.7" y2="174.8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#504A4A" offset="0"/>
                      <stop stopColor="#B5B3B7" offset=".5763"/>
                      <stop stopColor="#625D5C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint8_linear_green" x1="171" x2="171" y1="161.7" y2="174.8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#504A4A" offset="0"/>
                      <stop stopColor="#B5B3B7" offset=".5763"/>
                      <stop stopColor="#625D5C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint9_linear_green" x1="129.2" x2="129.2" y1="162.1" y2="167.3" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#989492" offset="0"/>
                      <stop stopColor="#DEDEE1" offset=".5763"/>
                      <stop stopColor="#94918F" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint10_linear_green" x1="129.2" x2="129.2" y1="169.1" y2="174.4" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#989492" offset="0"/>
                      <stop stopColor="#FEFFFF" offset=".5763"/>
                      <stop stopColor="#CCCDCE" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint11_linear_green" x1="86.71" x2="86.71" y1="167.6" y2="172.7" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#989492" offset="0"/>
                      <stop stopColor="#FEFFFF" offset=".5763"/>
                      <stop stopColor="#CCCDCE" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint12_linear_green" x1="170.9" x2="170.9" y1="167.6" y2="173.2" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#989492" offset="0"/>
                      <stop stopColor="#FEFFFF" offset=".5763"/>
                      <stop stopColor="#CCCDCE" offset="1"/>
                    </linearGradient>

                    <linearGradient id="paint10_linear_pin_green" x1="101" x2="153.3" y1="99.38" y2="99.38" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#575252" offset="0"/>
                        <stop stopColor="#E0DDDF" offset=".51"/>
                        <stop stopColor="#565151" offset="1"/>
                    </linearGradient>
                  </defs>
                </svg>
            </div>
        </motion.button>
    );
});

GreenSVGButton.displayName = "GreenSVGButton";
