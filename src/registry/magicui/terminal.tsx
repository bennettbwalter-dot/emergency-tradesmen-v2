"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TerminalProps {
    children: React.ReactNode;
    className?: string;
    onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
    containerRef?: React.RefObject<HTMLDivElement>;
    contentClassName?: string;
}

export const Terminal = ({ children, className, onScroll, containerRef, contentClassName }: TerminalProps) => {
    return (
        <div
            className={cn(
                "z-0 w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden",
                className
            )}
        >
            <div className="flex flex-col gap-y-2 border-b border-border p-4 bg-card shrink-0">
                <div className="flex flex-row gap-x-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
            </div>
            <div 
                ref={containerRef}
                onScroll={onScroll}
                className={cn("space-y-2 p-4 font-mono text-sm leading-relaxed overflow-y-auto", contentClassName)}
            >
                {children}
            </div>
        </div>
    );
};

interface AnimatedSpanProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export const AnimatedSpan = ({
    children,
    delay = 0,
    className,
}: AnimatedSpanProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay / 1000, ease: "easeIn" }}
            className={cn("grid gap-y-1 overflow-hidden", className)}
        >
            <span className="block">{children}</span>
        </motion.div>
    );
};

interface TypingAnimationProps extends MotionProps {
    children: string;
    className?: string;
    duration?: number;
    delay?: number;
    as?: React.ElementType;
}

export const TypingAnimation = ({
    children,
    className,
    duration = 60,
    delay = 0,
    as: Component = "span",
    ...props
}: TypingAnimationProps) => {
    if (typeof children !== "string") {
        throw new Error("TypingAnimation: children must be a string. Received " + typeof children);
    }

    const MotionComponent = motion(Component as any);
    const [displayedText, setDisplayedText] = useState<string>("");
    const [started, setStarted] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const startTimeout = setTimeout(() => {
            setStarted(true);
        }, delay);
        return () => clearTimeout(startTimeout);
    }, [delay]);

    useEffect(() => {
        if (!started) return;

        let i = 0;
        const typingEffect = setInterval(() => {
            if (i < children.length) {
                setDisplayedText(children.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typingEffect);
            }
        }, duration);

        return () => {
            clearInterval(typingEffect);
        };
    }, [children, duration, started]);

    return (
        <MotionComponent
            ref={elementRef}
            className={cn("text-base tracking-tight leading-[1.2]", className)} // Adjusted leading
            {...props}
        >
            {displayedText}
        </MotionComponent>
    );
};
