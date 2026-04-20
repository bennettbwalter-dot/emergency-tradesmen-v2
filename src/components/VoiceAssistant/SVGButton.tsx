import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { audioService } from '@/lib/audioService';

interface SVGButtonProps {
    index?: number;
    onClick?: () => void;
    disabled?: boolean;
    isRecording?: boolean;
    isTranscriptionProcessing?: boolean;
    dataTour?: string;
}

export const SVGButton = ({ 
    index = 0, 
    onClick, 
    disabled, 
    isRecording, 
    isTranscriptionProcessing,
    dataTour
}: SVGButtonProps) => {
    const [isFlashing, setIsFlashing] = useState(false);

    const handlePress = () => {
        if (!disabled) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 300);
            audioService.playClick(0); // Microphone variant
            onClick?.();
        }
    };

    return (
        <motion.button 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
                delay: index * 0.1, 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
            }}
            whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
            className={`flex items-center justify-center p-0 border-none bg-transparent cursor-pointer w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handlePress}
            disabled={disabled}
            data-tour={dataTour}
            aria-label="Action Button"
        >
            {/* Recording Pulse Effect */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 0.3 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 1.5,
                            ease: "easeOut"
                        }}
                        className="absolute inset-0 bg-[hsl(var(--mic-pulse))] rounded-full blur-xl z-0"
                    />
                )}
            </AnimatePresence>

            {/* Click Flash Effect */}
            <AnimatePresence>
                {isFlashing && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 bg-[hsl(var(--mic-pulse))] rounded-full blur-xl z-10"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 256 256" className="w-full h-full">
                {/* SVG created with Arrow, by QuiverAI (https://quiver.ai) */}
                  <path d="m12 126.9 0.11 5.88c0.57 27.35 22.05 50.55 55.66 50.58h120.1c32.01-0.03 57.37-20.66 57.37-49.66v-9.92l-233.2 3.12z" fill="url(#paint0_radial_mic)"/>
                  <path d="m12.38 124c0 26.94 21.88 46.79 56.05 48.01l11.39 0.39h103l9.14-0.66c29.99-2.3 53.17-21.65 53.17-46.99 0-11.54-3.19-20.8-6.41-26.61l-219.8-0.7c-3.98 7.53-6.52 16.22-6.52 26.56z" fill="url(#paint1_linear_mic)"/>
                  <path d="m14.91 121.1c0 26 21.18 44.7 54.01 45.86l10.9 0.37h103.5l8.75-0.63c28.71-2.19 50.96-20.5 50.96-44.45 0-10.95-2.41-18.65-5.49-24.16l-218.8-0.69c-2.28 6.45-3.85 13.55-3.85 23.7z" fill="url(#paint2_linear_mic)"/>
                  <path d="m17.79 86.82v30.8c0 25.4 20.43 43.67 50.86 43.67h118.5c29.02 0 51.6-20.08 51.6-46.28v-29.9c0-27.03-22.58-45.92-51.99-45.92h-115.3c-29.81 0-53.63 17.88-53.63 47.63z" fill="url(#paint3_linear_mic)"/>
                  <path d="m21.48 86.12c0 24.99 20.68 44.41 51.21 44.41h113.1c29.62 0 51.92-18.56 51.92-44.1 0-26.41-20.88-45.95-50.7-45.95h-113.8c-29.51 0-51.74 17.2-51.74 45.64z" fill="url(#paint4_linear_mic)"/>
                  <path d="m22.98 85.11c0 24.41 19.71 42.77 49.71 42.77h112.5c28.82 0 49.73-17.9 49.73-42.57 0-25.29-20.11-43.6-48.51-43.6h-112.8c-28.91 0-50.64 16.1-50.64 43.4z" fill="url(#paint5_linear_mic)"/>
                  <path d="m12.81 122.2c0 24.85 20.58 44.98 53.31 46.42l11.5 0.48h106.4l8.74-0.8c28.72-2.7 51.47-21 51.47-43.59l-0.41-8.7-1.9 0.09c-0.29 23.6-19.7 43.61-50.25 46.21l-9.45 0.4h-107l-9.45-0.4c-30.14-2.1-50.36-19.31-50.36-44.7l-0.2-13.51-2.4 8v10.1z" fill="url(#paint6_linear_mic)" opacity=".6"/>
                  <path d="m84.11 162.7 2.1-1h2.7l0.8 1v11.1l-1.6 1-2.4-1-1.6-1v-10.1z" fill="url(#paint7_linear_mic)"/>
                  <path d="m169.1 162.7 2.1-1 2.2 0.6v11.5l-2.2 1-2.4-2-0.3-2 0.6-8.1z" fill="url(#paint8_linear_mic)"/>
                  <path d="m89.71 162.7 78.89-0.5v3.6l-78.89 1.4v-4.5z" fill="url(#paint9_linear_mic)"/>
                  <path d="m89.71 170.7 78.89-1.5v3.6l-2.5 1-74.89 0.5-1.5-1v-2.6z" fill="url(#paint10_linear_mic)"/>
                  <path d="m86.06 167.6 1.95 0.5v4.1l-1.95 0.5-0.65-1.5v-2.6l0.65-1z" fill="url(#paint11_linear_mic)"/>
                  <path d="m170.9 167.6 1.5 1v3.6l-1.5 1-1.5-2v-2.6l1.5-1z" fill="url(#paint12_linear_mic)"/>
                  <path d="m100.9 78.81c-2.84 1.5-2.4 8.9 0.2 8.9l2.1-0.6c-0.2 9 2.7 20.7 20.9 23.6v7.81h-7.9c-5.1 0-6.3 1.4-6.6 5.2l0.6 0.4 36.2-0.4 0.5-1c-1.2-3.3-3-4.2-7.8-4.2h-7.7v-8.01c12.9-2.3 21.5-11.2 21.2-23.4l2.1 0.4c3.1 0 3.2-7.4 0.4-8.5-4.3-1.2-6 0.8-6.2 6.7l0.2 1c0.4 10.9-5.3 20.4-18.4 22.1l-0.1-4c9.1-1.4 15.1-8 15.1-16.8v-2 l0.9-0.3-1.3-8.5h-0.6v-20.1c0-8.2-7.9-13.5-15.8-13.5h-0.8c-9.6 0-15.5 6.4-16 13.1l-0.6 0.4v20.1l-1.5 8.5 0.7 0.5v2.3c0 8.9 6.3 15.5 14.8 16.4v3.9c-13.3-1.3-19.4-10-19.1-22.2l0.5-1c0.1-5.7-1.9-8.4-6-6.8z" fill="url(#paint13_linear_mic)"/>
                  <path d="m112.1 54.91h9c1.1 0 1.8 2.5 0 2.5h-9.5l0.5-2.5z" fill="url(#paint14_linear_mic)"/>
                  <path d="m135.9 53.91h8c1 0 1.3 2.5 0 2.5h-8c-1.3 0-1.4-2.5 0-2.5z" fill="url(#paint15_linear_mic)"/>
                  <path d="m112.1 60.11h9c1.4 0 1.5 2.5 0 2.5h-9.5l0.5-2.5z" fill="url(#paint16_linear_mic)"/>
                  <path d="m135.1 60.11h9.5v2.5h-9.5c-1.4 0-1.4-2.5 0-2.5z" fill="url(#paint17_linear_mic)"/>
                  <path d="m111.6 65.31h9.5c1.5 0 1.5 2.5 0 2.5h-9.5v-2.5z" fill="url(#paint18_linear_mic)"/>
                  <path d="m134.8 65.81h10v2.5h-10c-1.4 0-1.4-2.5 0-2.5z" fill="url(#paint19_linear_mic)"/>
                  <path d="m111.6 70.51h9.5c1.5 0 1.5 2.5 0 2.5h-9.5v-2.5z" fill="url(#paint20_linear_mic)"/>
                  <path d="m134.8 73.01h9.5v2.5h-9.5c-1.4 0-1.4-2.5 0-2.5z" fill="url(#paint21_linear_mic)"/>
                  <path d="m111.6 75.71h9.5c1.5 0 1.5 2 0 2h-9.5v-2z" fill="url(#paint22_linear_mic)"/>
                  <path d="m111.1 84.21 35.2-0.2v1.2l-35.2-0.2v-0.8z" fill="url(#paint23_linear_mic)"/>
                  <path d="m125.6 105.3 4.5-0.3v1.5l-4.5 0.3v-1.5z" fill="url(#paint24_linear_mic)"/>
                  <defs>
                    <radialGradient id="paint0_radial_mic" cx="0" cy="0" r="1" gradientTransform="translate(128.6 151.2) scale(143.6 53.08)" gradientUnits="userSpaceOnUse">
                      <stop stop-color="hsl(var(--mic-gradient-dark))" offset="0"/>
                      <stop stop-color="#5D5D5D" offset=".6901"/>
                      <stop stop-color="#343434" offset="1"/>
                    </radialGradient>
                    <linearGradient id="paint1_linear_mic" x1="128.8" x2="128.8" y1="97.41" y2="172.4" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#9B9591" offset="0"/>
                      <stop stop-color="#B5B3B7" offset=".5763"/>
                      <stop stop-color="#625D5C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear_mic" x1="129" x2="129" y1="97.41" y2="167.3" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#87827F" offset="0"/>
                      <stop stop-color="#B0ACA8" offset=".5763"/>
                      <stop stop-color="#66615E" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint3_linear_mic" x1="128.2" x2="128.2" y1="39.19" y2="161.3" gradientUnits="userSpaceOnUse">
                      <stop stop-color="hsl(var(--mic-gradient-start))" offset="0"/>
                      <stop stop-color="hsl(var(--mic-gradient-mid-1))" offset=".4604"/>
                      <stop stop-color="hsl(var(--mic-gradient-mid-2))" offset=".7859"/>
                      <stop stop-color="hsl(var(--mic-gradient-end))" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint4_linear_mic" x1="129.6" x2="129.6" y1="40.48" y2="130.5" gradientUnits="userSpaceOnUse">
                      <stop stop-color="hsl(var(--mic-gradient-start))" offset="0"/>
                      <stop stop-color="hsl(var(--mic-gradient-mid-1))" offset=".5104"/>
                      <stop stop-color="hsl(var(--mic-gradient-mid-2))" offset=".775"/>
                      <stop stop-color="hsl(var(--mic-gradient-end))" offset=".991"/>
                      <stop stop-color="hsl(var(--mic-gradient-end))" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint5_linear_mic" x1="128.9" x2="128.9" y1="41.71" y2="127.9" gradientUnits="userSpaceOnUse">
                      <stop stop-color="hsl(var(--mic-gradient-start))" offset="0"/>
                      <stop stop-color="hsl(var(--mic-gradient-mid-1))" offset=".5104"/>
                      <stop stop-color="hsl(var(--mic-gradient-mid-2))" offset=".775"/>
                      <stop stop-color="hsl(var(--mic-gradient-start))" offset=".991"/>
                      <stop stop-color="hsl(var(--mic-gradient-start))" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint6_linear_mic" x1="128.5" x2="128.5" y1="104.1" y2="169.2" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#928B87" offset="0"/>
                      <stop stop-color="#B8B5B8" offset=".5763"/>
                      <stop stop-color="#847E7C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint7_linear_mic" x1="86.91" x2="86.91" y1="161.7" y2="174.8" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#504A4A" offset="0"/>
                      <stop stop-color="#B5B3B7" offset=".5763"/>
                      <stop stop-color="#625D5C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint8_linear_mic" x1="171" x2="171" y1="161.7" y2="174.8" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#504A4A" offset="0"/>
                      <stop stop-color="#B5B3B7" offset=".5763"/>
                      <stop stop-color="#625D5C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint9_linear_mic" x1="129.2" x2="129.2" y1="162.1" y2="167.3" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#989492" offset="0"/>
                      <stop stop-color="#DEDEE1" offset=".5763"/>
                      <stop stop-color="#94918F" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint10_linear_mic" x1="129.2" x2="129.2" y1="169.1" y2="174.4" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#989492" offset="0"/>
                      <stop stop-color="#FEFFFF" offset=".5763"/>
                      <stop stop-color="#CCCDCE" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint11_linear_mic" x1="86.71" x2="86.71" y1="167.6" y2="172.7" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#989492" offset="0"/>
                      <stop stop-color="#FEFFFF" offset=".5763"/>
                      <stop stop-color="#CCCDCE" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint12_linear_mic" x1="170.9" x2="170.9" y1="167.6" y2="173.2" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#989492" offset="0"/>
                      <stop stop-color="#FEFFFF" offset=".5763"/>
                      <stop stop-color="#CCCDCE" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint13_linear_mic" x1="100" x2="157.2" y1="83.66" y2="83.66" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#504A4A" offset="0"/>
                      <stop stop-color="#D8D8DA" offset=".5763"/>
                      <stop stop-color="#625D5C" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint14_linear_mic" x1="117.3" x2="117.3" y1="54.91" y2="57.41" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint15_linear_mic" x1="140.1" x2="140.1" y1="53.91" y2="56.41" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint16_linear_mic" x1="117.1" x2="117.1" y1="60.11" y2="62.61" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint17_linear_mic" x1="139.4" x2="139.4" y1="60.11" y2="62.61" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint18_linear_mic" x1="116.9" x2="116.9" y1="65.31" y2="67.81" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint19_linear_mic" x1="139.3" x2="139.3" y1="65.81" y2="68.31" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint20_linear_mic" x1="116.9" x2="116.9" y1="70.51" y2="73.01" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint21_linear_mic" x1="139.1" x2="139.1" y1="73.01" y2="75.51" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint22_linear_mic" x1="116.9" x2="116.9" y1="75.71" y2="77.71" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint23_linear_mic" x1="128.7" x2="128.7" y1="84.01" y2="85.21" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                    <linearGradient id="paint24_linear_mic" x1="127.9" x2="127.9" y1="105" y2="106.8" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#232022" offset="0"/>
                      <stop stop-color="#343B3D" offset="1"/>
                    </linearGradient>
                  </defs>
                </svg>

                {/* Processing Spinner Overlay */}
                <AnimatePresence>
                    {isTranscriptionProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-3xl z-30"
                        >
                            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
};
