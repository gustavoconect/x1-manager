import React, { useState, useEffect } from 'react';
import api from '../api';
import ChampionCard from './ChampionCard';
import DraftReveal from './DraftReveal';
import { playChampionVoice, playLockSound } from '../SoundManager';

const ChoicePhase = ({ state, onStateUpdate }) => {
    const {
        drawn_champions,
        lower_elo_player,
        player_a,
        player_b,
        choice_made,
        pick_order_chooser,
        side_chooser,
        first_picker,
        picks,
        side_choice_complete,
        game1_sides
    } = state;

    const [showReveal, setShowReveal] = useState(false);

    // Trigger Reveal when side choice is complete (Draft Done)
    useEffect(() => {
        if (side_choice_complete && !showReveal) {
            setShowReveal(true);
        }
    }, [side_choice_complete]);

    const version = state.version || "13.24.1";
    const lowerName = lower_elo_player === "A" ? player_a : player_b;
    const higherName = lower_elo_player === "A" ? player_b : player_a;
    const pickOrderChooserName = pick_order_chooser === "A" ? player_a : player_b;
    const sideChooserName = side_chooser === "A" ? player_a : player_b;
    const firstPickerName = first_picker === "A" ? player_a : player_b;
    const secondPickerName = first_picker === "A" ? player_b : player_a;

    const hasPick1 = picks && picks["Game 1"];
    const hasPick2 = picks && picks["Game 2"];
    const picksComplete = hasPick1 && hasPick2;

    // Phase 1: Lower Elo chooses A or B
    const handleRule6Choice = async (choice) => {
        playLockSound(); // Major transition
        const res = await api.post(`/rule6-choice?choice=${choice}`);
        onStateUpdate(res.data);
    };

    // Phase 2: Pick order chooser decides who picks first
    const handleSetPickOrder = async (firstPicker) => {
        playLockSound(); // Major transition
        const res = await api.post(`/set-pick-order?first_picker=${firstPicker}`);
        onStateUpdate(res.data);
    };

    // Phase 3: Pick champions (Game 1 = first pick, Game 2 = second pick)
    const handlePick = async (game, champName, champImage) => {
        playChampionVoice(champName); // Play champion voice!
        // Use provided image or fallback if missing (legacy support)
        const imgUrl = champImage || `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champName}.png`;
        const playerName = game === "Game 1" ? firstPickerName : secondPickerName;
        const res = await api.post('/pick', { game, champion: champName, image: imgUrl, player: playerName });
        onStateUpdate(res.data);
    };

    // Phase 4: Side chooser picks their side
    const handleSetSide = async (side) => {
        playLockSound();
        const res = await api.post(`/set-map-side?side=${side}`);
        onStateUpdate(res.data);
    };

    // ========== RENDER PHASES ==========

    // Helper to normalize champion object (handle transition from string to object)
    const getChampData = (c) => {
        if (typeof c === 'string') return { name: c, image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c}.png` };
        return c; // { name, image }
    };

    // Phase 1: Choice not made yet
    if (!choice_made) {
        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold font-display tracking-wide">Campeões Sorteados</h2>

                <div className="flex gap-6">
                    {drawn_champions.map(c => {
                        const champ = getChampData(c);
                        return (
                            <div key={champ.name} className="w-40">
                                <ChampionCard
                                    name={champ.name}
                                    image={champ.image}
                                    isSelected={false}
                                    isBanned={false}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="hex-panel p-8 rounded-2xl text-center max-w-lg">
                    <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">Decisão de</p>
                    <h3 className="text-2xl font-bold text-hex-gold-300 mb-6 font-display">{lowerName}</h3>
                    <p className="text-gray-300 mb-6">Escolha uma opção:</p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleRule6Choice('pick_order')}
                            className="bg-hex-blue-500 hover:bg-hex-blue-300 text-black py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg border border-hex-blue-300/50"
                        >
                            (A) Definir Ordem de Pick
                        </button>
                        <button
                            onClick={() => handleRule6Choice('side')}
                            className="bg-hex-magic hover:bg-pink-400 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg border border-hex-magic/50"
                        >
                            (B) Escolher Lado do Mapa
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 2: Pick order not set yet
    if (!first_picker) {
        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold font-display tracking-wide">Campeões Sorteados</h2>

                <div className="flex gap-6">
                    {drawn_champions.map(c => {
                        const champ = getChampData(c);
                        return (
                            <div key={champ.name} className="w-40">
                                <ChampionCard
                                    name={champ.name}
                                    image={champ.image}
                                    isSelected={false}
                                    isBanned={false}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="hex-panel p-8 rounded-2xl text-center max-w-lg">
                    <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">Decisão de</p>
                    <h3 className="text-2xl font-bold text-hex-gold-300 mb-6 font-display">{pickOrderChooserName}</h3>
                    <p className="text-gray-300 mb-6">Quem faz o primeiro pick?</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleSetPickOrder('A')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-blue-400/50"
                        >
                            {player_a}
                        </button>
                        <button
                            onClick={() => handleSetPickOrder('B')}
                            className="bg-red-600 hover:bg-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-red-400/50"
                        >
                            {player_b}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 3: Picks in progress
    if (!picksComplete) {
        const currentGame = !hasPick1 ? "Game 1" : "Game 2";
        const currentPicker = currentGame === "Game 1" ? firstPickerName : secondPickerName;
        const pickerColor = currentGame === "Game 1" ? "text-blue-400" : "text-red-400";

        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-widest text-hex-gold-100">Escolha de Campeões</h2>
                    <p className="text-gray-400 uppercase tracking-wider text-sm">
                        Pick de <span className={`font-bold ${pickerColor} text-lg ml-2`}>{currentPicker}</span> <span className="text-xs text-white/30 ml-2">({currentGame})</span>
                    </p>
                </div>

                <div className="flex gap-8 flex-wrap justify-center">
                    {drawn_champions.map(c => {
                        const champ = getChampData(c);
                        const isPicked = (hasPick1 && picks["Game 1"].champion === champ.name) ||
                            (hasPick2 && picks["Game 2"].champion === champ.name);

                        return (
                            <div key={champ.name} className="w-48 flex flex-col items-center gap-4 bg-hex-dark-500/50 p-4 rounded-2xl border border-white/5 hover:border-hex-gold-500/30 transition-all">
                                <ChampionCard
                                    name={champ.name}
                                    image={champ.image}
                                    isSelected={isPicked}
                                    isBanned={false}
                                />
                                {!isPicked && (
                                    <button
                                        onClick={() => handlePick(currentGame, champ.name, champ.image)}
                                        className={`w-full ${currentGame === "Game 1" ? "bg-hex-blue-500 hover:bg-hex-blue-300" : "bg-red-600 hover:bg-red-500"} text-black py-2 px-4 rounded-lg font-bold transition-all hover:scale-105 uppercase tracking-widest text-sm shadow-lg`}
                                    >
                                        Selecionar
                                    </button>
                                )}
                                {isPicked && (
                                    <div className={`py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-widest w-full text-center ${picks["Game 1"]?.champion === champ.name ? "bg-hex-blue-900/50 text-hex-blue-300 border border-hex-blue-500/30" : "bg-red-900/50 text-red-300 border border-red-500/30"}`}>
                                        {picks["Game 1"]?.champion === champ.name ? "Jogo 1" : "Jogo 2"}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Phase 4: Picks complete, side choice pending
    if (!side_choice_complete) {
        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold font-display uppercase tracking-widest text-hex-gold-100">Picks Definidos!</h2>

                <div className="flex gap-6 w-full max-w-4xl justify-center">
                    {/* Game 1 Card */}
                    <div className="bg-hex-dark-500/50 border border-hex-blue-500/30 p-6 rounded-xl flex items-center gap-4 min-w-[300px]">
                        <img src={picks["Game 1"].image} className="w-20 h-20 rounded-full border-2 border-hex-blue-500" />
                        <div>
                            <div className="text-xs uppercase tracking-widest text-hex-blue-300 mb-1">Jogo 1 (Ida)</div>
                            <div className="font-bold text-xl font-display">{picks["Game 1"].champion}</div>
                        </div>
                    </div>

                    {/* Game 2 Card */}
                    <div className="bg-hex-dark-500/50 border border-red-500/30 p-6 rounded-xl flex items-center gap-4 min-w-[300px]">
                        <img src={picks["Game 2"].image} className="w-20 h-20 rounded-full border-2 border-red-500" />
                        <div>
                            <div className="text-xs uppercase tracking-widest text-red-400 mb-1">Jogo 2 (Volta)</div>
                            <div className="font-bold text-xl font-display">{picks["Game 2"].champion}</div>
                        </div>
                    </div>
                </div>

                <div className="hex-panel p-8 rounded-2xl text-center max-w-lg mt-8">
                    <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">Decisão de</p>
                    <h3 className="text-2xl font-bold text-hex-gold-300 mb-6 font-display">{sideChooserName}</h3>
                    <p className="text-gray-300 mb-6">Escolha seu lado no Jogo 1:</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleSetSide('Blue')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-blue-400/50 shadow-lg"
                        >
                            🔵 Blue Side
                        </button>
                        <button
                            onClick={() => handleSetSide('Red')}
                            className="bg-red-600 hover:bg-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-red-400/50 shadow-lg"
                        >
                            🔴 Red Side
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 5: All done - show summary
    const playerASide = game1_sides["A"];
    const playerBSide = game1_sides["B"];

    const games = [
        { name: "JOGO 1 (IDA)", pick: picks["Game 1"], pA_side: playerASide, pB_side: playerBSide },
        { name: "JOGO 2 (VOLTA)", pick: picks["Game 2"], pA_side: playerASide === "Blue" ? "Red" : "Blue", pB_side: playerBSide === "Blue" ? "Red" : "Blue" }
    ];

    return (
        <>
            {showReveal && picks && (
                <DraftReveal
                    playerA="JOGO 1 (IDA)"
                    playerB="JOGO 2 (VOLTA)"
                    champA={picks["Game 1"]}
                    champB={picks["Game 2"]}
                    onDismiss={() => setShowReveal(false)}
                />
            )}

            <div className="p-8 animate-fade-in flex flex-col items-center gap-8 pb-20">
                <div className="flex justify-between items-center w-full max-w-3xl">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-hex-gold-100 to-hex-gold-500 font-display uppercase tracking-widest drop-shadow-sm">🎮 Duelo Configurado</h2>
                    <button
                        onClick={async () => {
                            if (!confirm("Finalizar duelo e salvar no histórico?")) return;
                            await api.post('/reset-duel');
                            window.location.reload();
                        }}
                        className="bg-red-500/10 text-red-400 px-6 py-2 rounded-xl hover:bg-red-500/30 border border-red-500/50 font-bold transition-all uppercase tracking-widest text-xs hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                        Finalizar Duelo
                    </button>
                </div>

                <div className="w-full max-w-3xl flex flex-col gap-8">
                    {games.map((g, idx) => {
                        const bluePlayer = g.pA_side === "Blue" ? player_a : player_b;
                        const redPlayer = g.pA_side === "Red" ? player_a : player_b;

                        return (
                            <div key={idx} className="bg-hex-dark-500/[0.8] border border-hex-gold-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <h3 className="text-center font-bold text-hex-gold-300 text-lg uppercase tracking-widest mb-6 border-b border-white/5 pb-2">{g.name}</h3>

                                <div className="flex items-center justify-between px-4">
                                    {/* Blue Side */}
                                    <div className="flex flex-col items-center gap-2 w-1/3">
                                        <span className="text-blue-400 font-bold uppercase tracking-wider text-xs">Blue Side</span>
                                        <div className="relative group">
                                            <img src={g.pick.image} className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                            <div className="absolute -bottom-2 inset-x-0 bg-blue-900 border border-blue-500 text-xs text-center rounded text-blue-100 font-bold py-0.5 transform scale-90">
                                                {g.pick.champion}
                                            </div>
                                        </div>
                                        <span className="font-bold text-white text-lg mt-2">{bluePlayer}</span>
                                    </div>

                                    {/* VS */}
                                    <div className="flex flex-col items-center justify-center w-1/3">
                                        <div className="text-4xl font-display italic text-hex-gold-500 opacity-80">VS</div>
                                    </div>

                                    {/* Red Side */}
                                    <div className="flex flex-col items-center gap-2 w-1/3">
                                        <span className="text-red-400 font-bold uppercase tracking-wider text-xs">Red Side</span>
                                        <div className="relative group">
                                            <img src={g.pick.image} className="w-20 h-20 rounded-full border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                            <div className="absolute -bottom-2 inset-x-0 bg-red-900 border border-red-500 text-xs text-center rounded text-red-100 font-bold py-0.5 transform scale-90">
                                                {g.pick.champion}
                                            </div>
                                        </div>
                                        <span className="font-bold text-white text-lg mt-2">{redPlayer}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ChoicePhase;
