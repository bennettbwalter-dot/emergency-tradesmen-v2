import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";
import { TrustBadges } from "@/components/TrustBadges";
import { LayoutTextFlipDemo } from "@/components/LayoutTextFlipDemo";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useLocalization } from "@/contexts/LocalizationContext";
import ColorBends from "@/components/ui/ColorBends";
import { audioService } from "@/lib/audioService";

export function HeroSection() {
    const { settings, detectedCity, detectedState, detectUserLocation } = useLocalization();
    const [isPressed, setIsPressed] = useState(false);
    const location = useLocation();

    // Trigger location detection on mount if not already done
    useEffect(() => {
        detectUserLocation();
    }, [detectUserLocation]);

    // Headline Logic
    // UK: NEAR {City} or NEAR ME
    // US: NEAR {City} or NEAR ME
    const displayCity = (detectedCity && detectedCity.length > 2 && detectedCity.toUpperCase() !== 'UK' && detectedCity.toUpperCase() !== 'UNITED KINGDOM' ? detectedCity : 'ME').toUpperCase();
    const displayState = detectedState || (settings.countryCode === 'US' ? 'US' : 'UK');
    const localizedIntentLine = settings.countryCode === 'US'
        ? "Emergency plumber, electrician, locksmith & HVAC callout support"
        : "Emergency plumber, electrician, locksmith & gas engineer callouts";

    return (
        <section className="relative block overflow-hidden">
            {/* Background layers */}
            <div className="absolute inset-0 z-0 opacity-40">
                <ColorBends
                    colors={["#d7c08a", "#caa55b", "#b8986e"]}
                    rotation={0}
                    speed={0.2}
                    scale={1}
                    frequency={1}
                    warpStrength={1}
                    mouseInfluence={1}
                    parallax={0.5}
                    noise={0.1}
                    transparent
                    autoRotate={0}
                />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none z-1" />

            {/* Decorative gold rings */}
            <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] -translate-y-1/2 opacity-20 animate-float pointer-events-none">
                <div className="absolute inset-0 rounded-full border border-gold/30" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />
                <div className="absolute inset-8 rounded-full border border-gold/20" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />
            </div>

            {/* Glow effects */}
            <div className="absolute -top-10 -right-10 md:top-20 md:right-20 w-80 h-80 md:w-96 md:h-96 bg-gold/5 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/3 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative container-wide w-full pt-16 pb-0 md:pt-28 md:pb-0 pointer-events-none z-10">
                <div className="w-full max-w-5xl md:max-w-7xl mx-auto text-center pointer-events-auto">
                    {/* Availability badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="mb-6 inline-flex flex-col items-center gap-2"
                    >
                        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border-2 animate-border-gold-white bg-white/5 backdrop-blur-sm">
                            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse-red-green-bg"></span>
                            </span>
                            <span className="text-[10px] sm:text-sm font-medium uppercase tracking-wider animate-pulse-gold-text">Local {settings.tradeTerm} Available Now</span>
                        </div>
                    </motion.div>

                    {/* Main headline */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide text-foreground text-center text-balance max-w-4xl mx-auto leading-[1.1]">
                            LOCAL <span className="text-gold block sm:inline">{(settings.tradeTerm || 'Tradesmen').toUpperCase()}</span>
                            <span className="text-gold block sm:inline"> NEAR {displayCity}</span>
                        </h1>
                    </div>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-[10px] sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-4 tracking-wide uppercase"
                    >
                        {localizedIntentLine} | {displayState} | 24/7 Response
                    </motion.p>

                    {/* "Need Help" Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col items-center justify-center mt-8 mb-0 md:mt-16 relative z-40 gap-4"
                    >
                        <RainbowButton
                            size="lg"
                            className="hidden md:flex gap-3 rounded-full font-display tracking-wider text-sm md:text-base px-8 py-3"
                            onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(new Event('start-tour'));
                            }}
                        >
                            <div className="relative flex items-center justify-center">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            NEED HELP?
                        </RainbowButton>

                        <motion.button
                            whileTap={{ scale: 0.95, y: 2 }}
                            onPointerDown={() => {
                                setIsPressed(true);
                                audioService.playClick(5); // Heavy variant
                            }}
                            onPointerUp={() => setIsPressed(false)}
                            onPointerLeave={() => setIsPressed(false)}
                            onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(new Event('start-tour'));
                            }}
                            className="md:hidden relative z-40"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="186" fill="none" viewBox="0 0 256 186" className="w-[120px] h-auto cursor-pointer drop-shadow-2xl">
                              {/* SVG created with Arrow, by QuiverAI (https://quiver.ai) */}
                              <path 
                                d="m240 95.47v90.53h-223.6v-90.53h223.6z" 
                                fill="url(#paint0_radial_2136_11982)" 
                                style={{ opacity: isPressed ? 1 : 0, transition: 'opacity 0.2s ease' }}
                              />
                              <path d="m239.4 87.31c0 27.84-22.69 56.57-54.55 56.75l-111.1 0.28c-31.67 0.08-57.31-18.42-57.31-49.53v-5.15c0-25.75 19.9-83.32 63.77-83.32h102.6c29.24 0 56.62 18.22 51.25 56.96 2.92 6.58 5.37 13.67 5.37 24.01z" fill="url(#paint1_linear_2136_11982)"/>
                              <path d="m238.6 89.05c0 24.41-21.69 48.63-51.37 49.06l-114.4 0.08c-29.79 0.03-55.55-20.08-55.55-46.1v-4.08c0-16.69 8.92-26.52 8.92-26.52l-3.2 7.31s-1.03 8.13-0.69 15.39c1.13 25.72 24.12 39.86 46.1 39.86h118.3c25.67 0 50.27-18.56 50.46-38.99 0.08-8.38-2.49-16.04-3.89-20.25l2.77 2.88c1.98 5.92 2.59 12.09 2.59 21.36z" fill="url(#paint2_linear_2136_11982)"/>
                              <path d="m236.6 87.74c0 21.59-20.88 42.22-48.69 43.18l-116.1 0.07c-27.97 0.02-51.67-18.5-51.67-40.87v-3.23l1.27-0.48c1.42 20.52 20.56 39.7 47.58 39.7l117.9-0.22c25.15 0 47.18-19.48 48.7-38.78l1 0.63z" fill="url(#paint3_linear_2136_11982)" opacity=".5"/>
                              <path d="m232.7 51.92v27.16c0 23.85-19.8 43.66-46.54 43.66l-115.7-0.18c-25.42 0-47.92-16.59-47.92-40.29v-30.16c0-25.98 19.6-45.77 50.22-45.77h109.9c26.27 0 49.97 16.88 49.97 45.58z" fill="url(#paint4_linear_2136_11982)"/>
                              <path d="m229.7 51.78v1.29c0 24.14-20.27 41.04-43.7 41.04h-113.9c-25.02 0-46.32-15.88-46.32-39.71v-4.15c0-23.86 17.82-43.38 47.93-43.38h108.6c26.27 0 47.39 17.98 47.39 44.91z" fill="url(#paint5_linear_2136_11982)"/>
                              <path d="m229.4 51.08v1.23c0 22.96-19.8 38.51-43.23 38.51h-113.9c-23.85 0-44.67-14.78-44.67-37.22v-3.53c0-22.96 17.21-41.88 45.81-41.88h108.6c25.57 0 47.39 17.1 47.39 42.89z" fill="url(#paint6_linear_2136_11982)"/>
                              <path d="m170.4 119.2-3.3 3.51v3.02l3.3 1.33v7.74l-2.34 1.64-1.42-1.35v-12.23l2.46-3.66h1.3z" fill="#3D0000" opacity=".5"/>
                              <path d="m86.89 118.5 2.82 3.59v3.02l-2.82 1.33v8.92l1.97 1.14 1.85-1.57v-12.23l-2.46-4.2h-1.36z" fill="#3D0000" opacity=".5"/>
                              <path d="m166.6 123.2 1.54 0.94v2.98l-1.54 1.19v-5.11z" fill="#7A000E"/>
                              <path d="m87.91 123.2 1.8 0.94v2.98l-1.8 1.19v-5.11z" fill="#7A000E"/>
                              <path d="m166.6 123.2h-76.51v3.77h76.51v-3.77z" fill="url(#paint7_linear_2136_11982)"/>
                              <path d="m166.6 129.5 1.54 1.16v5.49l-1.54-0.78v-5.87z" fill="url(#paint8_linear_2136_11982)"/>
                              <path d="m89.71 129.5-1.8 1.16v5.49l1.8-0.78v-5.87z" fill="url(#paint9_linear_2136_11982)"/>
                              <path d="m166.6 128.1h-76.51v4.35h76.51v-4.35z" fill="url(#paint10_radial_2136_11982)"/>
                              {/* NEED HELP? Text and Question Mark perfectly centered and balanced */}
                              <g transform="translate(20, -54) scale(0.85)">
                                <path d="m46.92 135.9h-3.21l-12.8-17.91v17.91h-3.21v-22.79h3.21l12.84 18v-18h3.17v22.79z" fill="#FEFFFE"/>
                                <path d="m59.52 136.9c-5.27 0-8.42-3.45-8.42-8.99v-0.63c0-4.82 3.11-9.08 7.92-9.08 4.85 0 7.54 3.45 7.54 8.8v1.51h-12.27c0.09 3.54 2.07 5.97 5.4 5.97 2.22 0 3.78-1.16 4.93-2.88l1.81 1.72c-1.68 2.38-3.94 3.58-6.91 3.58zm-0.55-16.27c-2.96 0-4.29 2.77-4.59 5.58h9.05v-0.31c-0.18-2.86-1.56-5.27-4.46-5.27z" fill="#FEFFFE"/>
                                <path d="m76.97 136.9c-5.26 0-7.95-3.45-7.95-8.99v-0.63c0-4.82 2.82-9.08 7.91-9.08 4.85 0 7.54 3.45 7.54 8.8v1.51h-12.27c0.09 3.54 1.69 5.97 5.02 5.97 2.22 0 3.78-1.16 4.93-2.88l2.02 1.72c-1.51 2.38-3.95 3.58-7.2 3.58zm-0.26-16.27c-2.96 0-4.16 2.77-4.46 5.58h9.05v-0.31c-0.18-2.86-1.51-5.27-4.59-5.27z" fill="#FEFFFE"/>
                                <path d="m99.41 134.6c-1.47 1.58-3.02 2.31-5.09 2.31-4.85 0-7.2-3.83-7.2-9.26v-0.27c0-5.03 2.64-9.15 7.4-9.15 2.1 0 3.66 0.93 4.81 2.41v-9.29h3.34v25.08h-3.06l-0.2-1.83zm-0.08-11.31c-1.06-1.64-2.39-2.53-4.16-2.53-3.15 0-4.71 2.99-4.71 6.8 0 3.65 1.47 6.79 4.8 6.79 1.73 0 3.1-1.03 4.07-2.75v-8.31z" fill="#FEFFFE"/>
                                <path d="m133.4 135.9h-3.58v-11.11h-11.12v11.11h-3.1v-22.79h3.1v9.3h11.12v-9.3h3.58v22.79z" fill="#FEFFFE"/>
                                <path d="m146.2 136.9c-5.27 0-8.05-3.45-8.05-8.99v-0.63c0-4.82 2.83-9.08 7.92-9.08 4.85 0 7.54 3.45 7.54 8.8v1.51h-12.27c0.09 3.54 1.73 5.97 5.06 5.97 2.22 0 3.78-1.16 4.93-2.88l2.02 1.72c-1.56 2.38-4 3.58-7.15 3.58zm-0.26-16.27c-2.96 0-4.29 2.77-4.59 5.58h9.05v-0.31c-0.18-2.86-1.51-5.27-4.46-5.27z" fill="#FEFFFE"/>
                                <path d="m160.2 135.9h-3.1v-24.3h3.1v24.3z" fill="#FEFFFE"/>
                                <path d="m172.8 136.9c-2.35 0-3.91-1.03-5.15-2.56v8.67h-3.1v-24.27h2.83l0.13 2.07c1.33-1.72 2.98-2.57 5.24-2.57 4.94 0 7.38 4.01 7.38 9.27v0.26c0 5.03-2.64 9.13-7.33 9.13zm3.99-9.44c0-3.65-1.64-6.69-4.84-6.69-1.82 0-3.33 1.2-4.3 2.92v8.45c1.06 1.64 2.43 2.38 4.25 2.38 3.24 0 4.89-3.14 4.89-6.83v-0.23z" fill="#FEFFFE"/>
                                <path d="m205.1 131.7c0-3.92 1.42-6.05 5.41-9.33 2.87-2.44 3.97-3.92 3.97-6.07 0-2.68-2.4-4.83-5.73-4.83-3.15 0-4.97 2.24-6.03 5.56-0.72 2.15-2.01 2.95-3.74 2.77-2.11-0.22-3.17-1.93-3.03-3.95 0.35-6 5.75-9.69 12.45-9.69 8.07 0 12.63 4.69 12.63 10.6 0 3.92-2.44 6.49-6.28 9.63-3.05 2.57-3.98 3.88-4.57 6.26-0.49 1.88-1.51 2.56-3.06 2.43-1.24-0.13-2.02-1.33-2.02-3.38zm3.61 3.87c2.64 0 3.7 2.24 3.7 3.96 0 2.24-1.82 3.96-3.79 3.96-2.26 0-3.82-1.83-3.82-3.96 0-2.03 1.47-3.96 3.91-3.96z" fill="#FEFFFE"/>
                              </g>
                              <defs>
                                <radialGradient id="paint0_radial_2136_11982" cx="0" cy="0" r="1" gradientTransform="translate(128.2 131.1) scale(136.3 54.86)" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#FF0012" offset="0"/>
                                  <stop stopColor="#FF8A8A" stopOpacity=".7589" offset=".6802"/>
                                  <stop stopColor="#FFB8B8" stopOpacity=".01" offset="1"/>
                                </radialGradient>
                                <linearGradient id="paint1_linear_2136_11982" x1="127.9" x2="127.9" y1="6.338" y2="144.4" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#D76872" offset="0"/>
                                  <stop stopColor="#8F272D" offset=".2135"/>
                                  <stop stopColor="#650003" offset=".5781"/>
                                  <stop stopColor="#774246" offset=".8594"/>
                                  <stop stopColor="#6A3939" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint2_linear_2136_11982" x1="127.9" x2="127.9" y1="61.49" y2="138.3" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#D0B7B3" offset="0"/>
                                  <stop stopColor="#957873" offset=".3177"/>
                                  <stop stopColor="#73484A" offset=".5417"/>
                                  <stop stopColor="#8A6060" offset=".8021"/>
                                  <stop stopColor="#815656" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint3_linear_2136_11982" x1="128.4" x2="128.4" y1="86.41" y2="131" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#D9C9A9" offset="0"/>
                                  <stop stopColor="#95404B" stopOpacity=".29" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint4_linear_2136_11982" x1="127.6" x2="127.6" y1="6.338" y2="122.7" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#D55260" offset="0"/>
                                  <stop stopColor="#B72A36" offset=".4062"/>
                                  <stop stopColor="#750008" offset=".8177"/>
                                  <stop stopColor="#7A0006" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint5_linear_2136_11982" x1="127.7" x2="127.7" y1="6.865" y2="94.11" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#B73A48" offset="0"/>
                                  <stop stopColor="#B72A36" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint6_linear_2136_11982" x1="128.5" x2="128.5" y1="8.188" y2="90.82" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#C64252" offset="0"/>
                                  <stop stopColor="#B72A36" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint7_linear_2136_11982" x1="128.4" x2="128.4" y1="123.2" y2="126.9" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#9E9E9E" offset="0"/>
                                  <stop stopColor="#919191" stopOpacity=".21" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint8_linear_2136_11982" x1="167.4" x2="167.4" y1="129.5" y2="136.1" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#780002" offset="0"/>
                                  <stop stopColor="#FF4852" offset=".2708"/>
                                  <stop stopColor="#FF9499" offset=".5312"/>
                                  <stop stopColor="#F1787D" offset=".7708"/>
                                  <stop stopColor="#890001" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint9_linear_2136_11982" x1="88.81" x2="88.81" y1="129.5" y2="136.1" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#780002" offset="0"/>
                                  <stop stopColor="#FF4852" offset=".2708"/>
                                  <stop stopColor="#FF9499" offset=".5312"/>
                                  <stop stopColor="#F1787D" offset=".7708"/>
                                  <stop stopColor="#890001" offset="1"/>
                                </linearGradient>
                                <radialGradient id="paint10_radial_2136_11982" cx="0" cy="0" r="1" gradientTransform="translate(128.4 130.3) scale(30.89 5.149)" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#FFD4D4" offset="0"/>
                                  <stop stopColor="#FF7881" stopOpacity=".27" offset="1"/>
                                </radialGradient>
                                <linearGradient id="paint11_linear_2136_11982" x1="136.9" x2="149.6" y1="15.71" y2="78.08" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#8A8A8A" offset="0"/>
                                  <stop stopColor="#D8D8D8" offset=".3385"/>
                                  <stop stopColor="#919191" offset=".6615"/>
                                  <stop stopColor="#595959" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint12_linear_2136_11982" x1="157.3" x2="163.4" y1="15.71" y2="49.61" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#D9D9D9" offset="0"/>
                                  <stop stopColor="#BEBEBE" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint13_linear_2136_11982" x1="134.9" x2="134.9" y1="15.71" y2="39.14" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#595959" offset="0"/>
                                  <stop stopColor="#141414" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint14_linear_2136_11982" x1="135.2" x2="135.2" y1="33.8" y2="48.46" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#848484" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint15_linear_2136_11982" x1="116" x2="116" y1="44.81" y2="57.95" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#919191" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint16_linear_2136_11982" x1="155.9" x2="155.9" y1="48.46" y2="81.21" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#919191" offset="0"/>
                                  <stop stopColor="#454545" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint17_linear_2136_11982" x1="120.9" x2="120.9" y1="57.95" y2="64.61" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#212121" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint18_linear_2136_11982" x1="110.5" x2="110.5" y1="67.41" y2="71.13" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#212121" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint19_linear_2136_11982" x1="96" x2="96" y1="57.73" y2="60.81" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#212121" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint20_linear_2136_11982" x1="83.63" x2="83.63" y1="48.25" y2="50.94" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#212121" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint21_linear_2136_11982" x1="97.66" x2="97.66" y1="37.91" y2="40.9" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#212121" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                                <linearGradient id="paint22_linear_2136_11982" x1="113.9" x2="113.9" y1="27.61" y2="31.42" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#212121" offset="0"/>
                                  <stop stopColor="#757575" offset="1"/>
                                </linearGradient>
                              </defs>
                            </svg>
                        </motion.button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mb-0 mt-0 pointer-events-auto"
                >
                    <div className="w-full max-w-4xl mx-auto mb-0 -mt-6 md:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-30">
                        <div className="rounded-3xl overflow-visible">
                            <EmergencyChatInterface />
                        </div>
                    </div>
                </motion.div>

                {/* Flipping Text */}
                <div className="flex justify-center w-full relative z-20 pointer-events-auto mt-16 pb-16">
                    <LayoutTextFlipDemo />
                </div>
            </div>
        </section>
    );
}
