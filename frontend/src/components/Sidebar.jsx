import React, { useEffect, useState } from 'react';
import api from '../api';
import { playClickSound, playHoverSound } from '../SoundManager';

const Sidebar = ({ blacklist, history, onNewDuel, onFullReset, tournamentPhase, playerA, playerB, onHover }) => {
    const [champions, setChampions] = useState({});
    const [showHistory, setShowHistory] = useState(false);
    const [collapsedLanes, setCollapsedLanes] = useState({});

    /* Player Manager State */
    const [showManager, setShowManager] = useState(false);
    const [players, setPlayers] = useState({});
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [formData, setFormData] = useState({ name: "", elo: "Ferro IV", pdl: 0 });

    /* Blocked Champions State */
    const [showBlocked, setShowBlocked] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [blockedChamps, setBlockedChamps] = useState([]);

    /* Knockout View: blocked for current players */
    const [blockedA, setBlockedA] = useState([]);
    const [blockedB, setBlockedB] = useState([]);

    useEffect(() => {
        fetchPlayers();
        api.get('/champions-all').then(res => setChampions(res.data));
    }, []);

    // Fetch blocked champions when in Knockout phase
    useEffect(() => {
        if (tournamentPhase === 'Knockout' && playerA && playerB) {
            api.get(`/blocked-champions/${playerA}`).then(res => setBlockedA(res.data));
            api.get(`/blocked-champions/${playerB}`).then(res => setBlockedB(res.data));
        }
    }, [tournamentPhase, playerA, playerB]);

    const fetchBlocked = async (playerName) => {
        const res = await api.get(`/blocked-champions/${playerName}`);
        setBlockedChamps(res.data);
        setSelectedPlayer(playerName);
        setShowBlocked(true);
    };

    const fetchPlayers = () => {
        api.get('/players').then(res => setPlayers(res.data));
    }

    const handleSavePlayer = (e) => {
        e.preventDefault();
        playClickSound();
        if (!formData.name) return;

        api.post('/register-player', formData).then(res => {
            setPlayers(res.data);
            resetForm();
        });
    }

    const handleDeletePlayer = (name) => {
        playClickSound();
        if (confirm(`Tem certeza que deseja remover ${name}?`)) {
            api.delete(`/player/${name}`).then(res => {
                setPlayers(res.data);
                if (editingPlayer === name) resetForm();
            });
        }
    }

    const handleEditClick = (name, data) => {
        playClickSound();
        setFormData({ name: name, elo: data.elo || "Ferro IV", pdl: data.pdl || 0 });
        setEditingPlayer(name);
    }

    const resetForm = () => {
        setFormData({ name: "", elo: "Ferro IV", pdl: 0 });
        setEditingPlayer(null);
    }

    const toggleLane = (lane) => {
        playClickSound();
        setCollapsedLanes(prev => ({ ...prev, [lane]: !prev[lane] }));
    }

    const blacklistNames = (blacklist || []).map(x => x.name);

    return (
        <>
            <div className="w-[22rem] h-screen bg-hex-dark-100 border-r border-hex-gold-700 flex flex-col fixed left-0 top-0 overflow-hidden shadow-2xl z-50">
                {/* Header */}
                <div className="p-8 border-b border-hex-gold-700 bg-hex-dark-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/bg-clouds-loop.jpg')] opacity-20 mix-blend-overlay"></div>
                    <h1 className="relative text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-hex-gold-100 to-hex-gold-500 uppercase tracking-widest drop-shadow-sm text-center">
                        X1 Manager
                    </h1>

                    {/* Control Panel */}
                    <div className="mt-8 flex flex-col gap-3 relative z-10">
                        <button
                            onClick={onNewDuel}
                            onMouseEnter={playHoverSound}
                            className="hex-button w-full flex items-center justify-center gap-2 group"
                        >
                            <span className="text-xl group-hover:rotate-180 transition-transform duration-500">⚔️</span>
                            Novo Duelo
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => { playClickSound(); setShowHistory(true); }}
                                onMouseEnter={playHoverSound}
                                className="flex-1 bg-hex-blue-900/40 border border-hex-blue-500/30 text-hex-blue-300 py-2 px-3 rounded text-sm font-bold hover:bg-hex-blue-500/20 hover:border-hex-blue-300 transition-all uppercase tracking-wider"
                            >
                                📜 Histórico
                            </button>
                            <button
                                onClick={() => { playClickSound(); setShowManager(true); fetchPlayers(); }}
                                onMouseEnter={playHoverSound}
                                className="flex-1 bg-hex-dark-500 border border-hex-gold-700/50 text-hex-gold-300 py-2 px-3 rounded text-sm font-bold hover:bg-hex-gold-700/20 hover:border-hex-gold-300 transition-all uppercase tracking-wider"
                            >
                                👤 Gerenciar
                            </button>
                        </div>

                        <button
                            onClick={onFullReset}
                            onMouseEnter={playHoverSound}
                            className="mt-2 text-xs text-red-400/60 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                            <span>⚠️</span> Resetar Tudo
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-hex-dark-100 to-hex-dark-300">
                    {tournamentPhase === 'Knockout' && playerA && playerB ? (
                        /* Knockout Mode */
                        <div className="space-y-6 animate-fade-in">
                            <div className="hex-panel p-4 rounded-xl border-l-4 border-l-hex-blue-500">
                                <h3 className="text-sm font-bold text-hex-blue-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    🚫 {playerA} <span className="text-[10px] opacity-60 ml-auto">BLOQUEADOS</span>
                                </h3>
                                {blockedA.length === 0 ? (
                                    <p className="text-xs text-hex-gold-100/30 italic text-center py-2">Nenhum bloqueio</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {blockedA.map(c => (
                                            <div key={c.name} className="relative group">
                                                <img src={c.image} title={c.name} className="w-10 h-10 rounded-full border border-hex-blue-500 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="hex-panel p-4 rounded-xl border-l-4 border-l-red-500">
                                <h3 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    🚫 {playerB} <span className="text-[10px] opacity-60 ml-auto">BLOQUEADOS</span>
                                </h3>
                                {blockedB.length === 0 ? (
                                    <p className="text-xs text-hex-gold-100/30 italic text-center py-2">Nenhum bloqueio</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {blockedB.map(c => (
                                            <div key={c.name} className="relative group">
                                                <img src={c.image} title={c.name} className="w-10 h-10 rounded-full border border-red-500 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Groups Mode */
                        <div className="space-y-2">
                            <div className="px-2 pb-2 text-xs font-bold text-hex-gold-700 uppercase tracking-widest border-b border-white/5 mb-4">
                                Campeões Disponíveis
                            </div>
                            {Object.entries(champions).map(([lane, list]) => (
                                <div key={lane} className="bg-hex-dark-500/50 rounded-lg overflow-hidden border border-white/5 hover:border-hex-gold-700/50 transition-colors">
                                    <button
                                        onClick={() => toggleLane(lane)}
                                        onMouseEnter={playHoverSound}
                                        className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <span className="text-xs font-bold text-hex-gold-100/80 uppercase tracking-widest flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${collapsedLanes[lane] ? 'bg-gray-600' : 'bg-hex-gold-500'}`}></span>
                                            {lane} <span className="text-white/20">({list.length})</span>
                                        </span>
                                        <span className="text-hex-gold-500 text-[10px]">{collapsedLanes[lane] ? "▼" : "▲"}</span>
                                    </button>

                                    {!collapsedLanes[lane] && (
                                        <div className="p-3 flex flex-wrap gap-1.5 justify-center bg-black/20 inner-shadow">
                                            {list.map(c => {
                                                const isBanned = blacklistNames.includes(c.name);
                                                return (
                                                    <div key={c.name} className="relative">
                                                        <img
                                                            src={c.image}
                                                            title={c.name}
                                                            className={`w-9 h-9 rounded-full border transition-all duration-300 ${isBanned
                                                                ? 'border-red-900/50 grayscale opacity-20'
                                                                : 'border-hex-gold-700 hover:scale-110 hover:border-hex-gold-300 hover:z-20 cursor-help hover:shadow-[0_0_10px_rgba(200,170,110,0.5)]'
                                                                }`}
                                                        />
                                                        {isBanned && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-xs pointer-events-none">✕</div>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-8 animate-fade-in" onClick={() => setShowHistory(false)}>
                    <div className="bg-hex-dark-100 w-full max-w-5xl max-h-[85vh] rounded-2xl border border-hex-gold-700 flex flex-col shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hex-gold-500 to-transparent"></div>

                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-hex-dark-500">
                            <h2 className="text-3xl font-display font-bold text-hex-gold-100 flex items-center gap-3">
                                📜 Histórico de Batalha
                            </h2>
                            <button onClick={() => { playClickSound(); setShowHistory(false); }} className="text-hex-gold-700 hover:text-hex-gold-300 transition-colors text-xl font-bold p-2">✕</button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar bg-hex-dark-300/50">
                            {(!history || history.length === 0) ? (
                                <div className="text-center text-hex-gold-700/50 py-20 font-display text-xl">Nenhum duelo registrado nos arquivos.</div>
                            ) : (
                                history.map((match) => {
                                    const gameKeys = Object.keys(match).filter(k => k.startsWith('game_')).sort();
                                    return (
                                        <div key={match.id} className="bg-hex-dark-500 p-6 rounded-xl border border-white/5 hover:border-hex-gold-700/50 transition-all group">
                                            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-hex-gold-300 font-bold text-xl font-display">Duel #{match.id}</span>
                                                    <div className="bg-hex-blue-900/30 text-hex-blue-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-hex-blue-500/20">
                                                        {match.phase} {match.format ? `• ${match.format}` : match.lane ? `• ${match.lane}` : ''}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-bold text-white/40">
                                                    {match.player_a} <span className="text-hex-gold-700 mx-2">vs</span> {match.player_b}
                                                </div>
                                            </div>

                                            <div className={`grid gap-4 ${gameKeys.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                                {gameKeys.map((gameKey, idx) => {
                                                    const game = match[gameKey];
                                                    if (!game || !game.champion) return null;
                                                    const gameNum = gameKey.replace('game_', '').toUpperCase();
                                                    return (
                                                        <div key={gameKey} className="bg-black/40 p-4 rounded-lg border border-white/5 flex items-center gap-4 hover:bg-black/60 transition-colors">
                                                            <div className="relative">
                                                                <img src={game.image} className="w-14 h-14 rounded-full border-2 border-hex-gold-700" />
                                                                <div className="absolute -bottom-2 -right-2 bg-hex-dark-500 border border-hex-gold-700 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-hex-gold-300">
                                                                    {idx + 1}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-hex-gold-100 text-lg font-display">{game.champion}</div>
                                                                <div className="text-xs text-hex-blue-300 uppercase tracking-wider">{match.phase === 'Groups' ? match.lane : 'Mata-Mata'}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }).reverse()
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Player Manager Modal */}
            {showManager && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-8 animate-fade-in" onClick={() => setShowManager(false)}>
                    <div className="bg-hex-dark-100 w-full max-w-3xl max-h-[85vh] rounded-2xl border border-hex-gold-700 flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-hex-dark-500">
                            <h2 className="text-2xl font-display font-bold text-hex-gold-100 flex items-center gap-3">👤 Invocadores</h2>
                            <button onClick={() => { playClickSound(); setShowManager(false); }} className="text-hex-gold-700 hover:text-hex-gold-300 p-2">✕</button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar bg-hex-dark-300/80">
                            {/* Form */}
                            <form onSubmit={handleSavePlayer} className="bg-hex-dark-500 p-6 rounded-xl border border-hex-blue-500/30 shadow-lg">
                                <h3 className="font-bold text-sm text-hex-blue-300 uppercase mb-4 tracking-widest">{editingPlayer ? "Editar Registro" : "Novo Registro"}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Nickname"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none focus:border-hex-blue-500 transition-colors"
                                        readOnly={!!editingPlayer}
                                        required
                                    />
                                    <select
                                        value={formData.elo}
                                        onChange={(e) => setFormData({ ...formData, elo: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none focus:border-hex-blue-500 transition-colors"
                                    >
                                        {["Ferro IV", "Ferro III", "Ferro II", "Ferro I",
                                            "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
                                            "Prata IV", "Prata III", "Prata II", "Prata I",
                                            "Ouro IV", "Ouro III", "Ouro II", "Ouro I",
                                            "Platina IV", "Platina III", "Platina II", "Platina I",
                                            "Esmeralda IV", "Esmeralda III", "Esmeralda II", "Esmeralda I",
                                            "Diamante IV", "Diamante III", "Diamante II", "Diamante I",
                                            "Mestre", "Grão-Mestre", "Desafiante"].map(elo => <option key={elo} value={elo}>{elo}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="PDL"
                                        value={formData.pdl}
                                        onChange={(e) => setFormData({ ...formData, pdl: parseInt(e.target.value) || 0 })}
                                        className="bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none focus:border-hex-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    {editingPlayer && <button type="button" onClick={() => { playClickSound(); resetForm(); }} className="text-xs text-gray-500 hover:text-white uppercase font-bold px-4 py-2">Cancelar</button>}
                                    <button type="submit" className="bg-hex-blue-500 hover:bg-hex-blue-300 text-black font-bold px-6 py-2 rounded text-sm transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(3,151,171,0.3)]">
                                        {editingPlayer ? "Salvar" : "Registrar"}
                                    </button>
                                </div>
                            </form>

                            {/* List */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-hex-gold-700 uppercase tracking-widest border-b border-white/5 pb-2">Registrados ({Object.keys(players || {}).length})</h3>
                                <div className="grid gap-3">
                                    {Object.entries(players || {}).map(([name, data]) => (
                                        <div key={name} className="flex justify-between items-center bg-hex-dark-500 p-4 rounded-lg border border-transparent hover:border-hex-gold-700/30 hover:bg-hex-dark-100 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hex-dark-100 to-black flex items-center justify-center font-display font-bold text-sm border border-hex-gold-700 text-hex-gold-300 shadow-inner">
                                                    {name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-base text-hex-gold-100">{name}</div>
                                                    <div className="text-xs text-hex-blue-300/80 flex items-center gap-2">
                                                        {(() => {
                                                            const rankName = data.elo.split(" ")[0].toLowerCase();
                                                            const rankMap = {
                                                                "ferro": "iron",
                                                                "bronze": "bronze",
                                                                "prata": "silver",
                                                                "ouro": "gold",
                                                                "platina": "platinum",
                                                                "esmeralda": "emerald",
                                                                "diamante": "diamond",
                                                                "mestre": "master",
                                                                "grão-mestre": "grandmaster",
                                                                "desafiante": "challenger"
                                                            };
                                                            const key = rankMap[rankName] || "iron";
                                                            const emblemUrl = `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${key}.png`;
                                                            return <img src={emblemUrl} className="w-8 h-8 drop-shadow-md" alt={data.elo} />
                                                        })()}
                                                        <span>{data.elo} • {data.pdl || 0} PDL</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                                <button
                                                    onClick={() => handleEditClick(name, data)}
                                                    className="bg-hex-blue-900/40 text-hex-blue-300 p-2 rounded hover:bg-hex-blue-500 hover:text-white transition-all text-xs font-bold"
                                                    title="Editar"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => fetchBlocked(name)}
                                                    className="bg-hex-dark-100 text-red-400 border border-red-900/30 p-2 rounded hover:border-red-500 hover:text-red-200 transition-all text-xs font-bold"
                                                    title="Bloqueios"
                                                >
                                                    🚫
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlayer(name)}
                                                    className="bg-red-900/20 text-red-500 p-2 rounded hover:bg-red-600 hover:text-white transition-all text-xs font-bold"
                                                    title="Excluir"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Blocked Champions Modal */}
            {showBlocked && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-8 animate-fade-in" onClick={() => setShowBlocked(false)}>
                    <div className="bg-hex-dark-100 w-full max-w-lg max-h-[60vh] rounded-2xl border border-red-500/30 flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.2)]" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-hex-dark-500">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-red-400 uppercase tracking-widest">🚫 Bloqueios: {selectedPlayer}</h2>
                            <button onClick={() => setShowBlocked(false)} className="text-gray-500 hover:text-white">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-hex-dark-300/80 custom-scrollbar">
                            {blockedChamps.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 italic">Nenhum campeão bloqueado no Mata-Mata para este jogador.</div>
                            ) : (
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {blockedChamps.map(c => (
                                        <div key={c.name} className="flex flex-col items-center gap-2 group">
                                            <div className="relative">
                                                <img src={c.image} className="w-16 h-16 rounded-full border-2 border-red-500 grayscale opacity-70 group-hover:opacity-100 transition-all" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-0.5 bg-red-500 rotate-45 absolute"></div>
                                                    <div className="w-full h-0.5 bg-red-500 -rotate-45 absolute"></div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-red-400 font-bold uppercase tracking-wider">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
