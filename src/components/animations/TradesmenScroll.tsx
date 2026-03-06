import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const FILENAME_PATTERN = (index: number) => `/frames/v2w/frame_${index.toString().padStart(4, '0')}.webp`;

const listItems = [
    "Get seen first with priority ranking in your area",
    "Build instant trust with a ‘Featured’ badge and reviews",
    "Receive direct calls, not messages or time-wasters",
    "Reach customers ready to act, not just browsing",
    "No ads to manage. No chasing leads. Just calls."
];

export function TradesmenScroll() {
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
            img.src = FILENAME_PATTERN(i);
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

                // The video frames have a consistent dark studio background color.
                // We don't need to dynamically sample it, which breaks when the image is scaled off-screen on mobile.

                for (let i = 0; i < len; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const px = (i / 4) % canvasWidth;
                    const py = Math.floor((i / 4) / canvasWidth);

                    // Skip pixels completely outside the drawn image area
                    if (px < x || px > x + newWidth || py < y || py > y + newHeight) {
                        continue;
                    }

                    const relX = (px - x) / newWidth; // 0.0 to 1.0 inside image
                    const relY = (py - y) / newHeight; // 0.0 to 1.0 inside image

                    // Spatial distance from spine/center of face
                    let dist = 1.0;
                    if (relY < 0.3) {
                        // Top hemisphere (head area)
                        dist = Math.sqrt(Math.pow(relX - 0.5, 2) + Math.pow((relY - 0.3) * 1.5, 2));
                    } else {
                        // Cylinder (body area)
                        dist = Math.abs(relX - 0.5);
                    }

                    // Map distance to an adaptive threshold
                    // Core tradesman (dist < 0.18): Threshold = 10 (Ultra-strict, saves his hair R=16)
                    // Outer background (dist > 0.40): Threshold = 65 (Loose, kills edge noise R=50)
                    let threshold = 65;
                    if (dist < 0.18) {
                        threshold = 10;
                    } else if (dist < 0.40) {
                        // Smoothly blend the threshold
                        const t = (dist - 0.18) / (0.40 - 0.18);
                        threshold = 10 + t * (65 - 10);
                    }

                    // If the pixel is darker than the spatial threshold, it's the background.
                    if (r < threshold && g < threshold && b < threshold) {
                        data[i + 3] = 0; // Remove background
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
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black border-y border-gold/20 shadow-2xl overflow-hidden">
            {/* Horizontal scrolling text layer (placed high, background z-0) */}
            <div className="absolute top-[60%] md:top-[55%] w-[200vw] h-24 flex items-center pointer-events-none z-0">
                <h2
                    ref={horizontalTextRef}
                    className="text-white/90 font-display font-bold text-6xl md:text-[12rem] whitespace-nowrap tracking-widest pl-[80vw] md:pl-[100vw]"
                >
                    <span className="text-gold font-bold uppercase tracking-[0.2em] text-3xl md:text-[8rem] align-middle mr-8 md:mr-16">For Tradesmen</span>
                    Get Seen.
                </h2>
            </div>

            {/* Canvas layer (z-10, above text) */}
            <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover z-10" />

            {/* Vertical scrolling content (placed at bottom, aligned left) */}
            <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-end items-start p-4 md:p-16 pb-[8vh] md:pb-[10vh] pointer-events-none z-20">
                <div
                    ref={verticalTextRef}
                    className="max-w-xl md:max-w-2xl bg-[#090909]/90 md:bg-[#090909]/80 backdrop-blur-md border border-gold/20 p-6 md:p-8 rounded-2xl transform translate-y-32 opacity-0 shadow-2xl shadow-black/50"
                >
                    <h3 className="text-xl md:text-3xl text-white font-display mb-3 md:mb-4 leading-tight">
                        Stop chasing leads.
                        <br />
                        <span className="text-lg md:text-2xl text-gold mt-1 md:mt-2 block font-medium">Join our verified network and get direct calls from customers.</span>
                    </h3>

                    <ul className="space-y-4 mt-8">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0 bg-gold/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className={i === listItems.length - 1 ? "text-white font-bold text-base md:text-lg" : "text-white/80 text-sm md:text-base font-medium"}>
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
