import React, { useState, useEffect } from 'react';
import api from '../api';
import ChampionCard from './ChampionCard';
import DraftReveal from './DraftReveal';
import { playLockSound, playBanSound, playChampionVoice } from '../SoundManager';

const KnockoutPhase = ({ state, onStateUpdate }) => {
    const {
        series_format,
        announced_champions,
        knockout_bans,
        announce_turn_player,
        player_a,
        player_b,
        picks,
        series_score
    } = state;

    const [allChampions, setAllChampions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedChamp, setSelectedChamp] = useState(null);
    const [banTurn, setBanTurn] = useState("A"); // Local state for ban turn sequence
    const [loading, setLoading] = useState(false);
    const [showReveal, setShowReveal] = useState(false);

    useEffect(() => {
        api.get('/champions-all').then(res => {
            // Flatten and Deduplicate
            const flat = Object.values(res.data).flat();
            const unique = Array.from(new Map(flat.map(item => [item.name, item])).values());
            unique.sort((a, b) => a.name.localeCompare(b.name));
            setAllChampions(unique);
        });
    }, []);

    const targetAnnouncements = series_format === "MD3" ? 4 : 6; // 2 each or 3 each
    const currentAnnouncements = announced_champions["A"].length + announced_champions["B"].length;

    // Determine Phase
    const isAnnouncementPhase = currentAnnouncements < targetAnnouncements;
    const isBanPhase = !isAnnouncementPhase && knockout_bans.length < 2;
    const isSeriesPhase = !isAnnouncementPhase && !isBanPhase;

    const gamesNeeded = series_format === "MD3" ? 2 : 3; // Minimum games
    const maxGames = series_format === "MD3" ? 3 : 5;
    const gamesList = Array.from({ length: maxGames }, (_, i) => `Game ${i + 1}`);

    // Check if draft is fully complete (all games have picks)
    // Note: Decider games might be effectively "picked" if they have data, even if random.
    const isDraftComplete = isSeriesPhase && gamesList.every(g => picks && picks[g]);

    useEffect(() => {
        if (isDraftComplete && !showReveal) {
            setShowReveal(true);
        }
    }, [isDraftComplete]);

    // --- Announcement Logic ---
    const handleAnnounce = async () => {
        if (!selectedChamp) return;
        setLoading(true);
        try {
            const res = await api.post('/announce-champion', {
                champion: selectedChamp.name,
                image: selectedChamp.image
            });
            playChampionVoice(selectedChamp.name);
            onStateUpdate(res.data);
            setSelectedChamp(null);
            setSearchTerm("");
        } catch (err) {
            alert(err.response?.data?.detail || "Erro ao anunciar campeão");
        }
        setLoading(false);
    };

    // --- Ban Logic ---
    const handleBan = async (champName) => {
        playBanSound();
        const res = await api.post('/knockout-ban', { champion: champName });
        onStateUpdate(res.data);
        setBanTurn(prev => prev === "A" ? "B" : "A"); // Toggle local ban turn visual
    };

    const handleFinalize = async () => {
        if (!confirm("Confirmar finalização e salvar histórico?")) return;
        try {
            await api.post('/finish-knockout');
            window.location.reload();
        } catch (err) {
            alert("Erro ao finalizar");
        }
    };

    // --- Series Logic ---
    // Handled by ChoicePhase logic mostly? Or custom here?
    // We need a specific UI for Series Picks.
    const [seriesPick, setSeriesPick] = useState({ game: "Game 1", champ: null });

    const currentPlayerName = announce_turn_player === "A" ? player_a : player_b;

    if (isAnnouncementPhase) {
        const filteredChamps = allChampions.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8 h-full">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
                    📢 Anúncio de Campeões
                </h2>

                <div className="w-full max-w-4xl grid grid-cols-2 gap-8 mb-8">
                    {/* Player A Pool */}
                    <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 min-h-[200px]">
                        <h3 className="text-blue-400 font-bold mb-4 flex justify-between">
                            <span>{player_a}</span>
                            <span>{announced_champions["A"].length} / {targetAnnouncements / 2}</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {announced_champions["A"].map((c, i) => (
                                <img key={i} src={c.image} className="w-12 h-12 rounded border border-blue-400" title={c.name} />
                            ))}
                        </div>
                    </div>
                    {/* Player B Pool */}
                    <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30 min-h-[200px]">
                        <h3 className="text-red-400 font-bold mb-4 flex justify-between">
                            <span>{player_b}</span>
                            <span>{announced_champions["B"].length} / {targetAnnouncements / 2}</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {announced_champions["B"].map((c, i) => (
                                <img key={i} src={c.image} className="w-12 h-12 rounded border border-red-400" title={c.name} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-cardBg p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl text-center">
                    <p className="text-gray-400 mb-2">Vez de Anunciar</p>
                    <div className="text-3xl font-bold text-primary mb-6 animate-pulse-gold">{currentPlayerName}</div>

                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Buscar campeão..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-bgDark border border-white/20 rounded-lg p-4 text-white focus:border-primary outline-none text-lg pr-10"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xl font-bold z-10"
                            >
                                &times;
                            </button>
                        )}
                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 bg-bgDark border border-white/20 max-h-60 overflow-y-auto z-50 rounded-b-lg shadow-xl">
                                {filteredChamps.map(c => (
                                    <div
                                        key={c.name}
                                        onClick={() => { setSelectedChamp(c); setSearchTerm(c.name); }}
                                        className="p-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5"
                                    >
                                        <img src={c.image} className="w-8 h-8 rounded-full" />
                                        <span>{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedChamp && (
                        <div className="flex flex-col items-center gap-4 animate-scale-in">
                            <ChampionCard name={selectedChamp.name} image={selectedChamp.image} isSelected={true} />
                            <button
                                onClick={handleAnnounce}
                                disabled={loading}
                                className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                            >
                                Confirmar Anúncio
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isBanPhase) {
        // Flat list of announced champs, excluding already banned
        const allAnnounced = [...announced_champions["A"], ...announced_champions["B"]];
        const remaining = allAnnounced.filter(c => !knockout_bans.includes(c.name));

        const banCount = knockout_bans.length;

        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-4xl font-bold text-red-500 flex items-center gap-4">
                    🚫 Fase de Banimentos ({banCount + 1}/2)
                </h2>
                <p className="text-gray-400">Clique em um campeão para banir da série</p>

                <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
                    {remaining.map(c => (
                        <div key={c.name} onClick={() => handleBan(c.name)} className="cursor-pointer hover:scale-105 transition-transform relative group">
                            <ChampionCard name={c.name} image={c.image} />
                            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/40 transition-colors rounded-xl flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 font-bold text-white text-xl">BANIR</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- Series Phase (Picks) Logic ---
    const allAnnounced = [...announced_champions["A"], ...announced_champions["B"]];
    const availablePool = allAnnounced.filter(c => !knockout_bans.includes(c.name));

    const handleSeriesPick = async (game, champ) => {
        playChampionVoice(champ.name);
        await api.post('/pick', {
            game,
            champion: champ.name,
            image: champ.image,
            player: "Both"
        });
        const res = await api.get('/state');
        onStateUpdate(res.data);
    };

    const isGamePicked = (game) => picks && picks[game];

    // --- Manual Side & Result Logic ---
    const handleSideChoice = async (game, side, chooser) => {
        try {
            const res = await api.post('/knockout-side', { game, side, chooser });
            onStateUpdate(res.data);
        } catch (err) {
            alert("Erro ao definir lado.");
        }
    };

    const handleSetWinner = async (game, winner) => {
        if (!confirm(`Confirmar vitória de ${winner} no ${game}?`)) return;
        try {
            const res = await api.post('/game-winner', { game, winner });
            onStateUpdate(res.data);
        } catch (err) {
            alert("Erro ao registrar vencedor.");
        }
    };

    return (
        <div className="p-8 animate-fade-in flex flex-col items-center gap-8 pb-20">
            {showReveal && picks && picks["Game 1"] && (
                <DraftReveal
                    playerA={player_a} // Just passing players, side not auto-determined for reveal yet or could be?
                    playerB={player_b}
                    champA={picks["Game 1"]}
                    champB={picks["Game 1"]} // It's same champ
                    onDismiss={() => setShowReveal(false)}
                />
            )}

            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
                ⚔️ Duelo {series_format}
            </h2>

            {/* Draft Pool (Available Champs) */}
            <div className="w-full max-w-5xl bg-black/20 p-6 rounded-2xl border border-white/10 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-300">Draft de Campeões (Mata-Mata)</h3>
                    <button onClick={handleFinalize} className="bg-red-500/20 text-red-400 px-4 py-2 rounded hover:bg-red-500/40 border border-red-500/50">
                        Finalizar Duelo
                    </button>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                    {availablePool.map(c => {
                        const isUsed = Object.values(picks || {}).some(p => p.champion === c.name);
                        if (isUsed) return null; // Hide used
                        return (
                            <div key={c.name} className="relative group cursor-pointer" draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify(c))}>
                                <img src={c.image} className="w-16 h-16 rounded-lg border-2 border-green-500/50 hover:border-green-400 transition-all" title={c.name} />
                                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs bg-black/80 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {c.name}
                                </div>
                            </div>
                        );
                    })}
                    {availablePool.length === 0 && <span className="text-gray-500 italic">Nenhum campeão disponível</span>}
                </div>
            </div>

            {/* Matches Grid */}
            <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
                {gamesList.map((gameLabel, idx) => {
                    const pickData = picks ? picks[gameLabel] : null;
                    const gameNum = idx + 1;
                    const isDecider = (series_format === "MD3" && gameNum === 3) || (series_format === "MD5" && gameNum === 5); // Game 3 (in MD3) or Game 5 (in MD5)

                    // Side & Winner Data
                    const sides = state.knockout_sides ? state.knockout_sides[gameLabel] : null;
                    const winner = state.game_winners ? state.game_winners[gameLabel] : null;

                    // Chooser Logic
                    // Game 1: Best Campaign (start_player)
                    // Game N: Loser of Game N-1
                    let sideChooser = null;

                    if (gameNum === 1) {
                        // best campaign is 'start_player' stored in state, need to fetch it?
                        // actually main setup stores 'start_player'.
                        // Let's assume passed in State.
                        sideChooser = state.start_player;
                    } else {
                        // Winner of previous game?
                        const prevGameLabel = `Game ${gameNum - 1}`;
                        const prevWinner = state.game_winners ? state.game_winners[prevGameLabel] : null;
                        if (prevWinner) {
                            // Loser chooses
                            sideChooser = prevWinner === player_a ? player_b : player_a;
                        }
                    }

                    return (
                        <div key={gameLabel} className={`relative p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${winner ? (winner === player_a ? 'border-blue-500 bg-blue-900/10' : 'border-red-500 bg-red-900/10')
                            : pickData ? 'bg-primary/5 border-primary shadow-lg'
                                : 'bg-white/5 border-white/10 border-dashed'
                            }`}>
                            <div className="absolute top-4 left-4 text-sm font-bold uppercase tracking-widest opacity-50">{gameLabel}</div>

                            {/* Champion (Pick or Decider) */}
                            {pickData ? (
                                <div className="flex flex-col items-center">
                                    <img src={pickData.image} className={`w-36 h-36 rounded-full border-4 shadow-xl mb-2 ${winner ? (winner === player_a ? 'border-blue-500' : 'border-red-500') : 'border-primary'
                                        }`} />
                                    <h3 className="text-2xl font-black uppercase">{pickData.champion}</h3>

                                    {/* SIDES DISPLAY Or SELECTION */}
                                    {sides ? (
                                        <div className="flex w-full mt-4 text-xs font-bold gap-2">
                                            <div className="flex-1 bg-blue-600/20 border border-blue-500/50 p-2 rounded text-center text-blue-300">
                                                🟦 {Object.keys(sides).find(k => sides[k] === "Blue") === "A" ? player_a : player_b}
                                            </div>
                                            <div className="flex-1 bg-red-600/20 border border-red-500/50 p-2 rounded text-center text-red-300">
                                                🟥 {Object.keys(sides).find(k => sides[k] === "Red") === "A" ? player_a : player_b}
                                            </div>
                                        </div>
                                    ) : (
                                        // Side Selection UI
                                        sideChooser && (
                                            <div className="mt-4 flex flex-col items-center gap-2 animate-pulse-soft">
                                                <div className="text-xs text-yellow-400 font-bold uppercase">Escolha de Lados: {sideChooser}</div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSideChoice(gameLabel, "Blue", sideChooser)}
                                                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold"
                                                    >
                                                        🟦 Escolher Blue
                                                    </button>
                                                    <button
                                                        onClick={() => handleSideChoice(gameLabel, "Red", sideChooser)}
                                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold"
                                                    >
                                                        🟥 Escolher Red
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* WINNER SELECTION */}
                                    {sides && !winner && (
                                        <div className="mt-6 flex flex-col items-center gap-2 w-full animate-fade-in">
                                            <div className="text-xs text-gray-400 font-bold uppercase">Quem Venceu?</div>
                                            <div className="flex gap-2 w-full">
                                                <button
                                                    onClick={() => handleSetWinner(gameLabel, player_a)}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/50 py-2 rounded text-sm font-bold transition-all"
                                                >
                                                    {player_a}
                                                </button>
                                                <button
                                                    onClick={() => handleSetWinner(gameLabel, player_b)}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/50 py-2 rounded text-sm font-bold transition-all"
                                                >
                                                    {player_b}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* WINNER DISPLAY */}
                                    {winner && (
                                        <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 px-4 py-1 rounded-full text-yellow-300 font-bold text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                            🏆 Vencedor: {winner}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // No Pick Yet
                                <div className="flex flex-col items-center gap-4 mt-8">
                                    <div className="w-32 h-32 rounded-full bg-black/20 flex items-center justify-center text-4xl grayscale opacity-30">
                                        {isDecider ? '🎲' : '❓'}
                                    </div>

                                    {!isDecider ? (
                                        <select
                                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm outline-none focus:border-primary"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const c = availablePool.find(x => x.name === e.target.value);
                                                    if (c) handleSeriesPick(gameLabel, c);
                                                }
                                            }}
                                            value=""
                                        >
                                            <option value="">-- Selecionar --</option>
                                            {availablePool.filter(c => !Object.values(picks || {}).some(p => p.champion === c.name)).map(c => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Realizar sorteio aleatório?")) return;
                                                try {
                                                    const res = await api.post('/random-decider-pick', { game: gameLabel });
                                                    onStateUpdate(res.data);
                                                } catch (err) {
                                                    alert(err.response?.data?.detail || "Erro no sorteio");
                                                }
                                            }}
                                            className="bg-primary/20 text-primary border border-primary/50 py-2 rounded hover:bg-primary/40 transition-colors font-bold flex items-center justify-center gap-2"
                                        >
                                            <span>🎲</span> Sortear Decider
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KnockoutPhase;
