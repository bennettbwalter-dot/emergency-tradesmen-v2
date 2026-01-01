import React, { useState, useRef, useEffect } from 'react';
import { trades } from '@/lib/trades';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function StackedTradeSelector() {
    const [index, setIndex] = useState(0);
    const [dragDX, setDragDX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { setDetectedTrade, detectedCity } = useChatbot();

    // Drag state refs
    const dragStartX = useRef(0);
    const dragCurrentDX = useRef(0);
    const isClickRef = useRef(false);

    const handleNext = () => {
        setIndex((prev) => (prev + 1) % trades.length);
        setDragDX(0);
    };

    const handlePrev = () => {
        setIndex((prev) => (prev - 1 + trades.length) % trades.length);
        setDragDX(0);
    };

    const handleCardClick = (i: number) => {
        const visualSlot = (i - index + trades.length) % trades.length;
        if (visualSlot === 0) {
            // Main card: open trade
            const trade = trades[i];
            setDetectedTrade(trade.slug);
            navigate(`/emergency-${trade.slug}/${detectedCity ? detectedCity.toLowerCase() : 'london'}`);
        } else {
            // Background card: move to front
            setIndex(i);
        }
    };

    // Pointer events
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
        dragCurrentDX.current = 0;
        isClickRef.current = true; // Assume click until moved
        stageRef.current?.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX.current;
        dragCurrentDX.current = dx;
        setDragDX(dx);

        if (Math.abs(dx) > 5) {
            isClickRef.current = false;
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        stageRef.current?.releasePointerCapture(e.pointerId);

        // If it was a small movement (click), handle it here to be reliable
        if (isClickRef.current) {
            // Find which card was clicked. We can use the event target or logic.
            // Since this listener is on the stage, we need to find the card element.
            // A simpler way is to let the onClick handler on the card fire?
            // But if pointer capture swallows it...
            // Let's rely on standard onClick first, but if that fails, we can infer?
            // No, standard onClick usually works if we don't prevent default.
            // Let's just ensure we reset DragDX so onClick condition passes.
            setDragDX(0);
            return;
        }

        const threshold = 100;
        if (dragDX > threshold) {
            handlePrev();
        } else if (dragDX < -threshold) {
            handleNext();
        } else {
            setDragDX(0);
        }
    };

    return (
        <section className="et-stack-section" aria-label="Quick Trade Picker" style={{ overflow: 'visible' }}>
            <div className="et-stack-wrap" style={{ maxWidth: '1600px', overflow: 'visible' }}>


                <div
                    className="et-stack-stage"
                    ref={stageRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{ height: '1200px', touchAction: 'pan-y' }}
                >
                    {trades.map((trade, i) => {
                        let visualSlot = (i - index + trades.length) % trades.length;
                        const slot = visualSlot;
                        const zIndex = 100 - slot;

                        // Coordinates
                        const backPositions = [
                            { x: 0, y: 0, r: 0 },
                            { x: 0, y: -600, r: 0 },
                            { x: 0, y: 600, r: 0 },
                            { x: -520, y: -200, r: 0 },
                            { x: -520, y: 200, r: 0 },
                            { x: 520, y: -200, r: 0 },
                            { x: 520, y: 200, r: 0 },
                        ];

                        const pos = backPositions[visualSlot] || { x: 0, y: 0, r: 0 };
                        const translateY = pos.y;
                        const translateX = pos.x;
                        const translateZ = slot === 0 ? 0 : -200;
                        const rotate = pos.r;

                        // Drag rotation effect - Restored to give "alive" feel
                        const isFront = slot === 0;
                        const dragRot = isFront ? (dragDX * 0.05) : 0;
                        const dragXVal = isFront ? dragDX : 0;

                        const scale = slot === 0 ? 1 : 0.85;
                        const opacity = 1;
                        const blur = 0;

                        // Back card images
                        const backCardImages: Record<string, string> = {
                            'plumber': '/back-cards/plumber-back.png',
                            'drain-specialist': '/back-cards/drain-specialist-back.png',
                            'gas-engineer': '/back-cards/gas-engineer-back.png',
                            'locksmith': '/back-cards/locksmith-back.png',
                            'electrician': '/back-cards/electrician-back.png',
                            'glazier': '/back-cards/glazier-back.png',
                            'breakdown': '/back-cards/breakdown-back.png',
                        };

                        const hasCustomBack = !!backCardImages[trade.slug];
                        const targetImage = (slot === 0) ? trade.image : (backCardImages[trade.slug] || trade.image);
                        const showOverlayText = (slot === 0) || !hasCustomBack;

                        const cardWidth = isFront ? '360px' : '640px';
                        const cardHeight = isFront ? '640px' : '360px';

                        const style = {
                            zIndex,
                            opacity,
                            width: cardWidth,
                            height: cardHeight,
                            filter: `blur(${blur}px)`,
                            transform: `translateX(${dragXVal + translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${dragRot}deg) rotateZ(${rotate}deg) scale(${scale})`,
                            background: slot === 0 ? undefined : 'transparent',
                            boxShadow: slot === 0 ? undefined : 'none',
                            border: slot === 0 ? undefined : 'none',
                            // Transition: Disabled during drag for responsiveness, enabled otherwise for smooth flip
                            transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                            cursor: 'pointer', // Explicit pointer cursor
                        };

                        return (
                            <div
                                key={trade.slug}
                                className="et-stack-card"
                                role="button"
                                tabIndex={0}
                                aria-label={`Select ${trade.name}`}
                                style={style as any}
                                onClick={(e) => {
                                    // Use the ref to allow clicking even if small drag occurred
                                    if (isClickRef.current || Math.abs(dragDX) < 5) {
                                        e.stopPropagation();
                                        handleCardClick(i);
                                    }
                                }}
                            >
                                <div
                                    className="et-stack-img"
                                    style={{
                                        backgroundImage: `url('${targetImage}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />
                                <div className="et-stack-overlay" />

                                {showOverlayText && (
                                    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-start gap-4 p-6 w-full bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pointer-events-none">
                                        <div className="flex items-start justify-between w-full gap-4">
                                            <h3 className="font-display text-2xl md:text-3xl text-slate-900 tracking-wide leading-tight drop-shadow-sm text-left">
                                                Emergency <br />{trade.name}
                                            </h3>
                                            {trade.vectorIcon && (
                                                <img
                                                    src={trade.vectorIcon}
                                                    alt=""
                                                    className="w-10 h-10 object-contain drop-shadow-sm shrink-0"
                                                />
                                            )}
                                        </div>

                                        <div className="w-full flex items-center justify-between pt-4 border-t border-slate-200 mt-auto">
                                            <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-medium">
                                                Available 24/7
                                            </p>
                                            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 transition-colors pointer-events-auto">
                                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        className="et-stack-nav et-stack-nav-left"
                        type="button"
                        aria-label="Previous trade"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    >
                        ‹
                    </button>
                    <button
                        className="et-stack-nav et-stack-nav-right"
                        type="button"
                        aria-label="Next trade"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    >
                        ›
                    </button>
                </div>

                <div className="et-stack-hint" aria-hidden="true">
                    Drag / swipe to browse • Tap any card to select
                </div>
            </div>
        </section>
    );
}
