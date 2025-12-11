import React, { useRef, useState } from 'react';

const TiltCard = ({ children, className }) => {
    const cardRef = useRef(null);
    const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;

        setGlowPos({ x, y });
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        setGlowPos({ x: 0, y: 0 });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-all duration-300 ease-out transform-style-3d relative overflow-hidden rounded-3xl ${className}`}
        >
            <div
                className="absolute w-64 h-64 bg-cyan-500/20 blur-[80px] pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{ left: glowPos.x - 128, top: glowPos.y - 128, zIndex: 0 }}
            />
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );
};

export default TiltCard;
