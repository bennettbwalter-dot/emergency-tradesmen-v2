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

                const leftMargins = new Int32Array(canvasHeight).fill(canvasWidth);
                const rightMargins = new Int32Array(canvasHeight).fill(0);

                // Start searching inward from 15% to bypass outer edge compression noise
                const startX = Math.floor(x + newWidth * 0.15);
                const endX = Math.floor(x + newWidth * 0.85);
                const minY = Math.floor(y);
                const maxY = Math.floor(y + newHeight);

                // Pass 1: Row by row margin detection
                for (let py = Math.max(0, minY); py < Math.min(canvasHeight, maxY); py++) {
                    let foundLeft = false;
                    let consecutiveLeft = 0;

                    // Scan left-to-right to find left solid edge
                    for (let px = startX; px <= endX; px++) {
                        const i = (py * canvasWidth + px) * 4;
                        if (data[i] > 18 || data[i + 1] > 18 || data[i + 2] > 18) {
                            consecutiveLeft++;
                            if (consecutiveLeft >= 2) {
                                leftMargins[py] = px - 1;
                                foundLeft = true;
                                break;
                            }
                        } else {
                            consecutiveLeft = 0;
                        }
                    }

                    if (foundLeft) {
                        let consecutiveRight = 0;
                        // Scan right-to-left to find right solid edge
                        for (let px = endX; px >= startX; px--) {
                            const i = (py * canvasWidth + px) * 4;
                            if (data[i] > 18 || data[i + 1] > 18 || data[i + 2] > 18) {
                                consecutiveRight++;
                                if (consecutiveRight >= 2) {
                                    rightMargins[py] = px + 1;
                                    break;
                                }
                            } else {
                                consecutiveRight = 0;
                            }
                        }
                    } else if (py > minY + newHeight * 0.4) {
                        // If we are deep into the body but it's completely black (shadows/fades),
                        // enforce a solid central pillar so the text doesn't poke through his lower half.
                        leftMargins[py] = Math.floor(x + newWidth * 0.35);
                        rightMargins[py] = Math.floor(x + newWidth * 0.65);
                    }
                }

                // Pass 2: Apply the hull mask. 
                // Everything outside the bounds is erased. Everything inside is preserved 100% opaque.
                for (let py = 0; py < canvasHeight; py++) {
                    const left = leftMargins[py] - 5; // Expand buffer outward to capture soft hair tips
                    const right = rightMargins[py] + 5;
                    for (let px = 0; px < canvasWidth; px++) {
                        const i = (py * canvasWidth + px) * 4;
                        if (px < left || px > right) {
                            data[i + 3] = 0; // Pure transparent background
                        } else {
                            // Inside tradesman! No holes, no gaps, no bleeding text.
                            // Even if it's pure black gap from an armpit, it stays opaque and blocks text.
                            data[i + 3] = 255;
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
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-white dark:bg-black border-y border-gold/20 shadow-2xl overflow-hidden">
            {/* Horizontal scrolling text layer (placed high, background z-0) */}
            <div className="absolute top-[15%] md:top-[35%] w-[200vw] h-24 flex items-center pointer-events-none z-0">
                <h2
                    ref={horizontalTextRef}
                    className="text-black/10 dark:text-white/90 font-display font-bold text-6xl md:text-[12rem] whitespace-nowrap tracking-widest pl-[80vw] md:pl-[100vw]"
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
                    className="max-w-xl md:max-w-2xl bg-white/90 dark:bg-[#090909]/90 backdrop-blur-md border border-gold/20 p-6 md:p-8 rounded-2xl transform translate-y-32 opacity-0 shadow-2xl shadow-black/10 dark:shadow-black/50"
                >
                    <h3 className="text-xl md:text-3xl text-gray-900 dark:text-white font-display mb-3 md:mb-4 leading-tight">
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
                                <p className={i === listItems.length - 1 ? "text-gray-900 dark:text-white font-bold text-base md:text-lg" : "text-gray-700 dark:text-white/80 text-sm md:text-base font-medium"}>
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
