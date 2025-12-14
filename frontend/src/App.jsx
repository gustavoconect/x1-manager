import React, { useState, useEffect } from 'react';
import api from './api';
import Sidebar from './components/Sidebar';
import SetupPhase from './components/SetupPhase';
import LaneBanPhase from './components/LaneBanPhase';
import ChoicePhase from './components/ChoicePhase';

function App() {
    const [state, setState] = useState(null);

    // Poll state (or refetch on actions)
    const fetchState = () => {
        api.get(`/state`)
            .then(res => {
                setState(res.data);
            })
            .catch(err => {
                console.error("Error fetching state:", err);
            });
    };

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 2000);
        return () => clearInterval(interval);
    }, []);

    if (!state) return <div className="h-screen flex items-center justify-center text-primary">Carregando Arena...</div>;

    const handleSetup = (data) => {
        api.post(`/setup`, data).then(res => setState(res.data));
    };

    const handleBan = (lane) => {
        api.post(`/ban-lane`, { lane }).then(res => setState(res.data));
    };

    const handleDraw = () => {
        api.post(`/draw`).then(res => setState(res.data));
    };

    const handleNewDuel = () => {
        api.post(`/reset-duel`).then(res => setState(res.data));
    };

    const handleFullReset = () => {
        if (confirm("Isso apagará todo o histórico da Blacklist. Tem certeza?")) {
            api.post(`/full-reset`).then(res => setState(res.data));
        }
    };

    // Check if we should show ChoicePhase (lane selected, need to draw or already drawn)
    const showChoicePhase = state.selected_lane;

    return (
        <div className="flex min-h-screen bg-bgDark font-outfit text-white selection:bg-primary selection:text-black">
            {/* Sidebar */}
            <Sidebar
                blacklist={state.global_blacklist}
                history={state.match_history}
                onNewDuel={handleNewDuel}
                onFullReset={handleFullReset}
            />

            {/* Main Content */}
            <div className="pl-80 flex-1 p-8">
                {!state.setup_complete && (
                    <SetupPhase onStart={handleSetup} />
                )}

                {state.setup_complete && !state.selected_lane && (
                    <LaneBanPhase
                        bannedLanes={state.banned_lanes}
                        onBan={handleBan}
                        currentPlayer={state.current_action_player}
                        currentPlayerName={state.current_action_player === "A" ? state.player_a : state.player_b}
                    />
                )}

                {showChoicePhase && !state.drawn_champions?.length && (
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-8 animate-fade-in">
                        <h2 className="text-4xl font-bold">Rota Definida: <span className="text-primary">{state.selected_lane}</span></h2>
                        <button
                            onClick={handleDraw}
                            className="bg-primary text-black px-12 py-6 rounded-2xl text-2xl font-bold uppercase hover:scale-105 transition-transform flex items-center gap-4 shadow-[0_0_50px_rgba(212,175,55,0.3)]"
                        >
                            🎲 Sortear Campeões
                        </button>
                    </div>
                )}

                {showChoicePhase && state.drawn_champions?.length > 0 && (
                    <ChoicePhase
                        state={state}
                        onStateUpdate={setState}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
