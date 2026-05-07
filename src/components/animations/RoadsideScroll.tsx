import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Clock, ShieldCheck, MapPin, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useLocalization } from "@/contexts/LocalizationContext";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const FILENAME_PATTERN = (index: number) => `/frames/roadside/frame_${index.toString().padStart(4, '0')}.webp`;

const FEATURE_ITEMS = [
    {
        title: "Roadside Assistance",
        description: "Emergency Breakdown Recovery Available 24/7",
        Icon: Navigation
    },
    {
        title: "Always Online",
        description: "24/7 support because vehicle trouble doesn't stick to business hours.",
        Icon: Clock
    },
    {
        title: "Roadside Contacts",
        description: "Connect quickly with public breakdown recovery listings and confirm details directly.",
        Icon: ShieldCheck
    },
    {
        title: "Rapid Response",
        description: "Just a tap away, whether you're stuck at home or on the roadside.",
        Icon: MapPin
    }
];

export function RoadsideScroll() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textZonesRef = useRef<HTMLDivElement[]>([]);
    const videoSequence = useRef({ frame: 0 });
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const { settings } = useLocalization();

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d', { willReadFrequently: true });
        const container = containerRef.current;
        if (!canvas || !context || !container) return;

        // Preload images
        imagesRef.current = [];
        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = FILENAME_PATTERN(i);
            imagesRef.current.push(img);
        }

        const isMobile = window.innerWidth < 768;

        const render = () => {
            const img = imagesRef.current[Math.floor(videoSequence.current.frame)];
            if (!img || !img.complete || img.naturalWidth === 0) return;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const imgWidth = img.width;
            const imgHeight = img.height;

            // On mobile, "contain" with a more prominent zoom (1.3) to make it feel bigger
            const ratio = isMobile 
                ? (canvasWidth / imgWidth) * 1.3 // Even bigger than before
                : Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
            
            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;

            const x = (canvasWidth - newWidth) / 2;
            const y = isMobile ? (canvasHeight - newHeight) * 0.4 : (canvasHeight - newHeight) / 2;

            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);
        };

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        // Initialize global Lenis once to prevent multiple instances from fighting
        if (!(window as any).lenis) {
            (window as any).lenis = new Lenis({
                lerp: 0.1,
                duration: 1.5,
                smoothWheel: true,
            });
            const raf = (time: number) => {
                (window as any).lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }

        // Global ScrollTrigger config for smooth pinning
        ScrollTrigger.config({ limitCallbacks: true });
        ScrollTrigger.normalizeScroll(true);

        if (imagesRef.current.length > 0) {
            imagesRef.current[0].onload = () => {
                render();
                ScrollTrigger.refresh();
            };
        }

        // GSAP Main Timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "+=600%", 
                pin: true,
                pinType: "fixed",
                scrub: 1,
                anticipatePin: 1.5,
                preventOverlaps: true,
                fastScrollEnd: true,
                refreshPriority: 10,
            }
        });

        // Ensure ScrollTrigger is aware of layout after mount
        ScrollTrigger.refresh();

        // 1. Sequential Feature Items - Adjusted for 4 items - Tighter spacing
        FEATURE_ITEMS.forEach((item, i) => {
            const zone = textZonesRef.current[i];
            if (!zone) return;
            // Tighter spacing (1.8) for 4 items to reduce empty scroll gaps
            const startTime = 0.5 + (i * 1.8);
            
            tl.fromTo(zone, {
                autoAlpha: 0,
                x: -30,
            }, {
                autoAlpha: 1,
                x: 0,
                duration: 1,
                ease: "power2.out"
            }, startTime)
            .to(zone, {
                autoAlpha: 0,
                x: 20,
                duration: 1,
                ease: "power2.in"
            }, startTime + 1.2); // Tighter visibility window
        });

        // 2. Core Video Sequence - Sync with text (total 10 units)
        tl.to(videoSequence.current, {
            frame: FRAME_COUNT - 1,
            ease: "none",
            onUpdate: render,
            duration: 10,
        }, 0);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            tl.kill();
            ScrollTrigger.refresh();
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden select-none will-change-transform flex flex-col items-center justify-start pt-[12vh] md:pt-0 z-0">
            {/* Main Canvas */}
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-screen z-0" />

            {/* Sequential Feature Overlays - Left Side */}
            <div className="absolute top-0 left-0 w-full h-screen pointer-events-none z-[110] flex flex-col justify-center pt-[12vh] md:pt-0">
                {FEATURE_ITEMS.map((item, i) => (
                    <div
                        key={i}
                        ref={el => textZonesRef.current[i] = el!}
                        className="absolute left-[8%] md:left-[12%] top-[45%] md:top-1/2 -translate-y-1/2 max-w-[85vw] md:max-w-2xl opacity-0 invisible"
                    >
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-black/80 border border-[#d7c08a]/30 flex items-center justify-center shadow-2xl backdrop-blur-xl">
                                <item.Icon className="w-6 h-6 md:w-10 md:h-10 text-[#d7c08a]" />
                            </div>
                            
                            <div className="pt-1 md:pt-2">
                                <h2 className="font-display font-bold text-2xl md:text-5xl text-white mb-2 md:mb-3">
                                    {item.title}
                                </h2>
                                <p className="font-sans text-base md:text-2xl text-white/80 leading-relaxed max-w-lg">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Integrated CTA Button - Fixed under video */}
            <div className="absolute bottom-[18vh] md:bottom-10 left-0 w-full flex justify-center items-center z-[130] px-4 md:px-0">
                <RoadsideHelpButton />
            </div>
        </div>
    );
}

function RoadsideHelpButton() {
    const { settings } = useLocalization();
    const navigate = useNavigate();
    const [isLocating, setIsLocating] = useState(false);

    const handleGetHelp = () => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported");
            navigate("/listings?category=breakdown");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setIsLocating(false);
                const pathPrefix = settings.countryCode === 'US' ? '/us' : '';
                navigate(`${pathPrefix}/emergency-breakdown?lat=${latitude}&lng=${longitude}`);
            },
            (error) => {
                console.warn("Geolocation error:", error.message);
                setIsLocating(false);
                const pathPrefix = settings.countryCode === 'US' ? '/us' : '';
                navigate(`${pathPrefix}/emergency-breakdown`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    return (
        <Button 
            size="xl" 
            onClick={handleGetHelp}
            disabled={isLocating}
            className="bg-gradient-to-r from-[#caa55b] via-[#e2cd97] to-[#caa55b] text-black font-bold text-xl md:text-2xl px-12 py-8 rounded-full shadow-[0_10px_40px_rgba(202,165,91,0.4)] hover:shadow-[0_15px_60px_rgba(202,165,91,0.6)] hover:scale-105 transition-all duration-300 border-none w-full md:w-auto min-w-[320px]"
        >
            <div className="flex items-center justify-center gap-3">
                {isLocating ? (
                    <>
                        <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>LOCATING YOU...</span>
                    </>
                ) : (
                    <>
                        <Navigation className="w-6 h-6" />
                        <span>GET ROADSIDE HELP</span>
                    </>
                )}
            </div>
        </Button>
    );
}
