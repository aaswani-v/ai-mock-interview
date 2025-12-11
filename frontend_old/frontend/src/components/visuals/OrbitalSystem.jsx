import React from 'react';

const OrbitalSystem = ({ centerIcon: CenterIcon, orbitingIcons, label, color = "cyan", delay = 0 }) => {
    return (
        <div
            className="absolute flex items-center justify-center animate-spin-slow pointer-events-none z-0 opacity-80 transition-opacity duration-500"
            style={{
                left: '50%', top: '50%', width: '600px', height: '600px',
                marginLeft: '-300px', marginTop: '-300px',
                animationDelay: `${delay}s`, animationDuration: '40s'
            }}
        >
            <div className={`w-full h-full border-2 border-${color}-500/30 rounded-full absolute shadow-[0_0_50px_rgba(34,211,238,0.15)]`}>
                {orbitingIcons.map((Icon, idx) => {
                    if (!Icon) return null;
                    const angle = (360 / orbitingIcons.length) * idx;
                    return (
                        <div
                            key={idx}
                            className={`absolute w-14 h-14 bg-slate-900 border-2 border-${color}-500/70 rounded-full flex items-center justify-center text-${color}-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]`}
                            style={{
                                top: '50%', left: '50%',
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(300px) rotate(-${angle}deg)`
                            }}
                        >
                            <Icon size={24} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrbitalSystem;
