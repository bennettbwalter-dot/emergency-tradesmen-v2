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
    const bgRef = useRef<HTMLDivElement>(null);
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

            const IMAGE_SCALE = 0.85;
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const imgWidth = img.width;
            const imgHeight = img.height;

            const ratio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * IMAGE_SCALE;

            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;

            // Offset to the left so he's not behind the scrolling text
            const x = ((canvasWidth - newWidth) / 2) - (canvasWidth * 0.15);
            const y = (canvasHeight - newHeight) / 2;

            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);

            // Precision Chroma Key to remove the baked-in background
            try {
                const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
                const data = imageData.data;
                const len = data.length;

                // Sample the background color from the top-left of the drawn image
                const sampleX = Math.floor(x) + 10;
                const sampleY = Math.floor(y) + 10;

                // Ensure we don't read out of bounds
                if (sampleX >= 0 && sampleX < canvasWidth && sampleY >= 0 && sampleY < canvasHeight) {
                    const sampleIndex = (sampleY * canvasWidth + sampleX) * 4;
                    const bgR = data[sampleIndex];
                    const bgG = data[sampleIndex + 1];
                    const bgB = data[sampleIndex + 2];

                    // Only process if we successfully sampled a color
                    for (let i = 0; i < len; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];

                        // Strict tolerance matching exactly the sampled background corner
                        // This prevents bleeding through the tradesman's dark hair or clothing
                        if (Math.abs(r - bgR) <= 8 && Math.abs(g - bgG) <= 8 && Math.abs(b - bgB) <= 8) {
                            data[i + 3] = 0; // Set Alpha to 0 (Transparent)
                        }
                    }
                    context.putImageData(imageData, 0, 0);
                }
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
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "+=400%", // Shortened duration so the site reliably continues
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
            x: "-150vw", // Move horizontally far to the left
            ease: "none",
            duration: 10,
        }, 0);

        // 3. Darken the background slightly as we near the text
        tl.to(bgRef.current, {
            opacity: 0.8,
            duration: 4,
            ease: "power2.inOut",
        }, 4);

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
            <div className="absolute top-[20%] md:top-[12%] w-[200vw] h-24 flex items-center pointer-events-none z-0">
                <h2
                    ref={horizontalTextRef}
                    className="text-white/90 font-display font-bold text-[8rem] md:text-[12rem] whitespace-nowrap tracking-widest pl-[100vw]"
                >
                    <span className="text-gold font-bold uppercase tracking-[0.2em] text-[5rem] md:text-[8rem] align-middle mr-16">For Tradesmen</span>
                    Get Seen, Get Hired.
                </h2>
            </div>

            {/* Canvas layer (z-10, above text) */}
            <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover z-10" />

            {/* Darken overlay for better reading (z-20) */}
            <div ref={bgRef} className="absolute inset-0 bg-black opacity-0 pointer-events-none z-20" />

            {/* Vertical scrolling content (placed at bottom) */}
            <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-end p-6 md:p-16 pb-[10vh] pointer-events-none z-20">
                <div
                    ref={verticalTextRef}
                    className="max-w-2xl bg-[#090909]/80 backdrop-blur-md border border-gold/20 p-8 rounded-2xl transform translate-y-32 opacity-0 shadow-2xl shadow-black/50"
                >
                    <h3 className="text-2xl md:text-3xl text-white font-display mb-4 leading-tight">
                        Stop chasing leads.
                        <br />
                        <span className="text-xl md:text-2xl text-gold mt-2 block font-medium">Join our verified network and get direct calls from customers in your area who need help right now.</span>
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
