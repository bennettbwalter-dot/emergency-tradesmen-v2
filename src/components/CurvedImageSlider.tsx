import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

interface CurvedImageSliderProps {
    images?: string[];
    autoScrollInterval?: number; // milliseconds
    className?: string;
}

const DEFAULT_IMAGES = [
    '/images/tradespeople/electrician-fuse-box.png',
    '/images/tradespeople/plumber-radiator.png',
    '/images/tradespeople/electrician-light.png',
    '/images/tradespeople/tradesperson-attic.png',
    '/images/tradespeople/electrician-wiring.jpg',
    '/images/tradespeople/electrician-light-install.png',
    '/images/tradespeople/joiner-flooring.png',
    '/images/tradespeople/gas-engineer-boiler.png',
    '/images/tradespeople/plumber-radiator-repair.jpg',
    '/images/tradespeople/electrician-attic.jpg',
    '/images/tradespeople/electrician-smoke-alarm.png',
    '/images/tradespeople/plumber-sink.png',
    '/images/tradespeople/gas-engineer-green-jacket.png',
    '/images/tradespeople/plumber-bathtub.png',
    '/images/tradespeople/electrician-socket-repair.png',
    '/images/tradespeople/plumber-cupboard.jpg',
    '/images/tradespeople/plumber-radiator-bleed.png',
    '/images/tradespeople/gas-engineer-boiler-check.png',
    '/images/tradespeople/joiner-skirting.png',
    '/images/tradespeople/plumber-bathroom-sink.png',
];

export function CurvedImageSlider({
    images = DEFAULT_IMAGES,
    autoScrollInterval = 3000,
    className = ""
}: CurvedImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Motion values for smooth dragging
    const x = useMotionValue(0);
    const smoothX = useSpring(x, { stiffness: 300, damping: 30 });

    // Auto-scroll effect
    useEffect(() => {
        if (isPaused || isDragging) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, autoScrollInterval);

        return () => clearInterval(interval);
    }, [isPaused, isDragging, images.length, autoScrollInterval]);

    // Calculate position and scale for each image based on curved path
    const getImageStyles = (index: number) => {
        const totalImages = images.length;
        const relativeIndex = (index - currentIndex + totalImages) % totalImages;

        // Calculate position along a gentle arc
        // Center image (relativeIndex = 0) is at position 0
        // Create positions for visible range (-2 to +2)
        const normalizedPosition = relativeIndex - Math.floor(totalImages / 2);

        // Horizontal spacing
        const baseSpacing = 280; // pixels between images
        const xPosition = normalizedPosition * baseSpacing;

        // Create subtle arc curve (parabolic path)
        const arcIntensity = 20; // subtle arc, not extreme
        const yPosition = Math.pow(normalizedPosition, 2) * arcIntensity;

        // Scale: center is larger (1.0), sides scale down
        const distance = Math.abs(normalizedPosition);
        const scale = Math.max(0.7, 1 - distance * 0.15);

        // Opacity: fade out distant images
        const opacity = Math.max(0.3, 1 - distance * 0.2);

        // Z-index: center image on top
        const zIndex = 10 - distance;

        return {
            x: xPosition,
            y: yPosition,
            scale,
            opacity,
            zIndex,
        };
    };

    const handleDragEnd = (_event: any, info: any) => {
        setIsDragging(false);
        const threshold = 50;

        if (info.offset.x > threshold) {
            // Dragged right - go to previous
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        } else if (info.offset.x < -threshold) {
            // Dragged left - go to next
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }

        // Reset position
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[400px] md:h-[500px] overflow-hidden ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Images container */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x: smoothX }}
            >
                {images.map((image, index) => {
                    const styles = getImageStyles(index);

                    return (
                        <motion.div
                            key={`${image}-${index}`}
                            className="absolute"
                            initial={false}
                            animate={{
                                x: styles.x,
                                y: styles.y,
                                scale: styles.scale,
                                opacity: styles.opacity,
                                zIndex: styles.zIndex,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 25,
                                mass: 0.8,
                            }}
                            style={{
                                width: '280px',
                                height: '360px',
                            }}
                        >
                            <div
                                className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                                style={{
                                    boxShadow: `
                    0 20px 60px -15px rgba(0, 0, 0, 0.4),
                    0 10px 30px -10px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.05)
                  `,
                                }}
                            >
                                <img
                                    src={image}
                                    alt={`Tradesperson at work ${index + 1}`}
                                    className="w-full h-full object-cover select-none"
                                    draggable={false}
                                    loading="lazy"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Navigation dots */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === currentIndex
                                ? 'bg-gold w-8'
                                : 'bg-white/30 hover:bg-white/50'
                            }
            `}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Gradient overlays for depth */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
    );
}
