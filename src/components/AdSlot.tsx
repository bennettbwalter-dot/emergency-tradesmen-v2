import { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
    slot: string;
    format: 'leaderboard' | 'rectangle' | 'sidebar' | 'vertical' | 'infeed';
    className?: string;
    client?: string;
}

const INFEED_LAYOUT_KEY = "-fb+5w+4e-db+86";

// Fixed dimensions per format to prevent CLS
const FORMAT_CONFIG = {
    leaderboard: {
        desktop: { width: 728, height: 90 },
        mobile: { width: 320, height: 100 },
        label: 'Leaderboard',
    },
    rectangle: {
        desktop: { width: 336, height: 280 },
        mobile: { width: 300, height: 250 },
        label: 'Rectangle',
    },
    sidebar: {
        desktop: { width: 300, height: 250 },
        mobile: { width: 300, height: 250 },
        label: 'Sidebar',
    },
    vertical: {
        desktop: { width: 300, height: 600 },
        mobile: { width: 300, height: 250 },
        label: 'Vertical',
    },
};

/**
 * Reusable Google AdSense ad slot component.
 *
 * Features:
 * - Reserves fixed dimensions to prevent Cumulative Layout Shift (CLS)
 * - Lazy loads ads via IntersectionObserver (only when near viewport)
 * - Clearly labelled as "Advertisement"
 * - Disabled in dev mode unless VITE_ADS_ENABLED=true
 * - 20px+ padding to avoid accidental click violations
 */
export function AdSlot({ slot, format, className = '', client }: AdSlotProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const hasInitialized = useRef(false);

    // Check if ads are enabled
    const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true';
    const adClient = client || import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-1777113776734777';

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Lazy load via IntersectionObserver
    useEffect(() => {
        if (!adsEnabled || !containerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Start loading 200px before visible
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [adsEnabled]);

    // Push ad when visible
    useEffect(() => {
        if (!isVisible || !adsEnabled || hasInitialized.current) return;

        try {
            // @ts-ignore — adsbygoogle is injected by the script tag
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            hasInitialized.current = true;
        } catch (err) {
            console.warn('AdSense push failed:', err);
        }
    }, [isVisible, adsEnabled]);

    if (!adsEnabled) return null;

    if (format === 'infeed') {
        return (
            <div ref={containerRef} className={`ad-container my-4 w-full ${className}`}>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-medium mb-1 select-none text-center">
                    Advertisement
                </p>
                {isVisible && (
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client={adClient}
                        data-ad-slot={slot}
                        data-ad-format="fluid"
                        data-ad-layout-key={INFEED_LAYOUT_KEY}
                    />
                )}
            </div>
        );
    }

    const config = FORMAT_CONFIG[format] || FORMAT_CONFIG.rectangle;
    const dims = isMobile ? config.mobile : config.desktop;

    return (
        <div
            ref={containerRef}
            className={`ad-container flex flex-col items-center justify-center my-6 ${className}`}
            style={{ minHeight: dims.height + 24, padding: '12px 0' }}
        >
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-medium mb-2 select-none">
                Advertisement
            </p>
            <div
                className="ad-slot bg-secondary/10 border border-border/30 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ width: '100%', maxWidth: dims.width, minHeight: dims.height }}
            >
                {isVisible ? (
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block', width: dims.width, height: dims.height }}
                        data-ad-client={adClient}
                        data-ad-slot={slot}
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    />
                ) : (
                    <div
                        className="flex items-center justify-center text-muted-foreground/20"
                        style={{ width: dims.width, height: dims.height }}
                    >
                        <span className="text-xs">Ad</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdSlot;
