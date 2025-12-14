import React, { useEffect, useState } from 'react';
import api from '../api';

const Sidebar = ({ blacklist, history, onNewDuel, onFullReset }) => {
    const [champions, setChampions] = useState({});
    const [showHistory, setShowHistory] = useState(false);
    const [collapsedLanes, setCollapsedLanes] = useState({});

    /* Player Manager State */
    const [showManager, setShowManager] = useState(false);
    const [players, setPlayers] = useState({});
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [formData, setFormData] = useState({ name: "", elo: "Ferro IV", pdl: 0 });

    useEffect(() => {
        fetchPlayers();
        api.get('/champions-all').then(res => setChampions(res.data));
    }, []);

    const fetchPlayers = () => {
        api.get('/players').then(res => setPlayers(res.data));
    }

    const handleSavePlayer = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        api.post('/register-player', formData).then(res => {
            setPlayers(res.data);
            resetForm();
        });
    }

    const handleDeletePlayer = (name) => {
        if (confirm(`Tem certeza que deseja remover ${name}?`)) {
            api.delete(`/player/${name}`).then(res => {
                setPlayers(res.data);
                if (editingPlayer === name) resetForm();
            });
        }
    }

    const handleEditClick = (name, data) => {
        setFormData({ name: name, elo: data.elo || "Ferro IV", pdl: data.pdl || 0 });
        setEditingPlayer(name);
    }

    const resetForm = () => {
        setFormData({ name: "", elo: "Ferro IV", pdl: 0 });
        setEditingPlayer(null);
    }

    const toggleLane = (lane) => {
        setCollapsedLanes(prev => ({ ...prev, [lane]: !prev[lane] }));
    }

    const blacklistNames = (blacklist || []).map(x => x.name);

    return (
        <>
            <div className="w-80 h-screen bg-bgDark border-r border-white/5 flex flex-col fixed left-0 top-0 overflow-hidden shadow-2xl z-50">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-200 uppercase tracking-tighter">
                        X1 Manager
                    </h1>
                    <div className="mt-6 flex flex-col gap-2">
                        <button onClick={onNewDuel} className="bg-primary text-black font-bold py-2 rounded hover:brightness-110">
                            ⚔️ Novo Duelo
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setShowHistory(true)} className="flex-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold py-2 rounded hover:bg-blue-500/20 text-sm">
                                📜 Histórico
                            </button>
                            <button onClick={() => { setShowManager(true); fetchPlayers(); }} className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 font-bold py-2 rounded hover:bg-green-500/20 text-sm">
                                👤 Gerenciar
                            </button>
                        </div>
                        <button onClick={onFullReset} className="bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-2 rounded hover:bg-red-500/20">
                            🗑️ Resetar Tudo
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {Object.entries(champions).map(([lane, list]) => (
                        <div key={lane} className="bg-white/5 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleLane(lane)}
                                className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lane} ({list.length})</span>
                                <span className="text-gray-500 text-xs">{collapsedLanes[lane] ? "▼" : "▲"}</span>
                            </button>

                            {!collapsedLanes[lane] && (
                                <div className="p-3 flex flex-wrap gap-1 justify-center bg-black/20">
                                    {list.map(c => {
                                        const isBanned = blacklistNames.includes(c.name);
                                        return (
                                            <img
                                                key={c.name}
                                                src={c.image}
                                                title={c.name}
                                                className={`w-8 h-8 rounded-full border border-white/10 transition-all duration-300 ${isBanned
                                                    ? 'grayscale opacity-30'
                                                    : 'hover:scale-125 hover:border-primary hover:z-20 cursor-help'
                                                    }`}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-8 animate-fade-in">
                    <div className="bg-cardBg w-full max-w-4xl max-h-[80vh] rounded-2xl border border-white/10 flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                            <h2 className="text-2xl font-bold flex items-center gap-2">📜 Histórico de Duelos</h2>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                            {(!history || history.length === 0) ? (
                                <div className="text-center text-gray-500 py-10">Nenhum duelo registrado.</div>
                            ) : (
                                history.map((match) => (
                                    <div key={match.id} className="bg-bgDark p-4 rounded-xl border border-white/5 flex flex-col gap-4">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-primary font-bold text-lg">Duelo #{match.id}</span>
                                            <span className="text-xs uppercase bg-white/10 px-2 py-1 rounded">{match.phase} - {match.lane}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                                                <div className="text-sm text-blue-400 font-bold mb-2">JOGO 1</div>
                                                <div className="flex items-center gap-3">
                                                    <img src={match.game_1.image} className="w-10 h-10 rounded-full border border-blue-500" />
                                                    <div>
                                                        <div className="font-bold text-sm">{match.game_1.champion}</div>
                                                        <div className="text-xs text-gray-400">{match.player_a} vs {match.player_b}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                                                <div className="text-sm text-red-400 font-bold mb-2">JOGO 2</div>
                                                <div className="flex items-center gap-3">
                                                    <img src={match.game_2.image} className="w-10 h-10 rounded-full border border-red-500" />
                                                    <div>
                                                        <div className="font-bold text-sm">{match.game_2.champion}</div>
                                                        <div className="text-xs text-gray-400">{match.player_a} vs {match.player_b}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )).reverse()
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Player Manager Modal */}
            {showManager && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-8 animate-fade-in">
                    <div className="bg-cardBg w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold flex gap-2 items-center">👤 Gerenciador de Jogadores</h2>
                            <button onClick={() => setShowManager(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                            {/* Form */}
                            <form onSubmit={handleSavePlayer} className="bg-bgDark p-4 rounded-xl border border-white/5 space-y-4">
                                <h3 className="font-bold text-sm text-primary uppercase overflow-hidden">{editingPlayer ? "Editar Jogador" : "Novo Jogador"}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Nickname"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm outline-none focus:border-primary"
                                        readOnly={!!editingPlayer} // Lock name if editing
                                        required
                                    />
                                    <select
                                        value={formData.elo}
                                        onChange={(e) => setFormData({ ...formData, elo: e.target.value })}
                                        className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm outline-none focus:border-primary"
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
                                        className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    {editingPlayer && <button type="button" onClick={resetForm} className="text-xs text-gray-400 hover:text-white underline">Cancelar</button>}
                                    <button type="submit" className="bg-primary hover:brightness-110 text-black font-bold px-4 py-2 rounded text-sm transition-all">
                                        {editingPlayer ? "Salvar Alterações" : "Adicionar Jogador"}
                                    </button>
                                </div>
                            </form>

                            {/* List */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase">Jogadores Registrados ({Object.keys(players || {}).length})</h3>
                                <div className="grid gap-2">
                                    {Object.entries(players || {}).map(([name, data]) => (
                                        <div key={name} className="flex justify-between items-center bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center font-bold text-xs border border-white/10">
                                                    {name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-200">{name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${data.elo.includes("Ferro") ? "bg-gray-600" : data.elo.includes("Ouro") ? "bg-yellow-500" : data.elo.includes("Platina") ? "bg-cyan-500" : "bg-blue-500"}`}></span>
                                                        {data.elo} • {data.pdl || 0} PDL
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(name, data)}
                                                    className="bg-blue-500/20 text-blue-400 p-2 rounded hover:bg-blue-500/40 transition-all text-xs font-bold"
                                                >
                                                    EDITAR
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlayer(name)}
                                                    className="bg-red-500/20 text-red-400 p-2 rounded hover:bg-red-500/40 transition-all text-xs font-bold"
                                                >
                                                    REMOVER
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
        </>
    );
};

export default Sidebar;
