import React from 'react';
import { Ban } from 'lucide-react';
import { playBanSound } from '../SoundManager';

const LANES = ["Top", "Jungle", "Mid", "ADC", "Support"];

const LaneBanPhase = ({ bannedLanes, onBan, currentPlayer, currentPlayerName }) => {
    return (
        <div className="max-w-5xl mx-auto p-4 animate-fade-in text-center">
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-xl inline-block min-w-[300px]">
                <span className="block text-sm text-primary font-bold uppercase tracking-wider mb-1">Vez de Banir</span>
                <div className="text-4xl font-bold flex items-center justify-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center text-lg shadow-lg animate-pulse-gold">
                        {currentPlayer}
                    </div>
                    {currentPlayerName}
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-2">
                <Ban className="text-red-500" />
                Selecione uma rota para ELIMINAR
            </h2>

            <div className="grid grid-cols-5 gap-4">
                {LANES.map((lane, idx) => {
                    const isBanned = bannedLanes.includes(lane);
                    return (
                        <button
                            key={lane}
                            disabled={isBanned}
                            onClick={() => {
                                playBanSound();
                                onBan(lane);
                            }}
                            style={{ animationDelay: `${idx * 100}ms` }}
                            className={`
                h-40 rounded-xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 animate-slide-up
                ${isBanned
                                    ? 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed scale-95 grayscale'
                                    : 'border-white/10 bg-cardBg hover:border-red-500 hover:bg-red-500/10 hover:shadow-[0_0_30px_rgba(244,67,54,0.3)] hover:-translate-y-2'
                                }
              `}
                        >
                            <div className={`transition-all duration-300 ${isBanned ? 'opacity-20 grayscale' : 'group-hover:scale-110'}`}>
                                {(() => {
                                    const laneMap = {
                                        "Top": "top",
                                        "Jungle": "jungle",
                                        "Mid": "middle",
                                        "ADC": "bottom",
                                        "Support": "utility"
                                    };
                                    const imgKey = laneMap[lane];
                                    const iconUrl = `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${imgKey}.png`;

                                    return <img src={iconUrl} alt={lane} className="w-20 h-20" />;
                                })()}
                            </div>
                            <span className="font-bold text-lg uppercase">{lane}</span>
                            {isBanned && <span className="text-xs text-red-500 font-bold">BANIDO</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LaneBanPhase;
