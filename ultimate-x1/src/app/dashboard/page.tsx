"use client";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trophy, Swords, Users, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
    return (
        <>
            <Header title="Visão Geral" />

            <div className="space-y-8 mt-4">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Partidas Hoje", value: "12", icon: Swords, color: "text-hextech-400" },
                        { label: "Jogadores Ativos", value: "24", icon: Users, color: "text-gold-400" },
                        { label: "Torneios", value: "1", icon: Trophy, color: "text-purple-400" },
                        { label: "Ping Médio", value: "18ms", icon: Activity, color: "text-green-400" },
                    ].map((stat, i) => (
                        <Card key={i} className="flex items-center justify-between p-6 hover:border-gold-500/50 transition-colors">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{stat.label}</p>
                                <p className="text-3xl font-display mt-1 text-white">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <Card glow className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-hextech-900/50 to-transparent z-0" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-display text-hextech-400 mb-2">Novo Duelo (X1)</h2>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                Inicie uma partida rápida MD2, MD3 ou MD5 com sistema de bans, picks e sorteio automático.
                            </p>
                            <Link href="/duel/setup">
                                <Button size="lg" className="w-full sm:w-auto">
                                    <Swords className="mr-2 w-4 h-4" /> Criar Sala
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent z-0" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-display text-gold-400 mb-2">Torneios</h2>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                Gerencie chaves, pontuações e participantes do torneio atual da comunidade.
                            </p>
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                <Trophy className="mr-2 w-4 h-4" /> Ver Chaves
                            </Button>
                        </div>
                    </Card>

                </div>
            </div>
        </>
    );
}
