import React from 'react';
import ChampionCard from './ChampionCard';
import { RefreshCw, Sword, Dices, RotateCcw } from 'lucide-react';

const PickPhase = ({ lane, champions, picks, players, version, onDraw, onPick, onResetDraw, onNewDuel, onReroll }) => {
    // If no champions drawn yet
    if (!champions || champions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-8 animate-fade-in">
                <h2 className="text-4xl font-bold">Rota Definida: <span className="text-primary">{lane}</span></h2>
                <button
                    onClick={onDraw}
                    className="bg-primary text-black px-12 py-6 rounded-2xl text-2xl font-bold uppercase hover:scale-105 transition-transform flex items-center gap-4 shadow-[0_0_50px_rgba(212,175,55,0.3)]"
                >
                    <Dices size={32} />
                    Sortear Campeões
                </button>
            </div>
        );
    }

    const isComplete = picks && picks["Game 1"] && picks["Game 2"];

    return (
        <div className="p-8 animate-fade-in flex flex-col items-center">
            <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold">Sorteio: <span className="text-primary">{lane}</span></h2>
                    {/* Reroll Button (Only if not complete) */}
                    {!isComplete && (
                        <button
                            onClick={onReroll}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 p-2 rounded-full transition-colors"
                            title="Reroll (Sortear Novamente)"
                        >
                            <RotateCcw size={20} />
                        </button>
                    )}
                </div>

                {isComplete && (
                    <div className="flex gap-4">
                        <button onClick={onNewDuel} className="bg-primary text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20">
                            <Sword size={20} /> Novo Duelo
                        </button>
                        <button onClick={onResetDraw} className="bg-white/10 px-6 py-3 rounded-lg font-bold hover:bg-white/20">
                            Refazer Sorteio
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-8">
                {champions.map((champ) => {
                    // We assume backend handles randomness now properly
                    // Image URL:
                    const ver = version || "13.24.1";
                    const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${champ}.png`;

                    const pickG1 = picks["Game 1"]; // Object {champion, player, image} or null
                    const pickG2 = picks["Game 2"];

                    const isRef1 = pickG1?.champion === champ;
                    const isRef2 = pickG2?.champion === champ;
                    const isPicked = isRef1 || isRef2;

                    return (
                        <div key={champ} className="space-y-4 w-48 flex flex-col">
                            <ChampionCard
                                name={champ}
                                image={imgUrl}
                                isSelected={isPicked}
                                isBanned={false}
                                onClick={() => { }}
                            />

                            <div className="flex flex-col gap-2 flex-1 justify-end">
                                {!pickG1 && !isPicked && (
                                    <button
                                        onClick={() => onPick("Game 1", champ, imgUrl, players.p1)}
                                        className="w-full bg-blue-600/80 hover:bg-blue-500 py-2 rounded font-bold text-xs uppercase tracking-wider backdrop-blur-sm"
                                    >
                                        Pick {players.p1}
                                    </button>
                                )}
                                {!pickG2 && !isPicked && pickG1 && (
                                    <button
                                        onClick={() => onPick("Game 2", champ, imgUrl, players.p2)}
                                        className="w-full bg-red-600/80 hover:bg-red-500 py-2 rounded font-bold text-xs uppercase tracking-wider backdrop-blur-sm"
                                    >
                                        Pick {players.p2}
                                    </button>
                                )}
                            </div>

                            {isPicked && (
                                <div className={`text-center font-bold px-2 py-2 rounded border ${isRef1 ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                                    <div className="text-xs opacity-75">PICK DE</div>
                                    <div>{isRef1 ? players.p1 : players.p2}</div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default PickPhase;
