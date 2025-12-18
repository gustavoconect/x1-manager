"use client";

import { useGame } from "@/hooks/useGame";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, Sprout, Zap, Crosshair, Heart, Ban, Swords, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Lane } from "@/lib/constants";

export default function GameRoom() {
    const { state, actions, isLoading } = useGame();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && state && !state.setup_complete) {
            router.push("/duel/setup");
        }
    }, [state, isLoading, router]);

    if (isLoading || !state) {
        return (
            <div className="min-h-screen bg-hextech-gradient flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hextech-400"></div>
            </div>
        );
    }

    // --- Helpers ---
    const getGameStatus = () => {
        if (!state.picks["Game 1"]) return "Game 1";
        if (state.tournament_phase === "Groups" && !state.picks["Game 2"]) return "Game 2";
        // Add logic for MD3/MD5 logic if needed
        return "Complete";
    };

    const currentGame = getGameStatus();
    const isGameComplete = currentGame === "Complete";

    // --- Components ---

    const Scoreboard = () => (
        <Card className="mb-0 flex items-center justify-between border-b-0 rounded-b-none bg-dark-900/90 relative z-20">
            <div className="flex flex-col items-center w-1/3">
                <span className="text-xl md:text-2xl font-display text-blue-400 font-bold truncate max-w-full text-center">{state.player_a}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">{state.elo_a}</span>
            </div>

            <div className="flex flex-col items-center w-1/3">
                <div className="text-gold-400 font-mono text-xs md:text-sm mb-2 text-center whitespace-nowrap">
                    {state.series_format} • {state.tournament_phase}
                </div>
                <div className="px-4 py-1 bg-hextech-900/50 border border-hextech-500/30 rounded text-center md:min-w-[200px]">
                    <span className="text-xs text-hextech-400 uppercase block">Status</span>
                    <span className="font-bold text-white">
                        {isGameComplete ? "Finalizado" : state.banned_lanes.length < 5 ? "Bans" : "Picks"}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center w-1/3">
                <span className="text-xl md:text-2xl font-display text-red-500 font-bold truncate max-w-full text-center">{state.player_b}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">{state.elo_b}</span>
            </div>
        </Card>
    );

    const LaneBanPhase = () => {
        const lanes = [
            { id: "Top", icon: Shield, label: "Top" },
            { id: "Jungle", icon: Sprout, label: "Jungle" },
            { id: "Mid", icon: Zap, label: "Mid" },
            { id: "ADC", icon: Crosshair, label: "ADC" },
            { id: "Support", icon: Heart, label: "Support" },
        ];

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative min-h-[500px]">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-display text-gold-300 mb-2">Banimento de Rotas</h2>
                    <p className="text-gray-400">
                        Vez de: <strong className="text-white text-lg">{state.current_action_player === "A" ? state.player_a : state.player_b}</strong>
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {lanes.map((lane) => {
                        const isBanned = state.banned_lanes.includes(lane.id as Lane);
                        return (
                            <button
                                key={lane.id}
                                disabled={isBanned}
                                onClick={() => actions.banLane(lane.id as Lane)}
                                className={`
                    flex flex-col items-center gap-4 p-6 md:p-8 rounded-xl border transition-all duration-300 w-32 md:w-40 h-44 md:h-56 justify-center group relative overflow-hidden
                    ${isBanned
                                        ? 'bg-red-950/20 border-red-900/30 grayscale opacity-50 cursor-not-allowed'
                                        : 'bg-dark-800/80 border-gold-600/30 hover:border-hextech-400 hover:bg-hextech-900/20 hover:-translate-y-1 cursor-pointer shadow-lg'}
                 `}
                            >
                                <div className={`
                    p-3 md:p-4 rounded-full bg-dark-950 border border-white/10 group-hover:border-hextech-400/50 transition-colors z-10
                    ${isBanned ? 'text-red-900' : 'text-gold-400 group-hover:text-hextech-400'}
                 `}>
                                    {isBanned ? <Ban className="w-6 h-6 md:w-8 md:h-8" /> : <lane.icon className="w-6 h-6 md:w-8 md:h-8" />}
                                </div>
                                <span className={`font-display font-bold text-base md:text-lg z-10 ${isBanned ? 'text-red-900 decoration-line-through' : 'text-gray-300 group-hover:text-white'}`}>
                                    {lane.label}
                                </span>

                                {isBanned && (
                                    <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center">
                                        <span className="text-xs text-red-500 uppercase font-bold bg-black/80 px-2 py-1 rounded">Banido</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const DraftPickPhase = () => {
        // Check if champ is already picked in current series
        const isPicked = (champName: string) => {
            return Object.values(state.picks).some(p => p.champion === champName);
        };

        const handlePick = (champName: string, champImage: string) => {
            // Simple logic: If it's Game 1, Player A picks? Or we adhere to rules.
            // For MVP manual control:
            // Alert user or Show Modal? 
            // Let's implement simple "Select Player" overlay
            const player = window.confirm(`Confirmar pick de ${champName} para ${state.player_a}? (Cancel para Player B)`)
                ? state.player_a
                : state.player_b;

            actions.pickChampion({
                game: currentGame,
                champion: champName,
                image: champImage,
                player: player
            });
        };

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 min-h-[500px]">

                {!isGameComplete ? (
                    <>
                        <div>
                            <h2 className="text-3xl font-display text-gold-300 mb-1">
                                {state.drawn_champions.length > 0 ? `Picks: ${currentGame}` : `Rota: ${state.selected_lane}`}
                            </h2>
                            <p className="text-gray-400">
                                {state.drawn_champions.length > 0
                                    ? "Selecione o campeão para confirmar o pick da partida."
                                    : "Os campeões desta rota serão sorteados agora."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                            {state.drawn_champions.length > 0 ? (
                                state.drawn_champions.map((champ, i) => {
                                    const picked = isPicked(champ.name);
                                    return (
                                        <button
                                            key={i}
                                            disabled={picked}
                                            onClick={() => handlePick(champ.name, champ.image)}
                                            className={`relative group transition-all duration-300 ${picked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                                        >
                                            <Card glow={!picked} className="flex flex-col items-center gap-4 h-full p-4">
                                                <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-hextech-500 shadow-glow-cyan mb-2 group-hover:shadow-[0_0_25px_rgba(10,200,185,0.6)] transition-shadow">
                                                    <img src={champ.image} alt={champ.name} className="w-full h-full object-cover" />
                                                    {picked && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold font-display text-white group-hover:text-hextech-400">{champ.name}</h3>
                                                {!picked && <span className="text-xs text-gold-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Selecionar</span>}
                                            </Card>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="col-span-full flex justify-center py-12">
                                    <Button size="lg" onClick={actions.drawChampions} className="text-xl px-12 py-6 animate-pulse shadow-glow-gold">
                                        <Swords className="mr-3 w-6 h-6" /> Sortear Campeões
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="animate-in zoom-in duration-500">
                        <TrophyDisplay />
                    </div>
                )}
            </div>
        );
    };

    const TrophyDisplay = () => (
        <div className="text-center space-y-6">
            <Swords className="w-24 h-24 text-gold-400 mx-auto animate-bounce" />
            <h2 className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-gold-600">
                Série Finalizada
            </h2>
            <div className="grid grid-cols-2 gap-8 text-left max-w-md mx-auto bg-dark-900/50 p-6 rounded border border-white/10">
                {Object.entries(state.picks).map(([game, pick]) => (
                    <div key={game} className="col-span-2 flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-400">{game}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gold-300 font-bold">{pick.player}</span>
                            <img src={pick.image} className="w-8 h-8 rounded-full border border-gold-500" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center gap-4 mt-8">
                <Button onClick={() => router.push("/duel/setup")}>Novo Duelo</Button>
                <Button variant="secondary" onClick={() => router.push("/dashboard")}>Voltar ao Início</Button>
            </div>
        </div>
    );

    const isBanPhase = state.banned_lanes.length < 5; // Wait... current logic says 5 if "selected_lane" logic is automated. Backend Logic: 4 bans -> selected_lane is set.
    // Actually, backend sets selected_lane when 4 lanes are banned (remaining one is selected).
    // So ban phase is technically over when selected_lane is not null.

    const showBanPhase = !state.selected_lane;

    return (
        <div className="min-h-screen bg-hextech-gradient flex flex-col overflow-hidden">
            <Header title="Arena de Duelo" />

            <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-2 md:p-6 relative">
                <Scoreboard />

                <div className="flex-1 bg-dark-900/40 backdrop-blur-sm border border-gold-600/10 rounded-b-xl min-h-[500px] flex flex-col relative overflow-hidden transition-all duration-500">
                    <div className="absolute inset-0 bg-[url('/bg-texture.png')] opacity-10 pointer-events-none mix-blend-overlay" />

                    {showBanPhase ? <LaneBanPhase /> : <DraftPickPhase />}
                </div>
            </main>
        </div>
    );
}
