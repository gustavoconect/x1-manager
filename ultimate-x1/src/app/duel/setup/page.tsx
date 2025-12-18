"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ELO_TIERS } from "@/lib/constants";
import { Swords, Trophy } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function SetupPage() {
    const router = useRouter();
    const { actions } = useGame();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        player_a: "Player 1",
        elo_a: "Ferro IV",
        pdl_a: 0,
        player_b: "Player 2",
        elo_b: "Ferro IV",
        pdl_b: 0,
        tournament_phase: "Groups",
        series_format: "MD2"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await actions.setupGame({
                player_a: formData.player_a,
                elo_a: formData.elo_a,
                pdl_a: Number(formData.pdl_a),
                player_b: formData.player_b,
                elo_b: formData.elo_b,
                pdl_b: Number(formData.pdl_b),
                tournament_phase: formData.tournament_phase as any,
                series_format: formData.series_format as any
            });
            router.push("/duel/room");
        } catch (error) {
            console.error("Setup failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-hextech-gradient flex flex-col">
            <Header title="Novo Duelo" />

            <main className="flex-1 p-6 flex items-center justify-center">
                <Card className="w-full max-w-4xl" glow>
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <div className="flex items-center justify-center mb-6">
                            <Swords className="w-12 h-12 text-hextech-400 animate-pulse" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">

                            {/* VS Divider */}
                            <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                                <div className="h-full w-px bg-gradient-to-b from-transparent via-gold-600/50 to-transparent" />
                                <div className="absolute bg-dark-900 border border-gold-600 rounded-full w-10 h-10 flex items-center justify-center text-gold-400 font-bold text-xs ring-4 ring-dark-900">
                                    VS
                                </div>
                            </div>

                            {/* Player A (Blue Side) */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-display text-blue-400 border-b border-blue-500/30 pb-2">Lado Azul</h3>
                                <Input
                                    label="Nome do Invocador"
                                    name="player_a"
                                    value={formData.player_a}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1 w-full">
                                        <label className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">Elo</label>
                                        <select
                                            name="elo_a"
                                            value={formData.elo_a}
                                            onChange={handleChange}
                                            className="bg-dark-950/50 border border-gold-600/30 text-gold-300 px-4 py-2 outline-none focus:border-hextech-400 transition-all rounded-sm h-[42px]"
                                        >
                                            {ELO_TIERS.map(tier => (
                                                <option key={tier} value={tier}>{tier}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input
                                        type="number"
                                        label="PDL"
                                        name="pdl_a"
                                        value={formData.pdl_a}
                                        onChange={handleChange}
                                        min={0} max={100}
                                    />
                                </div>
                            </div>

                            {/* Player B (Red Side) */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-display text-red-500 border-b border-red-500/30 pb-2 text-right md:text-left">Lado Vermelho</h3>
                                <Input
                                    label="Nome do Invocador"
                                    name="player_b"
                                    value={formData.player_b}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1 w-full">
                                        <label className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">Elo</label>
                                        <select
                                            name="elo_b"
                                            value={formData.elo_b}
                                            onChange={handleChange}
                                            className="bg-dark-950/50 border border-gold-600/30 text-gold-300 px-4 py-2 outline-none focus:border-hextech-400 transition-all rounded-sm h-[42px]"
                                        >
                                            {ELO_TIERS.map(tier => (
                                                <option key={tier} value={tier}>{tier}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input
                                        type="number"
                                        label="PDL"
                                        name="pdl_b"
                                        value={formData.pdl_b}
                                        onChange={handleChange}
                                        min={0} max={100}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Game Settings */}
                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <h3 className="text-lg font-display text-gold-300 mb-4">Configurações da Série</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">Fase do Torneio</label>
                                    <select
                                        name="tournament_phase"
                                        value={formData.tournament_phase}
                                        onChange={handleChange}
                                        className="bg-dark-950/50 border border-gold-600/30 text-gold-300 px-4 py-2 outline-none focus:border-hextech-400 transition-all rounded-sm"
                                    >
                                        <option value="Groups">Fase de Grupos</option>
                                        <option value="Knockout">Mata-Mata (Knockout)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">Formato</label>
                                    <select
                                        name="series_format"
                                        value={formData.series_format}
                                        onChange={handleChange}
                                        className="bg-dark-950/50 border border-gold-600/30 text-gold-300 px-4 py-2 outline-none focus:border-hextech-400 transition-all rounded-sm"
                                    >
                                        <option value="MD2">Melhor de 2 (MD2)</option>
                                        <option value="MD3">Melhor de 3 (MD3)</option>
                                        <option value="MD5">Melhor de 5 (MD5)</option>
                                    </select>
                                </div>

                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto shadow-glow-cyan">
                                {loading ? "Configurando..." : "Iniciar Duelo"} <Swords className="ml-2 w-4 h-4" />
                            </Button>
                        </div>

                    </form>
                </Card>
            </main>
        </div>
    );
}
