import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { LayoutTextFlipDemo } from "@/components/LayoutTextFlipDemo";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useLocalization } from "@/contexts/LocalizationContext";
import { audioService } from "@/lib/audioService";
import { cn } from "@/lib/utils";
import { getSiteName } from "@/lib/siteConfig";

const EmergencyChatInterface = lazy(() =>
    import("@/components/EmergencyChatInterface").then(m => ({ default: m.EmergencyChatInterface }))
);

export const USE_SVG_BUTTONS_ON_DESKTOP = true;

const HERO_VIDEO_SRC = "/assets/archive/earth-hero/hero-video/earth-approach-clean.mp4";
const HERO_VIDEO_POSTER = "/assets/archive/earth-hero/hero-video/earth-approach-clean-poster.webp";

interface HeroSectionProps {
    showSearchControls?: boolean;
    ctaHref?: string;
    ctaLabel?: string;
    mirrorCtas?: boolean;
    secondaryCtaHref?: string;
    secondaryCtaLabel?: string;
}

export function HeroSection({
    showSearchControls = true,
    ctaHref = "/",
    ctaLabel = "Find Emergency Help",
    mirrorCtas = false,
    secondaryCtaHref = "/landing#services",
    secondaryCtaLabel = "Browse Services",
}: HeroSectionProps) {
    const { settings, detectedCity, detectedState, geoError, detectUserLocation, isLocating } = useLocalization();
    const [isPressed, setIsPressed] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const [heroVideoReady, setHeroVideoReady] = useState(false);
    const controlsRevealTimerRef = useRef<number | null>(null);

    const revealControls = useCallback((hold = false) => {
        setControlsVisible(true);
        if (controlsRevealTimerRef.current) {
            window.clearTimeout(controlsRevealTimerRef.current);
        }
        if (!hold) {
            controlsRevealTimerRef.current = window.setTimeout(() => {
                setControlsVisible(false);
            }, 4200);
        }
    }, []);

    useEffect(() => {
        const handleActivity = () => revealControls();
        window.addEventListener('mousemove', handleActivity, { passive: true });
        window.addEventListener('touchstart', handleActivity, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
            if (controlsRevealTimerRef.current) {
                window.clearTimeout(controlsRevealTimerRef.current);
            }
        };
    }, [revealControls]);

    // Headline Logic
    // UK: NEAR {City} or NEAR ME
    // US: NEAR {City} or NEAR ME
    const displayCity = (detectedCity && detectedCity.length > 2 && detectedCity.toUpperCase() !== 'UK' && detectedCity.toUpperCase() !== 'UNITED KINGDOM' ? detectedCity : 'ME').toUpperCase();
    const displayState = detectedState || (settings.countryCode === 'US' ? 'US' : 'UK');
    const siteTradeTerm = getSiteName().includes('Contractors') ? 'Contractors' : 'Tradesmen';

    return (
        <section
            className={cn(
                "earth-cockpit-hero hero-control-stage relative block min-h-[100svh] overflow-hidden bg-black",
                controlsVisible && "hero-controls-visible"
            )}
            onPointerMove={() => revealControls()}
            onMouseMove={() => revealControls()}
            onTouchStart={() => revealControls()}
            onFocusCapture={() => revealControls(true)}
            onBlurCapture={() => revealControls()}
        >
            <div className="absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${HERO_VIDEO_POSTER})` }}
                />
                <video
                    className={cn(
                        "hero-space-flight-video absolute inset-0 h-full w-full object-cover object-center opacity-0",
                        heroVideoReady && "opacity-100"
                    )}
                    src={HERO_VIDEO_SRC}
                    poster={HERO_VIDEO_POSTER}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedData={() => setHeroVideoReady(true)}
                    onCanPlay={() => setHeroVideoReady(true)}
                />
            </div>
            <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.02)_24%,rgba(0,0,0,0.22)_66%,rgba(0,0,0,0.56)_100%)] pointer-events-none" />
            <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.12)_28%,rgba(0,0,0,0.08)_70%,rgba(0,0,0,0.52)_100%)] pointer-events-none" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/24 via-black/0 to-background/82 pointer-events-none" />

            <div className="relative container-wide w-full pt-16 sm:pt-20 md:pt-14 md:pb-0 pointer-events-none z-10">
                <div className="w-full max-w-5xl md:max-w-7xl mx-auto text-center pointer-events-auto">
                    {/* Availability badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="mb-3 inline-flex flex-col items-center gap-2 md:mb-6"
                    >
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-gold/35 bg-black/45 backdrop-blur-md shadow-[0_0_24px_rgba(0,0,0,0.28)] relative overflow-hidden group transition-all duration-500 hover:border-gold/55">
                            {/* Subtle scanning light effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold/90 drop-shadow-sm">
                                Local Professionals Available Now
                            </span>
                        </div>
                    </motion.div>

                    {/* Main headline — matches reference: LOCAL / TRADESMEN|CONTRACTORS (gold, dominant) / near CITY */}
                    <div className="hero-title-arch relative flex flex-col items-center justify-center mb-3 px-1 sm:px-4 w-full overflow-visible md:mb-6">
                        <h1
                            aria-label={`Local ${siteTradeTerm} near ${displayCity}`}
                            className="text-center max-w-4xl mx-auto w-full [text-shadow:0_4px_24px_rgba(0,0,0,0.78)] md:[text-shadow:0_4px_24px_rgba(0,0,0,0.15)]"
                        >
                            {/* LOCAL (black) with gold O logo */}
                            <span
                                className="block text-white md:text-foreground text-[clamp(2rem,11vw,3.75rem)] drop-shadow-[0_4px_18px_rgba(0,0,0,0.78)]"
                                style={{ fontFamily: '"Archivo Black", Impact, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}
                            >
                                L<img src="/et-logo-v3.webp" alt="" aria-hidden="true" width="64" height="64" decoding="async" className="inline-block h-[0.88em] w-auto align-middle -translate-y-[0.06em] mx-[0.02em] brightness-125 drop-shadow-lg" />CAL
                            </span>

                            {/* TRADESMEN / CONTRACTORS — dominant, rich gold */}
                            <span
                                className="block bg-clip-text text-transparent text-[clamp(2rem,9.2vw,5.25rem)] drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)] mt-1"
                                style={{
                                    fontFamily: '"Archivo Black", Impact, sans-serif',
                                    letterSpacing: '-0.03em',
                                    lineHeight: 0.95,
                                    backgroundImage: 'linear-gradient(180deg, #f5dc8a 0%, #e3c063 30%, #caa052 55%, #b8893f 80%, #8c6524 100%)',
                                }}
                            >
                                {siteTradeTerm.toUpperCase()}
                            </span>

                            {/* near [CITY] — stays on one line, scales with viewport and shrinks for long names */}
                            <span className="flex items-end justify-center gap-[0.3em] mt-2 whitespace-nowrap">
                                <span className="relative inline-block">
                                    <span
                                        className="text-white md:text-foreground text-[clamp(1.25rem,5.5vw,2.5rem)] leading-none drop-shadow-[0_3px_12px_rgba(0,0,0,0.78)]"
                                        style={{ fontFamily: '"Kaushan Script", cursive', fontWeight: 400 }}
                                    >
                                        near
                                    </span>
                                    {/* Gold underline swoosh */}
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 120 10"
                                        preserveAspectRatio="none"
                                        className="absolute left-0 right-0 -bottom-[0.15em] w-full h-[0.35em] pointer-events-none"
                                    >
                                        <path
                                            d="M2 7 C 20 2, 50 2, 75 5 S 110 8, 118 3"
                                            fill="none"
                                            stroke="url(#nearUnderline)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="nearUnderline" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#e3c063" stopOpacity="0.4" />
                                                <stop offset="50%" stopColor="#caa052" />
                                                <stop offset="100%" stopColor="#b8893f" stopOpacity="0.4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                                <span
                                    className="text-white md:text-foreground text-[clamp(1.75rem,8.5vw,3.25rem)] min-w-0 truncate drop-shadow-[0_4px_16px_rgba(0,0,0,0.78)]"
                                    style={{ fontFamily: '"Archivo Black", Impact, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}
                                >
                                    {displayCity}
                                </span>
                            </span>
                        </h1>
                        {showSearchControls && geoError && (
                            <button
                                type="button"
                                onClick={detectUserLocation}
                                className="mt-4 max-w-[min(92vw,34rem)] rounded-full border border-gold/35 bg-black/55 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-gold/70 hover:bg-black/70"
                            >
                                {isLocating ? 'Checking precise phone location...' : geoError}
                            </button>
                        )}
                    </div>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-[10px] sm:text-sm md:text-base lg:text-lg text-white/85 md:text-muted-foreground mb-4 tracking-wide uppercase drop-shadow-[0_3px_12px_rgba(0,0,0,0.72)] md:drop-shadow-none"
                    >
                        Emergency {siteTradeTerm} {displayState} | Nationwide 24/7 Help
                    </motion.p>

                    {/* "Need Help" Button */}
                    <div className={cn("relative", showSearchControls ? "hero-get-help-reveal" : "hidden")}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col items-center justify-center mt-6 mb-0 md:mt-8 gap-4"
                        >
                            <RainbowButton
                                size="lg"
                                className={cn("gap-3 rounded-full font-display tracking-wider text-sm md:text-base px-8 py-3", USE_SVG_BUTTONS_ON_DESKTOP ? "hidden" : "hidden md:flex")}
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
                                className={cn("relative", USE_SVG_BUTTONS_ON_DESKTOP ? "flex" : "md:hidden")}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="186" fill="none" viewBox="0 0 256 186" className={cn("h-auto cursor-pointer drop-shadow-2xl transition-all duration-300", USE_SVG_BUTTONS_ON_DESKTOP ? "w-[120px] md:w-[160px]" : "w-[120px]")}>
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
                              </defs>
                            </svg>
                            </motion.button>
                        </motion.div>
                    </div>

                    {!showSearchControls && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className={cn(
                                "mt-6 flex justify-center md:mt-8",
                                mirrorCtas && "landing-hero-cta-mirror"
                            )}
                        >
                            <Link
                                to={ctaHref}
                                className="group relative inline-flex min-h-12 items-center justify-center rounded-full border border-gold/45 bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_38px_rgba(212,175,55,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(212,175,55,0.55)] md:px-10 md:py-4 md:text-base"
                            >
                                {ctaLabel}
                            </Link>
                            {mirrorCtas && (
                                <Link
                                    to={secondaryCtaHref}
                                    className="group relative inline-flex min-h-12 items-center justify-center rounded-full border border-gold/35 bg-black/45 px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gold shadow-[0_0_30px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-gold/65 hover:bg-gold/10 hover:text-gold-light md:px-10 md:py-4 md:text-base"
                                >
                                    {secondaryCtaLabel}
                                </Link>
                            )}
                        </motion.div>
                    )}

                    {/* "Need Help" Button */}
                    <div className="hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col items-center justify-center mt-6 mb-0 md:mt-8 gap-4"
                        >
                            {showSearchControls ? (
                                <RainbowButton
                                    size="lg"
                                    className={cn("gap-3 rounded-full font-display tracking-wider text-sm md:text-base px-8 py-3", USE_SVG_BUTTONS_ON_DESKTOP ? "hidden" : "hidden md:flex")}
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
                            ) : (
                                <Link
                                    to={ctaHref}
                                    className="group relative inline-flex min-h-12 items-center justify-center rounded-full border border-gold/45 bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_38px_rgba(212,175,55,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(212,175,55,0.55)] md:px-10 md:py-4 md:text-base"
                                >
                                    {ctaLabel}
                                </Link>
                            )}

                            {showSearchControls && (
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
                                className={cn("relative", USE_SVG_BUTTONS_ON_DESKTOP ? "flex" : "md:hidden")}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="186" fill="none" viewBox="0 0 256 186" className={cn("h-auto cursor-pointer drop-shadow-2xl transition-all duration-300", USE_SVG_BUTTONS_ON_DESKTOP ? "w-[120px] md:w-[160px]" : "w-[120px]")}>
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
                            )}
                        </motion.div>
                    </div>
                </div>

                {showSearchControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="hero-chat-stage mb-0 mt-0 pointer-events-auto relative z-30"
                    >
                        <div className="w-full max-w-4xl mx-auto mb-0 -mt-4 md:-mt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-30">
                            <div className="rounded-3xl overflow-visible">
                                <Suspense fallback={<div className="h-32 rounded-3xl bg-black/20 animate-pulse" aria-hidden />}>
                                    <EmergencyChatInterface />
                                </Suspense>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Flipping Text */}
                <div className="hero-spin-text-stage flex justify-center w-full relative z-20 pointer-events-auto mt-6 pb-6 md:mt-8 md:pb-8">
                    <LayoutTextFlipDemo />
                </div>
            </div>
        </section>
    );
}
