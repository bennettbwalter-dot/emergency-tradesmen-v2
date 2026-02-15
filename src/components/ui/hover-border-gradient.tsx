"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as: Tag = "button",
    duration = 1,
    clockwise = true,
    glowColor = "#FFFFFF",
    ...props
}: React.PropsWithChildren<
    {
        as?: React.ElementType;
        containerClassName?: string;
        className?: string;
        duration?: number;
        clockwise?: boolean;
        glowColor?: string;
    } & React.HTMLAttributes<HTMLElement>
>) {
    const [hovered, setHovered] = useState<boolean>(false);
    const [direction, setDirection] = useState<Direction>("TOP");

    const rotateDirection = (currentDirection: Direction): Direction => {
        const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
        const currentIndex = directions.indexOf(currentDirection);
        const nextIndex = clockwise
            ? (currentIndex - 1 + directions.length) % directions.length
            : (currentIndex + 1) % directions.length;
        return directions[nextIndex];
    };

    const movingMap: Record<Direction, string> = {
        TOP: `radial-gradient(20.7% 50% at 50% 0%, ${glowColor} 0%, rgba(255, 255, 255, 0) 100%)`,
        LEFT: `radial-gradient(16.6% 43.1% at 0% 50%, ${glowColor} 0%, rgba(255, 255, 255, 0) 100%)`,
        BOTTOM:
            `radial-gradient(20.7% 50% at 50% 100%, ${glowColor} 0%, rgba(255, 255, 255, 0) 100%)`,
        RIGHT:
            `radial-gradient(16.2% 41.199999999999996% at 100% 50%, ${glowColor} 0%, rgba(255, 255, 255, 0) 100%)`,
    };

    const highlight =
        "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)";

    // OPTIMIZATION: Removed expensive setInterval that ran on every single card (400+ timers!)
    // Now it only animates/reacts to hover state via Framer Motion, which is much more efficient.
    // The direction rotation was subtle but costly; static direction is fine for idle state.

    useEffect(() => {
        // Reset direction on unhover if needed, or just leave it. 
        // Removing the interval entirely saves massive CPU.
    }, [hovered]);

    return (
        <Tag
            onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
                setHovered(true);
            }}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "relative flex rounded-full border  content-center bg-black/20 hover:bg-black/10 transition-duration-500 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
                containerClassName
            )}
            {...props}
        >
            <div
                className={cn(
                    "relative z-10 w-full h-full rounded-[inherit] bg-background",
                    className
                )}
            >
                {children}
            </div>
            <motion.div
                className={cn(
                    "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
                )}
                style={{
                    filter: "blur(2px)",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                }}
                initial={{ background: movingMap[direction] }}
                animate={{
                    background: hovered
                        ? [movingMap[direction], highlight]
                        : movingMap[direction],
                }}
                transition={{ ease: "linear", duration: duration ?? 1 }}
            />
        </Tag>
    );
}
