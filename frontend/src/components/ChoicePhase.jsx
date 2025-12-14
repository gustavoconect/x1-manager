import React from 'react';
import api from '../api';
import ChampionCard from './ChampionCard';

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
        const res = await api.post(`/rule6-choice?choice=${choice}`);
        onStateUpdate(res.data);
    };

    // Phase 2: Pick order chooser decides who picks first
    const handleSetPickOrder = async (firstPicker) => {
        const res = await api.post(`/set-pick-order?first_picker=${firstPicker}`);
        onStateUpdate(res.data);
    };

    // Phase 3: Pick champions (Game 1 = first pick, Game 2 = second pick)
    const handlePick = async (game, champ) => {
        const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ}.png`;
        const playerName = game === "Game 1" ? firstPickerName : secondPickerName;
        const res = await api.post('/pick', { game, champion: champ, image: imgUrl, player: playerName });
        onStateUpdate(res.data);
    };

    // Phase 4: Side chooser picks their side
    const handleSetSide = async (side) => {
        const res = await api.post(`/set-map-side?side=${side}`);
        onStateUpdate(res.data);
    };

    // ========== RENDER PHASES ==========

    // Phase 1: Choice not made yet
    if (!choice_made) {
        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold">Campeões Sorteados</h2>

                <div className="flex gap-6">
                    {drawn_champions.map(champ => (
                        <ChampionCard
                            key={champ}
                            name={champ}
                            image={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ}.png`}
                            isSelected={false}
                            isBanned={false}
                        />
                    ))}
                </div>

                <div className="bg-cardBg p-8 rounded-2xl border border-white/10 text-center max-w-lg">
                    <p className="text-gray-400 mb-2">Decisão de</p>
                    <h3 className="text-2xl font-bold text-primary mb-6">{lowerName}</h3>
                    <p className="text-gray-300 mb-6">Escolha uma opção:</p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleRule6Choice('pick_order')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
                        >
                            (A) Definir Ordem de Pick
                        </button>
                        <button
                            onClick={() => handleRule6Choice('side')}
                            className="bg-purple-600 hover:bg-purple-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
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
                <h2 className="text-3xl font-bold">Campeões Sorteados</h2>

                <div className="flex gap-6">
                    {drawn_champions.map(champ => (
                        <ChampionCard
                            key={champ}
                            name={champ}
                            image={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ}.png`}
                            isSelected={false}
                            isBanned={false}
                        />
                    ))}
                </div>

                <div className="bg-cardBg p-8 rounded-2xl border border-white/10 text-center max-w-lg">
                    <p className="text-gray-400 mb-2">Decisão de</p>
                    <h3 className="text-2xl font-bold text-primary mb-6">{pickOrderChooserName}</h3>
                    <p className="text-gray-300 mb-6">Quem faz o primeiro pick?</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleSetPickOrder('A')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105"
                        >
                            {player_a}
                        </button>
                        <button
                            onClick={() => handleSetPickOrder('B')}
                            className="bg-red-600 hover:bg-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105"
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
                    <h2 className="text-3xl font-bold mb-2">Escolha de Campeões</h2>
                    <p className="text-gray-400">
                        Pick de <span className={`font-bold ${pickerColor}`}>{currentPicker}</span> ({currentGame})
                    </p>
                </div>

                <div className="flex gap-6 flex-wrap justify-center">
                    {drawn_champions.map(champ => {
                        const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ}.png`;
                        const isPicked = (hasPick1 && picks["Game 1"].champion === champ) ||
                            (hasPick2 && picks["Game 2"].champion === champ);

                        return (
                            <div key={champ} className="flex flex-col items-center gap-3">
                                <ChampionCard
                                    name={champ}
                                    image={imgUrl}
                                    isSelected={isPicked}
                                    isBanned={false}
                                />
                                {!isPicked && (
                                    <button
                                        onClick={() => handlePick(currentGame, champ)}
                                        className={`${currentGame === "Game 1" ? "bg-blue-600 hover:bg-blue-500" : "bg-red-600 hover:bg-red-500"} text-white py-2 px-6 rounded-lg font-bold transition-all hover:scale-105`}
                                    >
                                        Escolher
                                    </button>
                                )}
                                {isPicked && (
                                    <div className={`py-2 px-4 rounded-lg font-bold text-sm ${picks["Game 1"]?.champion === champ ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                                        {picks["Game 1"]?.champion === champ ? "Jogo 1" : "Jogo 2"}
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
                <h2 className="text-3xl font-bold">Picks Finalizados!</h2>

                <div className="flex gap-8">
                    <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-xl text-center">
                        <div className="text-sm text-blue-400 mb-2">JOGO 1</div>
                        <img src={picks["Game 1"].image} className="w-24 h-24 rounded-xl mx-auto mb-2" />
                        <div className="font-bold">{picks["Game 1"].champion}</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center">
                        <div className="text-sm text-red-400 mb-2">JOGO 2</div>
                        <img src={picks["Game 2"].image} className="w-24 h-24 rounded-xl mx-auto mb-2" />
                        <div className="font-bold">{picks["Game 2"].champion}</div>
                    </div>
                </div>

                <div className="bg-cardBg p-8 rounded-2xl border border-white/10 text-center max-w-lg">
                    <p className="text-gray-400 mb-2">Decisão de</p>
                    <h3 className="text-2xl font-bold text-primary mb-6">{sideChooserName}</h3>
                    <p className="text-gray-300 mb-6">Escolha seu lado no Jogo 1:</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleSetSide('Blue')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105"
                        >
                            🔵 Blue Side
                        </button>
                        <button
                            onClick={() => handleSetSide('Red')}
                            className="bg-red-600 hover:bg-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105"
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

    return (
        <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
            <h2 className="text-4xl font-bold text-primary">🎮 Duelo Configurado!</h2>

            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Game 1 */}
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">JOGO 1 (IDA)</h3>
                    <div className="flex justify-center mb-4">
                        <img src={picks["Game 1"].image} className="w-32 h-32 rounded-xl" />
                    </div>
                    <div className="text-center font-bold text-2xl mb-4">{picks["Game 1"].champion}</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between bg-black/20 p-2 rounded">
                            <span>{player_a}</span>
                            <span className={playerASide === "Blue" ? "text-blue-400" : "text-red-400"}>{playerASide} Side</span>
                        </div>
                        <div className="flex justify-between bg-black/20 p-2 rounded">
                            <span>{player_b}</span>
                            <span className={playerBSide === "Blue" ? "text-blue-400" : "text-red-400"}>{playerBSide} Side</span>
                        </div>
                    </div>
                </div>

                {/* Game 2 */}
                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-red-400 mb-4 text-center">JOGO 2 (VOLTA)</h3>
                    <div className="flex justify-center mb-4">
                        <img src={picks["Game 2"].image} className="w-32 h-32 rounded-xl" />
                    </div>
                    <div className="text-center font-bold text-2xl mb-4">{picks["Game 2"].champion}</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between bg-black/20 p-2 rounded">
                            <span>{player_a}</span>
                            <span className={playerASide === "Blue" ? "text-red-400" : "text-blue-400"}>{playerASide === "Blue" ? "Red" : "Blue"} Side</span>
                        </div>
                        <div className="flex justify-between bg-black/20 p-2 rounded">
                            <span>{player_b}</span>
                            <span className={playerBSide === "Blue" ? "text-red-400" : "text-blue-400"}>{playerBSide === "Blue" ? "Red" : "Blue"} Side</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-gray-400 text-sm mt-4">* No Jogo 2, os lados são invertidos automaticamente.</p>
        </div>
    );
};

export default ChoicePhase;
