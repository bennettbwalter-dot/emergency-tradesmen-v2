import React from "react";

export function GuidancePulse() {
    // VISUAL CONSTANTS
    // No longer just a pulse color, we have a full icon now.

    // PATH SEGMENT DEFINITIONS
    // Coordinates based on 0-100 viewBox.
    // Layout: Trade (Left), Locate Me (Center Top), Search (Right Bottom)

    // SEGMENT 1: Select Trade -> Before Locate Me Gap
    // Path: Trade Center (22, 85) -> Up (22, 35) -> Right (38, 35)
    // Approx Length: 50 + 16 = 66
    const seg1d = "M 22 85 L 22 35 L 38 35";

    // SEGMENT 2: After Locate Me Gap -> Search Button
    // Path: Post-Gap (62, 35) -> Right (95, 35) -> Down (95, 85)
    // Approx Length: 33 + 50 = 83
    const seg2d = "M 62 35 L 95 35 L 95 85";

    // TIMING CALCULATIONS (Total Loop 3s)
    const DURATION = "3s";
    const PULSE_COLOR = "#FF0000"; // Define PULSE_COLOR for the glow filter

    // Pulsing Gold Dot Component
    const ArrowIcon = () => (
        <circle
            r="2"
            fill="#D4AF37"
            opacity="0.9"
        >
            <animate
                attributeName="r"
                values="2;3;2"
                dur="1s"
                repeatCount="indefinite"
            />
            <animate
                attributeName="opacity"
                values="0.9;1;0.9"
                dur="1s"
                repeatCount="indefinite"
            />
        </circle>
    );

    return (
        <div className="absolute inset-0 pointer-events-none z-0 hidden md:block overflow-visible">
            <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Glow for the Arrow */}
                    <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={PULSE_COLOR} floodOpacity="0.8" />
                    </filter>
                </defs>

                {/* --- SEGMENT 1 LOGIC --- */}
                <g>
                    <g opacity="0">
                        <ArrowIcon />
                        {/* Motion along path */}
                        <animateMotion
                            dur={DURATION}
                            repeatCount="indefinite"
                            path={seg1d}
                            keyTimes="0; 0.38; 1"
                            keyPoints="0; 1; 1"
                            calcMode="linear"
                            rotate="auto"
                        />
                        {/* Opacity Control */}
                        <animate
                            attributeName="opacity"
                            values="1; 1; 0; 0"
                            keyTimes="0; 0.38; 0.39; 1"
                            dur={DURATION}
                            repeatCount="indefinite"
                        />
                    </g>
                </g>

                {/* --- SEGMENT 2 LOGIC --- */}
                <g>
                    <g opacity="0">
                        <ArrowIcon />
                        {/* Motion along path */}
                        <animateMotion
                            dur={DURATION}
                            repeatCount="indefinite"
                            path={seg2d}
                            keyTimes="0; 0.52; 1"
                            keyPoints="0; 0; 1"
                            calcMode="linear"
                            rotate="auto"
                        />
                        {/* Opacity Control */}
                        <animate
                            attributeName="opacity"
                            values="0; 0; 1; 1; 0"
                            keyTimes="0; 0.51; 0.52; 0.99; 1"
                            dur={DURATION}
                            repeatCount="indefinite"
                        />
                    </g>
                </g>

            </svg>
        </div>
    );
}
