import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const FILENAME_PATTERN = (index: number) => `/frames/app_intro/frame_${index.toString().padStart(4, '0')}.webp`;

export function VideoIntroScroll() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLHeadingElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const videoSequence = useRef({ frame: 0 });
    const imagesRef = useRef<HTMLImageElement[]>([]);

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

        const render = () => {
            const img = imagesRef.current[Math.floor(videoSequence.current.frame)];
            if (!img || !img.complete) return;

            const isMobile = window.innerWidth < 768;
            const IMAGE_SCALE = isMobile ? 1.0 : 0.88; // Premium checklist: padded cover mode
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const imgWidth = img.width;
            const imgHeight = img.height;

            const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight) * IMAGE_SCALE;
            
            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;

            const x = (canvasWidth - newWidth) / 2;
            const y = (canvasHeight - newHeight) / 2;

            // Clear with a slightly off-black for premium feel, or auto-sample (simplified here)
            context.fillStyle = '#050505';
            context.fillRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);
        };

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        const lenis = new Lenis();
        const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        if (imagesRef.current.length > 0) {
            imagesRef.current[0].onload = render;
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "+=600%",
                pin: true,
                scrub: 1.5,
            }
        });

        // 1. Video sequence animation
        tl.to(videoSequence.current, {
            frame: FRAME_COUNT - 1,
            snap: "frame",
            ease: "none",
            onUpdate: render,
            duration: 10,
        }, 0);

        // 2. Horizontal Marquee (Premium checklist)
        tl.fromTo(marqueeRef.current, {
            x: "100%",
        }, {
            x: "-100%",
            ease: "none",
            duration: 10,
        }, 0);

        // 3. Staggered Reveals (Premium checklist)
        const revealElements = contentRef.current?.querySelectorAll('.reveal');
        if (revealElements) {
            tl.fromTo(revealElements, {
                y: 100,
                opacity: 0,
                clipPath: 'inset(100% 0% 0% 0%)'
            }, {
                y: 0,
                opacity: 1,
                clipPath: 'inset(0% 0% 0% 0%)',
                stagger: 0.5,
                duration: 2,
                ease: "power4.out"
            }, 5);
        }

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            lenis.destroy();
            tl.kill();
            ScrollTrigger.refresh();
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-[#050505] overflow-hidden">
            {/* Background Canvas */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-60" 
            />

            {/* Marquee Layer */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none z-10 overflow-hidden">
                <h2 
                    ref={marqueeRef}
                    className="font-display font-black text-[15vw] md:text-[20vw] leading-none text-white/5 whitespace-nowrap uppercase tracking-tighter"
                >
                    Premium Experience • Innovation • Emergency Services • 
                </h2>
            </div>

            {/* Content Overlay */}
            <div ref={contentRef} className="relative z-20 h-full flex flex-col justify-center items-center px-6 text-center">
                <div className="max-w-4xl">
                    <span className="reveal inline-block text-gold font-bold uppercase tracking-[0.3em] text-sm md:text-base mb-6">
                        Introducing
                    </span>
                    <h1 className="reveal font-display font-black text-6xl md:text-[12rem] leading-[0.9] text-white tracking-tighter mb-8">
                        THE NEXT <br /> GENERATION
                    </h1>
                    <p className="reveal text-lg md:text-2xl text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Redefining how tradesmen connect with emergency calls. Efficient, reliable, and premium.
                    </p>
                    <div className="reveal mt-12">
                        <button className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform duration-300">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505] opacity-40 pointer-events-none z-30" />
        </div>
    );
}
