import React, { useState, useEffect } from 'react';
import api from './api';
import Sidebar from './components/Sidebar';
import SetupPhase from './components/SetupPhase';
import LaneBanPhase from './components/LaneBanPhase';
import PickPhase from './components/PickPhase';

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

    const handleReroll = () => {
        api.post(`/reroll-draw`).then(res => setState(res.data));
    };

    const handleDraw = () => {
        api.post(`/draw`).then(res => setState(res.data));
    };

    const handlePick = (game, champion, image, player) => {
        api.post(`/pick`, { game, champion, image, player }).then(res => setState(res.data));
    };

    const handleResetDraw = () => {
        api.post(`/reset-duel`).then(res => setState(res.data));
    };

    const handleNewDuel = () => {
        api.post(`/reset-duel`).then(res => setState(res.data));
    };

    const handleFullReset = () => {
        if (confirm("Isso apagará todo o histórico da Blacklist. Tem certeza?")) {
            api.post(`/full-reset`).then(res => setState(res.data));
        }
    };

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

                {state.selected_lane && (
                    <PickPhase
                        lane={state.selected_lane}
                        champions={state.drawn_champions}
                        picks={state.picks}
                        players={{ p1: state.player_a, p2: state.player_b }}
                        onDraw={handleDraw}
                        onPick={handlePick}
                        onResetDraw={handleResetDraw}
                        onNewDuel={handleNewDuel}
                        onReroll={handleReroll}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
