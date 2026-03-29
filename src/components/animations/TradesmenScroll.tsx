import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const FILENAME_PATTERN = (index: number) => `/frames/v2w_dark/frame_${index.toString().padStart(4, '0')}.webp`;

/**
 * Aligning with docs/skills/video-to-website.md:
 * - FRAME_COUNT: 192
 * - IMAGE_SCALE: ~0.85 (Desktop) / 2.5 (Mobile)
 * - Canvas frame speed/render loop managed via GSAP & Lenis
 */

const listItems = [
    "Get seen first with priority ranking in your area",
    "Build instant trust with a 'Featured' badge and reviews",
    "Receive direct calls, not messages or time-wasters",
    "Reach customers ready to act, not just browsing",
    "No ads to manage. No chasing leads. Just calls."
];

// Removed useTheme from here as we use props for stability

export function TradesmenScroll() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalTextRef = useRef<HTMLHeadingElement>(null);
    const verticalTextRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const videoSequence = useRef({ frame: 0 });
    const imagesRef = useRef<HTMLImageElement[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d', { willReadFrequently: true });
        const container = containerRef.current;
        if (!canvas || !context || !container) return;

        const isMobileDevice = window.innerWidth < 768;

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
            const IMAGE_SCALE = isMobile ? 2.5 : 0.85;
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const imgWidth = img.width;
            const imgHeight = img.height;

            const ratio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * IMAGE_SCALE;

            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;

            // Offset to the left so he's not behind the scrolling text
            const x = ((canvasWidth - newWidth) / 2) - (canvasWidth * (isMobile ? 0.05 : 0.15));
            const y = (canvasHeight - newHeight) / 2;

            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);

            try {
                const drawX = Math.max(0, Math.floor(x) - 10);
                const drawY = Math.max(0, Math.floor(y) - 10);
                const drawW = Math.min(canvasWidth - drawX, Math.ceil(newWidth) + 20);
                const drawH = Math.min(canvasHeight - drawY, Math.ceil(newHeight) + 20);

                const imageData = context.getImageData(drawX, drawY, drawW, drawH);
                const data = imageData.data;

                const subRowBounds = new Array(drawH).fill(null).map(() => ({ min: drawW, max: 0 }));

                for (let py = 0; py < drawH; py++) {
                    const rowOffset = py * drawW * 4;
                    for (let px = 0; px < drawW; px++) {
                        const i = rowOffset + (px * 4);
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                        // Local dist from spine relative to drawW
                        const localRelX = px / drawW;
                        const distFromSpine = Math.abs(localRelX - 0.5);

                        // Professional Smoothed Alpha Ramp
                        // luma < 4: transparent
                        // luma 4-12: ramp alpha (multiplied by 2 for snappier reveal but soft edge)
                        // luma > 12: solid
                        if (luma > 4) {
                            if (luma < 12) {
                                data[i + 3] = Math.min(255, (luma - 4) * 32);
                            } else {
                                data[i + 3] = 255;
                            }

                            // Only count pixels for occlusion near the core (center) to avoid hair/edge noise
                            if (distFromSpine < 0.42 && luma > 10) {
                                if (px < subRowBounds[py].min) subRowBounds[py].min = px;
                                if (px > subRowBounds[py].max) subRowBounds[py].max = px;
                            }
                        } else {
                            data[i + 3] = 0;
                        }
                    }
                }

                // Fill Silhouette for perfect occlusion
                for (let py = 0; py < drawH; py++) {
                    const { min, max } = subRowBounds[py];
                    // Ensure it's a valid body segment (wider than noise)
                    if (max > min && (max - min) > (drawW * 0.05) && (max - min) < (drawW * 0.95)) {
                        const dMin = Math.max(0, min - 2);
                        const dMax = Math.min(drawW - 1, max + 2);
                        const rowOffset = py * drawW * 4;
                        for (let px = dMin; px <= dMax; px++) {
                            // Only set alpha for occlusion, preserve RGB
                            data[rowOffset + px * 4 + 3] = 255;
                        }
                    }
                }

                context.putImageData(imageData, drawX, drawY);
            } catch (err) {
                // Ignore cross-origin
            }
        };

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

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
        const lenis = (window as any).lenis;

        // Ensure ScrollTrigger is aware of layout after mount
        ScrollTrigger.refresh();

        if (imagesRef.current.length > 0) {
            imagesRef.current[0].onload = () => {
                render();
                ScrollTrigger.refresh();
            };
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: isMobileDevice ? "+=200%" : "+=300%",
                pin: true, 
                pinType: "fixed",
                scrub: 1,
                anticipatePin: 1.5,
                preventOverlaps: true,
                fastScrollEnd: true,
                refreshPriority: 5, // Calculate after RoadsideScroll
            }
        });

        tl.to(videoSequence.current, {
            frame: FRAME_COUNT - 1,
            ease: "none",
            onUpdate: render,
            duration: 10,
        }, 0);

        tl.fromTo(horizontalTextRef.current, {
            x: "0vw",
        }, {
            x: "-180vw",
            ease: "none",
            duration: 10,
        }, 0);

        // Reveal the vertical text and list items with unified timing (very late reveal)
        // Reveal further down by increasing delay to 9.2 (near 10-sec end)
        tl.to(verticalTextRef.current, {
            y: 0,
            opacity: 1,
            duration: 2,
            ease: "power2.out",
        }, 9.2);

        if (listRef.current) {
            tl.fromTo(listRef.current.children, {
                y: 20,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 1.5,
                ease: "power2.out"
            }, 9.6);
        }

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            tl.kill();
            ScrollTrigger.refresh();
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black border-y border-gold/20 shadow-2xl overflow-hidden md:mt-16 mx-auto max-w-[98%] rounded-2xl md:rounded-[3rem] will-change-transform flex flex-col items-center justify-center pt-[12vh] md:pt-0 z-0">
            {/* Horizontal scrolling text layer (placed high, background z-0) - Hidden on mobile */}
            <div className="absolute top-[20%] md:top-[12%] w-[300vw] h-24 hidden md:flex items-center pointer-events-none z-0">
                <h2
                    ref={horizontalTextRef}
                    className="text-white/90 font-display font-bold text-[8rem] md:text-[18rem] whitespace-nowrap tracking-widest pl-[100vw]"
                >
                    <span className="text-gold font-bold uppercase tracking-[0.2em] text-[5rem] md:text-[8rem] align-middle mr-16">For {window.location.port === '3001' || window.location.hostname.includes('contractors') ? 'Contractors' : 'Tradesmen'}</span>
                    Get Seen, Get Hired.
                </h2>
            </div>

            {/* Canvas layer (z-10, above text) */}
            <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover z-10" />

            {/* Vertical scrolling content (placed at middle-side on desktop, bottom on mobile) */}
            <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-end md:justify-center items-center md:items-end p-6 md:p-16 md:pr-[8%] md:pr-[12%] pb-[12vh] md:pb-0 pointer-events-none z-20">
                <div
                    ref={verticalTextRef}
                    className="max-w-[92vw] md:max-w-xl bg-black/60 backdrop-blur-md border border-gold/20 p-5 md:p-8 rounded-2xl transform translate-y-32 opacity-0 shadow-2xl shadow-black/50"
                >
                    <h3 className="text-xl md:text-4xl text-white font-display mb-3 md:mb-4 leading-tight">
                        Stop chasing leads.
                        <br />
                        <span className="text-base md:text-2xl text-gold mt-1 md:mt-2 block font-medium">Join our verified network and get direct calls from customers.</span>
                    </h3>

                    <ul ref={listRef} className="space-y-2 md:space-y-4 mt-4 md:mt-8">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 md:gap-3">
                                <div className="mt-1 w-4 h-4 md:w-5 md:h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0 bg-gold/10">
                                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gold" />
                                </div>
                                <p className={i === listItems.length - 1 ? "text-white font-bold text-sm md:text-lg" : "text-white/80 text-xs md:text-base font-medium"}>
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
