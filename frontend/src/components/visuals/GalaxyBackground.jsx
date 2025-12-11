import React, { useMemo, useRef, useEffect, useState } from 'react';

// Optimized Galaxy Background
// Reduced star count, using CSS transforms for rotation instead of JS
// Mouse movement only tilts the container, doesn't re-render stars

const GalaxyBackground = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const frameRef = useRef(null);

    // Throttled mouse tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (frameRef.current) return;
            frameRef.current = requestAnimationFrame(() => {
                setMousePos({
                    x: (e.clientX / window.innerWidth) * 2 - 1,
                    y: (e.clientY / window.innerHeight) * 2 - 1,
                });
                frameRef.current = null;
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    // Static star generation (memoized forever)
    const stars = useMemo(() => {
        const generate = (count, sizeRange, opacityRange) => {
            return Array.from({ length: count }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
                opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
                duration: Math.random() * 20 + 20, // 20s-40s rotation
                delay: Math.random() * 5,
            }));
        };

        return {
            small: generate(50, [1, 2], [0.3, 0.6]),
            medium: generate(30, [2, 3], [0.4, 0.8]),
            large: generate(15, [3, 4], [0.6, 1]),
        };
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden bg-[#050510] pointer-events-none z-0">
            {/* Deep Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1b2735_0%,_#090a0f_100%)] opacity-80" />

            {/* Star container tilts with mouse */}
            <div
                className="absolute inset-[-20%] transition-transform duration-300 ease-out will-change-transform"
                style={{
                    transform: `perspective(1000px) rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * 2}deg) translateZ(0)`
                }}
            >
                {/* Layer 1: Small - Slow Rotation */}
                <div className="absolute inset-0 animate-[spin_120s_linear_infinite]">
                    {stars.small.map(s => (
                        <div key={s.id} className="absolute rounded-full bg-white shadow-[0_0_2px_#fff]"
                            style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }} />
                    ))}
                </div>

                {/* Layer 2: Medium - Medium Rotation (Reverse) */}
                <div className="absolute inset-0 animate-[spin_90s_linear_infinite_reverse]">
                    {stars.medium.map(s => (
                        <div key={s.id} className="absolute rounded-full bg-cyan-200 shadow-[0_0_3px_#22d3ee]"
                            style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }} />
                    ))}
                </div>

                {/* Layer 3: Large - Fast Rotation */}
                <div className="absolute inset-0 animate-[spin_60s_linear_infinite]">
                    {stars.large.map(s => (
                        <div key={s.id} className="absolute rounded-full bg-purple-200 shadow-[0_0_4px_#a855f7]"
                            style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }} />
                    ))}
                </div>
            </div>

            {/* Nebulas (Fixed) */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
    );
};

export default GalaxyBackground;
