import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Shield, Star, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const FILENAME_PATTERN = (index: number) => `/frames/v2w_dark/frame_${index.toString().padStart(4, '0')}.webp`;

interface TradesmenScrollProps {
    compact?: boolean;
}

export function TradesmenScroll({ compact = false }: TradesmenScrollProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const copyPanelRef = useRef<HTMLDivElement>(null);
    const visualPanelRef = useRef<HTMLDivElement>(null);
    const videoSequence = useRef({ frame: 0 });
    const imagesRef = useRef<HTMLImageElement[]>([]);

    const listItems = [
        "Get seen first with priority ranking in your area",
        "Build a clearer profile with a 'Featured' badge and reviews",
        "Receive direct calls, not messages or time-wasters",
        "Reach customers ready to act, not just browsing",
        "No ads to manage. No chasing leads. Just calls."
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d', { willReadFrequently: true });
        const canvasContainer = canvasContainerRef.current;
        const card = cardRef.current;
        const copyPanel = copyPanelRef.current;
        const visualPanel = visualPanelRef.current;
        if (!canvas || !context || !canvasContainer || !card) return;

        // Preload images
        imagesRef.current = [];
        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = FILENAME_PATTERN(i);
            imagesRef.current.push(img);
        }

        const render = () => {
            const img = imagesRef.current[Math.floor(videoSequence.current.frame)];
            if (!img || !img.complete || img.naturalWidth === 0) return;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const imgWidth = img.width;
            const imgHeight = img.height;

            // Scale to fill the local canvas container nicely (scale factor adjusted for side columns)
            const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight) * 1.05;

            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;

            // Align center-bottom so he stands on the card floor
            const x = (canvasWidth - newWidth) / 2;
            const y = canvasHeight - newHeight;

            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.drawImage(img, x, y, newWidth, newHeight);

            // Apply alpha mask to key out black background in real time
            try {
                const drawX = Math.max(0, Math.floor(x));
                const drawY = Math.max(0, Math.floor(y));
                const drawW = Math.min(canvasWidth - drawX, Math.ceil(newWidth));
                const drawH = Math.min(canvasHeight - drawY, Math.ceil(newHeight));

                const imageData = context.getImageData(drawX, drawY, drawW, drawH);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    if (luma > 4) {
                        if (luma < 12) {
                            data[i + 3] = Math.min(255, (luma - 4) * 32);
                        } else {
                            data[i + 3] = 255;
                        }
                    } else {
                        data[i + 3] = 0;
                    }
                }

                context.putImageData(imageData, drawX, drawY);
            } catch (err) {
                // Ignore cross-origin if local fails
            }
        };

        const updateCanvasSize = () => {
            if (!canvasContainer || !canvas) return;
            canvas.width = canvasContainer.clientWidth;
            canvas.height = canvasContainer.clientHeight;
            render();
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        if (imagesRef.current.length > 0) {
            imagesRef.current[0].onload = () => {
                render();
                ScrollTrigger.refresh();
            };
        }

        // GSAP scroll trigger bound locally to card scrolling
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: "top 82%",
                end: "bottom 12%",
                scrub: 0.5,
                refreshPriority: 5,
            }
        });

        tl.to(videoSequence.current, {
            frame: FRAME_COUNT - 1,
            ease: "none",
            onUpdate: render,
            duration: 10,
        }, 0);

        let revealTl: gsap.core.Timeline | undefined;
        if (copyPanel && visualPanel) {
            revealTl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: "top 82%",
                    end: "center 44%",
                    scrub: 0.65,
                    refreshPriority: 4,
                }
            });

            revealTl
                .fromTo(
                    visualPanel,
                    { autoAlpha: 0.2, x: -54, y: 28, scale: 0.965 },
                    { autoAlpha: 1, x: 0, y: 0, scale: 1, ease: "power2.out", duration: 1 },
                    0
                )
                .fromTo(
                    copyPanel,
                    { autoAlpha: 0.2, x: 54, y: 28, scale: 0.98 },
                    { autoAlpha: 1, x: 0, y: 0, scale: 1, ease: "power2.out", duration: 1 },
                    0.08
                );
        }

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            tl.kill();
            revealTl?.kill();
            ScrollTrigger.refresh();
        };
    }, []);

    return (
        <div 
            ref={cardRef} 
            className="landing-line-card landing-trades-card"
        >
            <div className="contents">
                {/* Left Side: Copy, Actions, and Feature List */}
                <div ref={copyPanelRef} className="landing-line-card__panel landing-trades-card__copy flex flex-col items-start text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d7c08a]/10 border border-[#d7c08a]/20 text-[#d7c08a] text-xs font-bold uppercase tracking-widest mb-4">
                        <Shield className="w-3.5 h-3.5 animate-pulse" />
                        PRO PLAN LISTINGS
                    </span>
                    
                    <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
                        Stop chasing leads.
                    </h3>
                    <p className="text-white/80 text-lg mb-6 leading-relaxed">
                        Claim your listing and get direct calls from customers in your area who are ready to hire.
                    </p>
                    
                    {/* List Items */}
                    <ul className="space-y-3 mb-8 w-full">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-left">
                                <CheckCircle2 className="w-5 h-5 text-[#d7c08a] mt-0.5 flex-shrink-0" />
                                <span className="text-white/85 text-sm md:text-base font-medium">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <Link 
                        to="/claim-your-business" 
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#caa55b] via-[#e2cd97] to-[#caa55b] text-black font-extrabold text-lg shadow-[0_10px_30px_rgba(202,165,91,0.25)] hover:shadow-[0_15px_40px_rgba(202,165,91,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto justify-center"
                    >
                        <span>CLAIM YOUR LISTING</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
                
                {/* Right Side: Responsive Canvas Container for the Interactive Scroll Man */}
                <div ref={visualPanelRef} className="landing-line-card__panel landing-trades-card__visual flex flex-col gap-5 w-full">
                    {/* Visual Card containing the Canvas */}
                    <div className="bg-[#18191e]/60 border border-white/5 rounded-3xl p-4 shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col items-center">
                        {/* Interactive Canvas Frame Container */}
                        <div 
                            ref={canvasContainerRef} 
                            className="w-full aspect-[4/5] max-h-[420px] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative"
                        >
                            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none" />
                            
                            {/* Inner ambient shadows and cues */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent z-30" />
                            <div className="absolute bottom-4 left-4 z-40 bg-black/60 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                                <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider">SCROLL TO ANIMATE</span>
                            </div>
                        </div>

                        {/* Miniature featured tag under canvas */}
                        <div className="w-full mt-4 flex items-center justify-between">
                            <div className="text-left">
                                <h4 className="font-bold text-white text-sm">John Doe Plumbing</h4>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <div className="flex text-amber-400">
                                        <Star className="w-3 h-3 fill-amber-400" />
                                        <Star className="w-3 h-3 fill-amber-400" />
                                        <Star className="w-3 h-3 fill-amber-400" />
                                        <Star className="w-3 h-3 fill-amber-400" />
                                        <Star className="w-3 h-3 fill-amber-400" />
                                    </div>
                                    <span className="text-white/50 text-[10px]">(48 reviews)</span>
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3 fill-emerald-400 animate-bounce" />
                                DIRECT CALL
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
