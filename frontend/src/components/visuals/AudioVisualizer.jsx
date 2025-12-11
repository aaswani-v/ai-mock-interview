import React from 'react';

const AudioVisualizer = ({ isActive }) => (
    <div className="flex items-center justify-center gap-1 h-8">
        {[...Array(12)].map((_, i) => (
            <div
                key={i}
                className={`w-1.5 rounded-full bg-cyan-400 transition-all duration-75 ${isActive ? 'animate-pulse' : 'h-1 opacity-20'
                    }`}
                style={{
                    height: isActive ? `${Math.max(4, Math.random() * 32)}px` : '4px',
                    animationDelay: `${i * 0.05}s`
                }}
            />
        ))}
    </div>
);

export default AudioVisualizer;
