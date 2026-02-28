import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    X,
    HelpCircle,
    MessageSquare,
    Wrench,
    Mic,
    Send,
    Zap,
    Users,
    Newspaper
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

interface TourStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    desktopOnly?: boolean;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'tour-chat-input',
        title: 'Describe Your Emergency',
        description: "Start here. Tell us what's happening in plain English — \"My boiler is leaking\" or \"Power cut in my kitchen.\" Our AI dispatcher will take it from there.",
        icon: <MessageSquare className="w-6 h-6 text-gold" />,
    },
    {
        id: 'tour-selectors',
        title: 'The Matchmaker',
        description: "Know exactly what you need? Use the Trade dropdown to pick your expert, and the City selector to narrow it down to your area — or tap 'Locate Me' for instant GPS matching.",
        icon: <Wrench className="w-6 h-6 text-gold" />,
    },
    {
        id: 'tour-mic-button',
        title: 'Hands-Free Help',
        description: "Working with your hands? Tap the Microphone to speak your request. We'll transcribe it instantly so you don't have to type while handling a leak.",
        icon: <Mic className="w-6 h-6 text-gold" />,
    },
    {
        id: 'tour-send-button',
        title: 'Launch Your Request',
        description: "You're all set! Hit Send to dispatch help. Once your trade and location are locked in, this button lights up gold — one tap to connect.",
        icon: <Send className="w-6 h-6 text-gold" />,
    },
    {
        id: 'tour-services',
        title: 'Quick Access Trades',
        description: "Scroll down and you'll see our trade cards. Just tap any image to instantly find verified tradesmen in that category — it's the fastest way to get connected.",
        icon: <Zap className="w-6 h-6 text-gold" />,
    },
    {
        id: 'tour-signup',
        title: 'Join Our Network',
        description: "Are you a qualified tradesperson? Sign up to join our verified network. Get matched with local emergency jobs, build your reputation, and grow your business.",
        icon: <Users className="w-6 h-6 text-gold" />,
    },
    {
        id: 'tour-blog-link',
        title: 'The Knowledge Hub',
        description: "Knowledge is power. Browse 'The Dispatch' for DIY safety tips, trade secrets, and preventative maintenance guides to keep your home running smoothly.",
        icon: <Newspaper className="w-6 h-6 text-gold" />,
    },
];

export function FloatingTourHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const isMobile = useIsMobile();
    const location = useLocation();
    const stepRef = useRef<number>(0);

    // Filter steps based on device — desktop-only steps are excluded on mobile
    const activeSteps = React.useMemo(() => {
        if (isMobile) return TOUR_STEPS.filter(s => !s.desktopOnly);
        return TOUR_STEPS;
    }, [isMobile]);

    // Initialize tour check
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const forceTour = urlParams.get('tour') === 'true';
        const hasCompleted = localStorage.getItem('et-tour-completed');

        if (forceTour) {
            console.log("[FloatingTourHub] Force starting tour via URL");
            // Clean up the URL so it doesn't trigger on every route change
            window.history.replaceState({}, document.title, window.location.pathname);
            // Reset Completion status
            localStorage.removeItem('et-tour-completed');
            setCurrentStep(0);
            setIsOpen(true);
            setIsVisible(false);
            return;
        }

        if (!hasCompleted) {
            // Delay start for better UX
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true); // Show help button if tour was already completed
        }
    }, [location.search]);

    const requestRef = useRef<number>();

    // Helper: find the VISIBLE element for a tour step
    // On mobile, desktop elements are hidden (display:none / hidden class) 
    // and querySelector returns them first. This checks all matches and
    // picks the one that actually has non-zero dimensions on screen.
    const findVisibleTourElement = useCallback((tourId: string): Element | null => {
        const elements = document.querySelectorAll(`[data-tour="${tourId}"]`);
        if (elements.length === 0) return null;
        if (elements.length === 1) return elements[0];

        // Multiple matches: find the one that's actually visible
        for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                return el;
            }
        }
        // Fallback to first if none are visible (shouldn't happen)
        return elements[0];
    }, []);

    const syncRect = useCallback(() => {
        const step = activeSteps[stepRef.current];
        const element = findVisibleTourElement(step.id);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Skip zero-size rects (element is hidden)
            if (rect.width > 0 && rect.height > 0) {
                setTargetRect((prev) => {
                    if (!prev ||
                        prev.top !== rect.top ||
                        prev.left !== rect.left ||
                        prev.width !== rect.width ||
                        prev.height !== rect.height) {
                        return rect;
                    }
                    return prev;
                });
            }
        }
        requestRef.current = requestAnimationFrame(syncRect);
    }, [findVisibleTourElement, activeSteps]);

    // Update rect on step change and handle initial scroll
    useEffect(() => {
        if (isOpen) {
            stepRef.current = currentStep;

            // Initial scroll for the new step
            const step = activeSteps[currentStep];
            const element = findVisibleTourElement(step.id);
            if (element) {
                // Small delay ensures DOM is ready before scrolling
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }, 100);
            }

            // Start the continuous tracking loop
            requestRef.current = requestAnimationFrame(syncRect);

            return () => {
                if (requestRef.current) {
                    cancelAnimationFrame(requestRef.current);
                }
            };
        }
    }, [isOpen, currentStep, syncRect, findVisibleTourElement]);

    const handleNext = () => {
        if (currentStep < activeSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsOpen(false);
        localStorage.setItem('et-tour-completed', 'true');
        setIsVisible(true);
    };

    const handleSkip = () => {
        handleComplete();
    };

    const startTour = () => {
        setCurrentStep(0);
        setIsOpen(true);
        setIsVisible(false);
    };

    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[9998] pointer-events-none">
                        {/* Spotlight Overlay (4-div mask for 100% reliable mobile browser support) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            {targetRect ? (
                                <>
                                    <div className="absolute top-0 left-0 right-0 bg-black/80 pointer-events-auto" style={{ height: Math.max(0, targetRect.top - 6) }} onClick={handleSkip} />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 pointer-events-auto" style={{ top: targetRect.bottom + 6 }} onClick={handleSkip} />
                                    <div className="absolute bg-black/80 pointer-events-auto" style={{ top: Math.max(0, targetRect.top - 6), height: targetRect.height + 12, left: 0, width: Math.max(0, targetRect.left - 6) }} onClick={handleSkip} />
                                    <div className="absolute bg-black/80 pointer-events-auto" style={{ top: Math.max(0, targetRect.top - 6), height: targetRect.height + 12, left: targetRect.right + 6, right: 0 }} onClick={handleSkip} />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-black/80 pointer-events-auto" onClick={handleSkip} />
                            )}
                        </motion.div>

                        {/* Pulsing Highlight Border */}
                        <AnimatePresence>
                            {targetRect && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        left: targetRect.left - 4,
                                        top: targetRect.top - 4,
                                        width: targetRect.width + 8,
                                        height: targetRect.height + 8,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        damping: 25,
                                        stiffness: 200,
                                    }}
                                    className="absolute z-[9999] pointer-events-none rounded-2xl border-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.8),inset_0_0_10px_rgba(212,175,55,0.4)]"
                                >
                                    <motion.div
                                        animate={{
                                            opacity: [0.3, 0.6, 0.3],
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute -inset-2 rounded-[inherit] border border-gold/50 blur-sm"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tooltip Card */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    left: isMobile ? '50%' : (targetRect ? Math.min(Math.max(20, targetRect.left - (400 - targetRect.width) / 2), winW - 420) : '50%'),
                                    top: isMobile
                                        ? (targetRect && targetRect.top > winH / 2 ? 32 : 'auto')
                                        : (targetRect ? (targetRect.bottom + 20 > winH - 300 ? Math.max(20, targetRect.top - 280) : targetRect.bottom + 20) : '50%'),
                                    bottom: isMobile
                                        ? (targetRect && targetRect.top > winH / 2 ? 'auto' : 32)
                                        : 'auto',
                                    translateX: isMobile ? '-50%' : 0
                                }}
                                className="pointer-events-auto absolute w-[calc(100%-32px)] md:w-full max-w-[400px] bg-black/95 backdrop-blur-2xl border border-gold/50 rounded-3xl p-5 md:p-6 shadow-[0_0_50px_rgba(212,175,55,0.25)]"
                            >
                                <div className="flex items-start justify-between mb-4 md:mb-5">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                                            {activeSteps[currentStep].icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-xs font-mono font-bold text-gold uppercase tracking-widest mb-0.5">
                                                Step {currentStep + 1} of {activeSteps.length}
                                            </p>
                                            <h3 className="text-lg md:text-xl font-display font-bold text-white leading-tight">
                                                {activeSteps[currentStep].title}
                                            </h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSkip}
                                        className="text-white/40 hover:text-white transition-colors p-1"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 md:mb-8 font-light">
                                    {activeSteps[currentStep].description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1.5 md:gap-2">
                                        {activeSteps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-5 md:w-6 bg-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'w-1.5 bg-white/20'}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {currentStep > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleBack}
                                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm"
                                            >
                                                <ChevronLeft className="w-4 h-4 md:mr-1" />
                                                <span className="hidden sm:inline">Back</span>
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            onClick={handleNext}
                                            className="bg-gold text-black hover:bg-gold/90 font-bold rounded-full h-9 md:h-10 px-4 md:px-6 shadow-[0_0_15px_rgba(212,175,55,0.3)] text-xs md:text-sm"
                                        >
                                            {currentStep === activeSteps.length - 1 ? 'Finish' : 'Next'}
                                            {currentStep < activeSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-0.5 md:ml-1" />}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Re-trigger Button */}
            <AnimatePresence>
                {isVisible && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="fixed bottom-6 right-6 z-[9990] md:bottom-8 md:right-8"
                    >
                        <Button
                            onClick={startTour}
                            className="group h-12 px-6 rounded-full bg-black/80 backdrop-blur-md border border-gold/30 hover:border-gold text-white shadow-lg hover:shadow-gold/20 transition-all flex items-center gap-3"
                        >
                            <div className="relative">
                                <HelpCircle className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full animate-ping" />
                            </div>
                            <span className="font-display font-bold tracking-wide text-sm">Need Help?</span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
