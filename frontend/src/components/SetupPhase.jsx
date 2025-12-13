import React, { useState, useEffect } from 'react';
import api from '../api';
import { Sword } from 'lucide-react';

const SetupPhase = ({ onStart }) => {
    const [players, setPlayers] = useState({});
    const [playerA, setPlayerA] = useState("");
    const [playerB, setPlayerB] = useState("");

    useEffect(() => {
        api.get('/players').then(res => setPlayers(res.data));
    }, []);

    const getPlayerData = (name) => {
        return players[name] || { elo: "N/A", pdl: 0 };
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!playerA || !playerB || playerA === playerB) {
            alert("Selecione dois jogadores diferentes!");
            return;
        }

        const dataA = getPlayerData(playerA);
        const dataB = getPlayerData(playerB);

        onStart({
            player_a: playerA, elo_a: dataA.elo, pdl_a: dataA.pdl,
            player_b: playerB, elo_b: dataB.elo, pdl_b: dataB.pdl
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-200 mb-4">
                    Configuração do Duelo
                </h1>
                <p className="text-gray-400">Selecione os competidores registrados</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-cardBg p-8 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Player A */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-primary border-b border-primary/20 pb-2">Jogador A</h2>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Selecione o Jogador</label>
                            <select
                                value={playerA}
                                onChange={e => setPlayerA(e.target.value)}
                                className="w-full bg-bgDark border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none text-lg"
                                required
                            >
                                <option value="">-- Selecione --</option>
                                {Object.keys(players).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {playerA && (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col gap-2 animate-fade-in">
                                <div className="text-xs text-primary uppercase font-bold tracking-widest">Status Atual</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black text-white">{getPlayerData(playerA).elo}</span>
                                    <span className="text-sm text-primary font-bold">{getPlayerData(playerA).pdl} PDL</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Player B */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-red-500 border-b border-red-500/20 pb-2">Jogador B</h2>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Selecione o Jogador</label>
                            <select
                                value={playerB}
                                onChange={e => setPlayerB(e.target.value)}
                                className="w-full bg-bgDark border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none text-lg"
                                required
                            >
                                <option value="">-- Selecione --</option>
                                {Object.keys(players).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {playerB && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col gap-2 animate-fade-in">
                                <div className="text-xs text-red-400 uppercase font-bold tracking-widest">Status Atual</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black text-white">{getPlayerData(playerB).elo}</span>
                                    <span className="text-sm text-red-400 font-bold">{getPlayerData(playerB).pdl} PDL</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-yellow-600 hover:to-yellow-500 text-black font-bold py-4 rounded-xl text-xl uppercase tracking-widest transition-all hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3"
                    >
                        <Sword className="w-6 h-6" />
                        Iniciar Confronto
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SetupPhase;
