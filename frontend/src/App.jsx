import React, { useState, useEffect } from 'react';
import api from './api';
import Sidebar from './components/Sidebar';
import SetupPhase from './components/SetupPhase';
import LaneBanPhase from './components/LaneBanPhase';
import ChoicePhase from './components/ChoicePhase';
import KnockoutPhase from './components/KnockoutPhase';
import { initializeSounds, playLockSound, playBanSound } from './sounds';

function App() {
    const [state, setState] = useState(null);

    // Initialize sounds and poll state
    useEffect(() => {
        initializeSounds(); // Preload sounds on app start

        const fetchState = () => {
            api.get(`/state`)
                .then(res => {
                    setState(res.data);
                })
                .catch(err => {
                    console.error("Error fetching state:", err);
                });
        };

        fetchState();
        const interval = setInterval(fetchState, 2000);
        return () => clearInterval(interval);
    }, []);

    if (!state) return <div className="h-screen flex items-center justify-center text-primary">Carregando Arena...</div>;

    const handleSetup = (data) => {
        playLockSound(); // Major transition: Iniciar Confronto
        api.post(`/setup`, data)
            .then(res => setState(res.data))
            .catch(err => {
                console.error("Setup Error:", err);
                alert("Erro ao iniciar duelo: " + (err.response?.data?.detail || err.message));
            });
    };

    const handleBan = (lane) => {
        playBanSound();
        api.post(`/ban-lane`, { lane }).then(res => {
            setState(res.data);
            // Play lock sound after 4th ban (lane selected)
            if (res.data.selected_lane) {
                playLockSound();
            }
        });
    };

    const handleDraw = () => {
        playLockSound(); // Major transition: Sortear Campeões
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

    // Groups Phase Logic
    const isGroupsPhase = state.tournament_phase === "Groups";
    const showChoicePhase = state.selected_lane && isGroupsPhase;

    return (
        <div className="flex min-h-screen bg-bgDark font-outfit text-white selection:bg-primary selection:text-black">
            {/* Sidebar */}
            <Sidebar
                blacklist={state.global_blacklist}
                history={state.match_history}
                onNewDuel={handleNewDuel}
                onFullReset={handleFullReset}
                tournamentPhase={state.tournament_phase}
                playerA={state.player_a}
                playerB={state.player_b}
            />

            {/* Main Content */}
            <div className="pl-80 flex-1 p-8">
                {!state.setup_complete && (
                    <SetupPhase onStart={handleSetup} />
                )}

                {/* KNOCKOUT PHASE */}
                {state.setup_complete && state.tournament_phase === "Knockout" && (
                    <KnockoutPhase
                        state={state}
                        onStateUpdate={setState}
                    />
                )}

                {/* GROUPS PHASE FLOW */}
                {state.setup_complete && isGroupsPhase && !state.selected_lane && (
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
