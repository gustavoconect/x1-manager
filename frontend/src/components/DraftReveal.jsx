import React, { useEffect, useState } from 'react';
import { playDraftCompleteSound } from '../SoundManager';

const DraftReveal = ({ playerA, playerB, champA, champB, onDismiss }) => {
    const [phase, setPhase] = useState('init'); // init, clash, reveal, done

    useEffect(() => {
        playDraftCompleteSound();

        // Timeline of animation
        setTimeout(() => setPhase('clash'), 100);
        setTimeout(() => setPhase('reveal'), 1500);
        setTimeout(() => {
            setPhase('done');
            if (onDismiss) setTimeout(onDismiss, 1000); // Auto dismiss after reveal 
        }, 5000);
    }, []);

    if (phase === 'done' && !onDismiss) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-sm" onClick={onDismiss}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-red-900/20"></div>
            <div className="absolute inset-0 bg-[url('/assets/hex_clouds.jpg')] opacity-10 mix-blend-overlay animate-pulse"></div>

            {/* VS Badge */}
            <div className={`absolute z-20 transition-all duration-1000 ${phase === 'clash' || phase === 'reveal' ? 'scale-150 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-180'}`}>
                <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-hex-gold-100 to-hex-gold-700 drop-shadow-[0_0_20px_rgba(200,155,60,0.8)]" style={{ fontFamily: 'Beaufort LoL, sans-serif' }}>
                    VS
                </div>
            </div>

            {/* Player A (Left) */}
            <div className={`absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-8 transition-all duration-1000 transform ${phase === 'init' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                <div className="relative group">
                    <img
                        src={champA.image}
                        className="w-[280px] h-[280px] object-cover rounded-full border-4 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] z-10 relative mask-image-gradient"
                        style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
                    />
                    <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-right z-20 mix-blend-screen scale-90 origin-right">
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-blue-300 to-white uppercase opacity-0 animate-slide-in-right" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                            {playerA}
                        </h2>
                        <h3 className="text-2xl font-bold text-blue-500 opacity-0 animate-slide-in-right" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
                            {champA.name}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Player B (Right) */}
            <div className={`absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-start pl-8 transition-all duration-1000 transform ${phase === 'init' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                <div className="relative group">
                    <img
                        src={champB.image}
                        className="w-[280px] h-[280px] object-cover rounded-full border-4 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] z-10 relative"
                        style={{ clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)' }}
                    />
                    <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 text-left z-20 mix-blend-screen scale-90 origin-left">
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-white uppercase opacity-0 animate-slide-in-left" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                            {playerB}
                        </h2>
                        <h3 className="text-2xl font-bold text-red-500 opacity-0 animate-slide-in-left" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
                            {champB.name}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Light Flash */}
            <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-300 ${phase === 'clash' ? 'opacity-20' : 'opacity-0'}`}></div>
        </div>
    );
};

export default DraftReveal;
