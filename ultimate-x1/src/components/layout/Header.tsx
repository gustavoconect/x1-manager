"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Bell } from "lucide-react";

export function Header({ title }: { title?: string }) {
    const { user } = useAuth();

    return (
        <header className="h-20 border-b border-gold-600/10 bg-dark-900/50 backdrop-blur-md sticky top-0 z-30 px-6 md:px-10 flex items-center justify-between">
            {/* Page Title */}
            <h1 className="text-2xl font-display text-gold-300 hidden md:block pl-16 md:pl-0">
                {title || "Dashboard"}
            </h1>

            {/* Right Actions */}
            <div className="flex items-center gap-6 ml-auto">
                <button className="relative text-gray-400 hover:text-gold-300 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gold-400 leading-none mb-1">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Invocador"}
                        </p>
                        <p className="text-xs text-hextech-500 font-mono">ONLINE</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-dark-800 border border-gold-600/50 flex items-center justify-center overflow-hidden">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-gold-600" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
