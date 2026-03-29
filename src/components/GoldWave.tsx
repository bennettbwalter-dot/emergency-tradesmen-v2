import { useRef, useEffect } from "react";
import { useSimpleTheme } from "@/components/simple-theme";

export const GoldWave = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useSimpleTheme();

    // Store theme in ref to access in animation loop without re-triggering effect
    const themeRef = useRef(theme);
    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true }); // optimize
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        // High Performance Configuration
        const PARTICLE_COUNT = 400;

        // Data layout per particle:
        // 0: x
        // 1: y
        // 2: z (depth)
        // 3: speed
        // 4: offset (random phase)
        // 5: size
        // 6: randomY (scatter)
        const DATA_STRIDE = 7;
        const particleData = new Float32Array(PARTICLE_COUNT * DATA_STRIDE);

        const initParticles = (w: number, h: number) => {
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const idx = i * DATA_STRIDE;
                particleData[idx] = Math.random() * w;     // x
                particleData[idx + 1] = 0;                 // y (calculated per frame)
                particleData[idx + 2] = Math.random();     // z
                particleData[idx + 3] = 1 + Math.random() * 1.5; // speed
                particleData[idx + 4] = Math.random() * 100; // offset
                particleData[idx + 5] = Math.random() * 2 + 1; // size
                particleData[idx + 6] = (Math.random() - 0.5) * 30; // randomY
            }
        };

        const resizeController = new AbortController();

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const parent = canvas.parentElement;
            if (parent) {
                width = parent.clientWidth;
                height = parent.clientHeight;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                ctx.scale(dpr, dpr);

                // Re-distribute particles across new width if significant change
                // But generally just let them wrap
                // For now, re-init to fill screen is safest for layout changes
                initParticles(width, height);
            }
        };

        let time = 0;

        // Pre-allocate style strings to avoid GC? 
        // We need varying alpha. 
        // Optimization: bucket particles by alpha? 
        // No, simplest first: direct draw loop with Float32Array is usually fast enough.

        const render = () => {
            time += 0.015; // Constant time step

            ctx.clearRect(0, 0, width, height);

            // "lighter" can be expensive on some GPUs with many overlapping draws, 
            // but is key for the look. Keep it, but optimize loop.
            ctx.globalCompositeOperation = 'lighter';

            // Cache frequent constants
            const centerY = height * 0.5;
            const ampMain = height * 0.25;
            const pi2 = Math.PI * 2;

            // Check theme for opacity adjustment
            const isDark = themeRef.current === 'dark';

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const idx = i * DATA_STRIDE;

                // Update X
                let pX = particleData[idx];
                const pSpeed = particleData[idx + 3];

                pX -= pSpeed * 0.8;
                if (pX < -50) {
                    pX = width + 50;
                }
                particleData[idx] = pX;

                // Calculate Y
                const pOffset = particleData[idx + 4];
                const pRandomY = particleData[idx + 6];

                // Wave Physics inline
                const waveY = Math.sin(pX * 0.003 + time) * ampMain;
                const detailY = Math.sin(pX * 0.01 + time * 2) * 10;

                const pY = centerY + waveY + detailY + pRandomY;

                // Draw
                const pZ = particleData[idx + 2]; // 0..1 depth
                const pSize = particleData[idx + 5];

                // Inline alpha format
                // Avoid string allocation in tight loop if possible?
                // `hsla` requires string.
                // Major perf gain: Round alpha to nearest 0.1 and cache styles?
                // Or just rely on JS engine optimization.
                // Let's optimize scaleSize calc
                const scaleSize = pSize * (0.6 + pZ * 0.4);

                // Draw
                // Dark mode: significantly reduce opacity (0.02 base) vs Light mode (0.05 base)
                const baseAlpha = isDark ? 0.01 : 0.05;
                const depthAlpha = isDark ? 0.08 : 0.15;

                const alpha = baseAlpha + pZ * depthAlpha;
                ctx.fillStyle = `hsla(48, 90%, 55%, ${alpha})`;

                ctx.beginPath();
                ctx.arc(pX, pY, scaleSize, 0, pi2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'source-over';

            animationFrameId = requestAnimationFrame(render);
        };

        handleResize();
        window.addEventListener('resize', handleResize, { signal: resizeController.signal });
        render();

        return () => {
            resizeController.abort();
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Empty dep array for effect, using ref for theme

    return (
        <div className="w-full h-[250px] md:h-[350px] overflow-hidden relative flex items-center justify-center rounded-3xl pointer-events-none">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-10"
            />
        </div>
    );
};
