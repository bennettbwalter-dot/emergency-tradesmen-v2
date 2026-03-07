import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const FILENAME_PATTERN = (index: number, isLightMode: boolean) => `/frames/${isLightMode ? 'v2w_light' : 'v2w'}/frame_${index.toString().padStart(4, '0')}.webp`;

const listItems = [
    "Nationwide coverage",
    "Fast response times (30-90 mins)",
    "Cars, vans, and light commercial"
];

import { useTheme } from "next-themes";

export function TradesmenScroll() {
    const { theme } = useTheme();
    const isLightMode = theme === 'light' || (!theme && typeof document !== 'undefined' && !document.documentElement.classList.contains('dark'));

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalTextRef = useRef<HTMLHeadingElement>(null);
    const verticalTextRef = useRef<HTMLDivElement>(null);
    const videoSequence = useRef({ frame: 0 });
    const imagesRef = useRef<HTMLImageElement[]>([]);

    useEffect(() => {

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        const container = containerRef.current;
        if (!canvas || !context || !container) return;

        // Preload images
        imagesRef.current = [];
        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = FILENAME_PATTERN(i, isLightMode);
            imagesRef.current.push(img);
        }

        const render = () => {
            const img = imagesRef.current[Math.floor(videoSequence.current.frame)];
            if (!img || !img.complete) return;

            const isMobile = window.innerWidth < 768;
            const IMAGE_SCALE = isMobile ? 2.5 : 0.85; // Much bigger on mobile
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const imgWidth = img.width;
            const imgHeight = img.height;

            const ratio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * IMAGE_SCALE;

            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;

            // Offset to the right on desktop, but keep him more centered on mobile
            const xOffset = isMobile ? (canvasWidth * 0.05) : (canvasWidth * 0.20);
            const x = ((canvasWidth - newWidth) / 2) + xOffset;

            // Align closer to the top on mobile so his head doesn't get cut off when scaled 2.5x
            const y = isMobile ? (canvasHeight - newHeight) * 0.1 : (canvasHeight - newHeight) / 2;

            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);

            // Precision Chroma Key to remove the baked-in background
            try {
                const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
                const data = imageData.data;
                const len = data.length;

                // The convex hull algorithm caught noisy video compression artifacts, creating jagged polygon edges.
                // We are replacing it with a smooth "Elliptical Spatial Mask".
                // This draws a mathematical ellipse around his body. Inside the ellipse, we keep everything (saving dark hair/shadows).
                // Outside the ellipse, we aggressively erase the dark compression noise.

                for (let i = 0; i < len; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const px = (i / 4) % canvasWidth;
                    const py = Math.floor((i / 4) / canvasWidth);

                    // Skip pixels completely outside the drawn image
                    if (px < x || px > x + newWidth || py < y || py > y + newHeight) {
                        data[i + 3] = 0;
                        continue;
                    }

                    if (isLightMode) {
                        // Light Mode uses the 'v2w_light' frames which have a pure RGB white background.
                        // We knock out bright pixels. His body/clothing is dark, making this very clean.
                        const brightness = Math.max(r, g, b);
                        if (r > 240 && g > 240 && b > 240) {
                            // Pure white background
                            data[i + 3] = 0;
                        } else if (r > 210 && g > 210 && b > 210) {
                            // Smoothly anti-alias the halo transition around him
                            const blend = (240 - brightness) / 30; // 0 opacity at 240, full opacity near 210
                            data[i + 3] = Math.floor(Math.max(0, Math.min(1, blend)) * 255);
                        } else {
                            // Core body
                            data[i + 3] = 255;
                        }
                    } else {
                        // Dark Mode uses the 'v2w' frames which have noisy dark video compression artifacts.
                        // We use an Adaptive Luma Key to remove dark noise specifically at the spatial edges.
                        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                        const relX = (px - x) / newWidth; // 0.0 to 1.0 inside image

                        // Distance from vertical spine (X=0.5)
                        const distFromSpine = Math.abs(relX - 0.5);

                        // Adaptive Threshold: 20 at center (saves hair), 85 at edges (kills noise)
                        const threshold = 20 + Math.pow(distFromSpine * 2, 2) * 65;

                        if (luma < threshold) {
                            data[i + 3] = 0;
                        } else if (luma > threshold + 15) {
                            data[i + 3] = 255;
                        } else {
                            data[i + 3] = Math.floor(((luma - threshold) / 15) * 255);
                        }
                    }
                }
                context.putImageData(imageData, 0, 0);
            } catch (err) {
                // Silently bypass cross-origin errors if loaded from external CDN
            }
        };

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        // Lenis implementation
        const lenis = new Lenis();
        const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        if (imagesRef.current.length > 0) {
            imagesRef.current[0].onload = render;
        }

        // --- Master GSAP Timeline ---
        const isMobileDevice = window.innerWidth < 768;
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: isMobileDevice ? "+=200%" : "+=300%", // Shorter pin for mobile to feel snappier
                pin: true,
                scrub: 1,
            }
        });

        // 1. Play the image sequence
        tl.to(videoSequence.current, {
            frame: FRAME_COUNT - 1,
            snap: "frame",
            ease: "none",
            onUpdate: render,
            duration: 10,
        }, 0);

        // 2. Horizontal text scrolling left
        tl.fromTo(horizontalTextRef.current, {
            x: "0vw",
        }, {
            x: isMobileDevice ? "-180vw" : "-180vw", // Use a consistent relative offset
            ease: "none",
            duration: 10,
        }, 0);

        // 4. Reveal the vertical text from the bottom
        tl.to(verticalTextRef.current, {
            y: 0,
            opacity: 1,
            duration: 3,
            ease: "power2.out",
        }, 7);

        // Removed trailing empty tween so scrolling returns to the main page immediately

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            lenis.destroy();
            tl.kill();
            ScrollTrigger.refresh();
        };
    }, [isLightMode]);

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-white dark:bg-black border-y border-gold/20 shadow-2xl overflow-hidden mt-16">
            {/* Horizontal scrolling text layer (placed high, background z-0) */}
            <div className="absolute top-[15%] md:top-[35%] w-[200vw] h-24 flex items-center pointer-events-none z-0">
                <h2
                    ref={horizontalTextRef}
                    className="text-black/5 font-display font-bold text-6xl md:text-[12rem] whitespace-nowrap tracking-widest pl-[80vw] md:pl-[100vw]"
                >
                    <span className="text-gold font-bold uppercase tracking-[0.2em] text-3xl md:text-[8rem] align-middle mr-8 md:mr-16">24/7 Response</span>
                    Recovery.
                </h2>
            </div>

            {/* Canvas layer (z-10, above text) */}
            <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover z-10" />

            {/* Vertical scrolling content (placed at bottom, aligned left) */}
            <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-end items-start p-4 md:p-16 pb-[8vh] md:pb-[10vh] pointer-events-none z-20">
                <div
                    ref={verticalTextRef}
                    className="max-w-xl md:max-w-2xl bg-white/90 backdrop-blur-md border border-gold/20 p-6 md:p-8 rounded-2xl transform translate-y-32 opacity-0 shadow-2xl shadow-black/10"
                >
                    <h3 className="text-xl md:text-3xl text-gray-900 font-display mb-3 md:mb-4 leading-tight">
                        Emergency Breakdown Recovery Available 24/7
                        <br />
                        <span className="text-lg md:text-xl text-muted-foreground mt-4 block font-sans font-medium">Vehicle trouble doesn't stick to business hours. Whether you're stuck at home or on the roadside, our verified breakdown recovery partners are just a tap away.</span>
                    </h3>

                    <ul className="space-y-4 mt-8">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0 bg-gold/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className="text-gray-900 text-sm md:text-base font-semibold">
                                    {item}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
