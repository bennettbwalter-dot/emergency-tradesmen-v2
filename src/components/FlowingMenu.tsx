import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { cities, usCities } from '@/lib/trades';

import './FlowingMenu.css';

interface MenuItemData {
    slug: string;
    text: string;
    image: string;
    vectorIcon?: string;
    icon?: string;
}

interface FlowingMenuProps {
    items?: MenuItemData[];
    speed?: number;
    textColor?: string;
    bgColor?: string;
    marqueeBgColor?: string;
    marqueeTextColor?: string;
    borderColor?: string;
    onTradeSelect?: (slug: string) => void;
}

interface MenuItemProps extends MenuItemData {
    speed: number;
    textColor: string;
    marqueeBgColor: string;
    marqueeTextColor: string;
    borderColor: string;
    isFirst: boolean;
    onTradeSelect?: (slug: string) => void;
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({
    items = [],
    speed = 15,
    textColor = '#fff',
    bgColor = '#060010',
    marqueeBgColor = '#fff',
    marqueeTextColor = '#060010',
    borderColor = '#fff',
    onTradeSelect
}) => {
    return (
        <div className="menu-wrap" style={{ backgroundColor: bgColor }}>
            <nav className="menu">
                {items.map((item, idx) => (
                    <MenuItem
                        key={idx}
                        {...item}
                        speed={speed}
                        textColor={textColor}
                        marqueeBgColor={marqueeBgColor}
                        marqueeTextColor={marqueeTextColor}
                        borderColor={borderColor}
                        isFirst={idx === 0}
                        onTradeSelect={onTradeSelect}
                    />
                ))}
            </nav>
        </div>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({
    slug,
    text,
    image,
    vectorIcon,
    icon,
    speed,
    textColor,
    marqueeBgColor,
    marqueeTextColor,
    borderColor,
    isFirst,
    onTradeSelect
}) => {
    const navigate = useNavigate();
    const { settings, detectedCity: localizationCity, detectUserLocation } = useLocalization();
    const { detectedCity: chatbotCity, setDetectedTrade, setDetectedCity } = useChatbot();
    const [isActive, setIsActive] = useState(false);

    const targetCity = chatbotCity || localizationCity;
    const countryPrefix = settings.countryCode === 'GB' ? '' : `/${settings.countryCode.toLowerCase()}`;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsActive(true);
        setDetectedTrade(slug);

        // Show marquee briefly
        setMarqueeVisibility(true);

        // Notify parent to reveal the TradeCard
        if (onTradeSelect) {
            onTradeSelect(slug);
        }
    };
    const itemRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const marqueeInnerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<gsap.core.Tween | null>(null);
    const [repetitions, setRepetitions] = useState(4);

    const animationDefaults: gsap.TweenVars = { duration: 0.6, ease: 'expo' };

    const distMetric = (x: number, y: number, x2: number, y2: number): number => {
        const xDiff = x - x2;
        const yDiff = y - y2;
        return xDiff * xDiff + yDiff * yDiff;
    };

    const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): 'top' | 'bottom' => {
        const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
        const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
        return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
    };

    useEffect(() => {
        const calculateRepetitions = () => {
            if (!marqueeInnerRef.current) return;
            const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part') as HTMLElement;
            if (!marqueeContent) return;
            const contentWidth = marqueeContent.offsetWidth;
            const viewportWidth = window.innerWidth;
            const needed = Math.ceil(viewportWidth / contentWidth) + 2;
            setRepetitions(Math.max(4, needed));
        };

        calculateRepetitions();
        window.addEventListener('resize', calculateRepetitions);
        return () => window.removeEventListener('resize', calculateRepetitions);
    }, [text, image]);

    useEffect(() => {
        const setupMarquee = () => {
            if (!marqueeInnerRef.current) return;
            const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part') as HTMLElement;
            if (!marqueeContent) return;
            const contentWidth = marqueeContent.offsetWidth;
            if (contentWidth === 0) return;

            if (animationRef.current) {
                animationRef.current.kill();
            }

            animationRef.current = gsap.to(marqueeInnerRef.current, {
                x: -contentWidth,
                duration: speed,
                ease: 'none',
                repeat: -1
            });
        };

        const timer = setTimeout(setupMarquee, 50);
        return () => {
            clearTimeout(timer);
            if (animationRef.current) {
                animationRef.current.kill();
            }
        };
    }, [text, image, repetitions, speed]);

    const setMarqueeVisibility = (visible: boolean, edge: 'top' | 'bottom' = 'bottom') => {
        if (!marqueeRef.current || !marqueeInnerRef.current) return;

        if (visible) {
            gsap.timeline({ defaults: animationDefaults })
                .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%', opacity: 1, pointerEvents: 'none' }, 0)
                .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
                .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
        } else {
            gsap.timeline({ defaults: animationDefaults })
                .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%', opacity: 0 }, 0)
                .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
        }
    };

    const handleInteractionStart = (clientX: number, clientY: number) => {
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);
        setMarqueeVisibility(true, edge);
    };

    const handleInteractionEnd = (clientX: number, clientY: number) => {
        if (isActive) return; // Keep visible if active/clicked
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);
        setMarqueeVisibility(false, edge);
    };

    const handleMouseEnter = (ev: React.MouseEvent<HTMLButtonElement>) => {
        handleInteractionStart(ev.clientX, ev.clientY);
    };

    const handleMouseLeave = (ev: React.MouseEvent<HTMLButtonElement>) => {
        handleInteractionEnd(ev.clientX, ev.clientY);
    };

    const handleTouchStart = (ev: React.TouchEvent<HTMLButtonElement>) => {
        const touch = ev.touches[0];
        handleInteractionStart(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (ev: React.TouchEvent<HTMLButtonElement>) => {
        if (ev.changedTouches && ev.changedTouches.length > 0) {
            const touch = ev.changedTouches[0];
            handleInteractionEnd(touch.clientX, touch.clientY);
        } else {
            handleInteractionEnd(0, 0);
        }
    };

    const handleTouchCancel = (ev: React.TouchEvent<HTMLButtonElement>) => {
        if (ev.changedTouches && ev.changedTouches.length > 0) {
            const touch = ev.changedTouches[0];
            handleInteractionEnd(touch.clientX, touch.clientY);
        } else {
            handleInteractionEnd(0, 0);
        }
    };

    return (
        <div className={`menu__item ${isActive ? 'is-active' : ''}`} ref={itemRef} style={{ borderColor, borderTop: isFirst ? 'none' : undefined }}>
            <button
                className="menu__item-link"
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                style={{ color: textColor, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: 0 }}
            >
                {text}
            </button>
            <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
                <div className="marquee__inner-wrap">
                    <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
                        {[...Array(repetitions)].map((_, idx) => (
                            <div className="marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                                <div className="marquee__img-container">
                                    <div className="marquee__img" style={{ backgroundImage: `url(${image})` }}>
                                        <div className="marquee__img-overlay" />
                                        <div className="marquee__badge">
                                            <span className="marquee__badge-dot" />
                                            AVAILABLE NOW
                                        </div>
                                        {vectorIcon && (
                                            <div className="marquee__vector-icon">
                                                <img src={vectorIcon} alt="" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="marquee__text">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowingMenu;
