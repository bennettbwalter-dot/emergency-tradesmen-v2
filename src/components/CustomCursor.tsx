import { useEffect, useState } from "react";

export function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const onMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsMoving(true);

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMoving(false);
            }, 500); // 500ms debounce before fading out
        };

        window.addEventListener("mousemove", onMouseMove);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            clearTimeout(timeoutId);
        };
    }, []);

    if (typeof window === "undefined") return null;

    return (
        <div
            className="fixed pointer-events-none z-[9999] transition-opacity duration-500 ease-out"
            style={{
                left: position.x,
                top: position.y,
                opacity: isMoving ? 1 : 0,
                transform: 'translate(-50%, -50%)',
            }}
        >
            {/* Core fingertip */}
            <div className="relative">
                {/* Inner intense glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#ff3333] rounded-full blur-[2px]" />

                {/* Outer neon glow layers */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#ff0000] rounded-full blur-[8px] opacity-60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#ff0000] rounded-full blur-[15px] opacity-30" />

                {/* Core white/yellow center for "hot" look */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#ffcc00] rounded-full blur-[1px]" />
            </div>
        </div>
    );
}
