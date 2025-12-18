"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gamepad2, ShieldCheck, Trophy, Globe } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Login Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-hextech-gradient p-4 relative overflow-hidden">

            {/* Background Ornaments */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-hextech-900/20 blur-[100px] rounded-full" />
                <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-gold-600/10 blur-[120px] rounded-full" />
            </div>

            <Card className="w-full max-w-md text-center border-gold-600/50 backdrop-blur-xl relative z-10" glow>

                {/* Logo / Header */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-hextech-400 to-hextech-900 rounded-2xl rotate-45 flex items-center justify-center mb-6 shadow-glow-cyan border border-gold-400">
                        <div className="-rotate-45">
                            <Trophy className="w-8 h-8 text-gold-300" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-display text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-gold-600 drop-shadow-sm mb-2">
                        Ultimate X1
                    </h1>
                    <p className="text-hextech-400 tracking-[0.2em] uppercase text-xs font-bold">
                        League of Legends Tournament Manager
                    </p>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-3 gap-2 mb-8 text-xs text-gray-400">
                    <div className="flex flex-col items-center gap-2 p-2 rounded bg-dark-950/30 border border-white/5">
                        <Gamepad2 className="w-5 h-5 text-hextech-400" />
                        <span>Mata-Mata</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-2 rounded bg-dark-950/30 border border-white/5">
                        <Globe className="w-5 h-5 text-gold-400" />
                        <span>Rank Global</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-2 rounded bg-dark-950/30 border border-white/5">
                        <ShieldCheck className="w-5 h-5 text-purple-400" />
                        <span>Verificado</span>
                    </div>
                </div>

                {/* Action */}
                <div className="space-y-4">
                    <Button
                        size="lg"
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full relative overflow-hidden group"
                    >
                        {loading ? "Conectando..." : "Entrar com Discord"}

                        {/* Discord Icon (Simplified) */}
                        {!loading && (
                            <svg className="w-5 h-5 ml-2 fill-current" viewBox="0 0 127.14 96.36">
                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.09,105.09,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c2.36-24.44-3.11-48.55-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                            </svg>
                        )}

                    </Button>
                    <p className="text-xs text-gray-500 mt-4">
                        Ao entrar, você concorda com nossos termos de serviço.
                        Disponível apenas para usuários convidados na fase Alpha.
                    </p>
                </div>
            </Card>

            {/* Footer / Version */}
            <div className="absolute bottom-4 text-xs text-gray-700 font-mono">
                v2.0.0 • Powered by Next.js & Supabase
            </div>
        </div>
    );
}
