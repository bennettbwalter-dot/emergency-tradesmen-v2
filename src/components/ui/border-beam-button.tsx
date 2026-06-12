import React from "react";
import { Button, ButtonProps } from "./button";
import { BorderBeam } from "../magicui/BorderBeam";
import { cn } from "@/lib/utils";

export type BorderBeamColorVariant = "colorful" | "ocean" | "sunset" | "mono";
export type BorderBeamSize = "sm" | "md" | "line";

export interface BorderBeamButtonProps extends ButtonProps {
    colorVariant?: BorderBeamColorVariant;
    beamSize?: BorderBeamSize;
    active?: boolean;
    staticColors?: boolean;
    borderBeamClassName?: string;
}

const COLOR_MAP: Record<BorderBeamColorVariant, { from: string; to: string }> = {
    colorful: { from: "#ffaa40", to: "#9c40ff" },
    ocean: { from: "#00c6ff", to: "#0072ff" },
    sunset: { from: "#ff5e62", to: "#ff9966" },
    mono: { from: "#e2e8f0", to: "#475569" },
};

const SIZE_MAP: Record<BorderBeamSize, number> = {
    sm: 45,
    md: 90,
    line: 180,
};

export const BorderBeamButton = React.forwardRef<HTMLButtonElement, BorderBeamButtonProps>(
    (
        {
            className,
            borderBeamClassName,
            colorVariant = "colorful",
            beamSize = "sm",
            active = true,
            staticColors = false,
            children,
            variant = "outline",
            ...props
        },
        ref
    ) => {
        const colors = COLOR_MAP[colorVariant];
        const size = SIZE_MAP[beamSize];

        return (
            <Button
                ref={ref}
                variant={variant}
                className={cn(
                    "relative overflow-hidden transition-all duration-300",
                    active && "border-transparent",
                    className
                )}
                {...props}
            >
                <span className="relative z-10 flex items-center gap-2">{children}</span>
                {active && (
                    <BorderBeam
                        size={size}
                        colorFrom={colors.from}
                        colorTo={colors.to}
                        borderWidth={1.5}
                        duration={beamSize === "line" ? 8 : 4}
                        className={borderBeamClassName}
                    />
                )}
            </Button>
        );
    }
);
BorderBeamButton.displayName = "BorderBeamButton";

export const BorderBeamIconButton = React.forwardRef<HTMLButtonElement, BorderBeamButtonProps>(
    (
        {
            className,
            borderBeamClassName,
            colorVariant = "colorful",
            beamSize = "sm",
            active = true,
            staticColors = false,
            children,
            variant = "outline",
            ...props
        },
        ref
    ) => {
        const colors = COLOR_MAP[colorVariant];
        const size = SIZE_MAP[beamSize];

        return (
            <Button
                ref={ref}
                variant={variant}
                size="icon"
                className={cn(
                    "relative overflow-hidden transition-all duration-300 rounded-full",
                    active && "border-transparent",
                    className
                )}
                {...props}
            >
                <span className="relative z-10 flex items-center justify-center">{children}</span>
                {active && (
                    <BorderBeam
                        size={size}
                        colorFrom={colors.from}
                        colorTo={colors.to}
                        borderWidth={1.5}
                        duration={4}
                        className={borderBeamClassName}
                    />
                )}
            </Button>
        );
    }
);
BorderBeamIconButton.displayName = "BorderBeamIconButton";
