"use client";

import { usePathname } from "next/navigation";
import Link from 'next/link';
import { Home, Swords, Trophy, Globe, Settings, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "../ui/Button";

export function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { icon: Home, label: "Home", href: "/dashboard" },
        { icon: Swords, label: "Duel", href: "/duel" },
        { icon: Trophy, label: "Torneios", href: "/tournaments" },
        { icon: Globe, label: "Ranking", href: "/ranking" },
        //{ icon: Settings, label: "Ajustes", href: "/settings" },
    ];

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <>
            {/* Mobile Trigger */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-hextech-900 border border-hextech-500 rounded text-hextech-400"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Menu />
            </button>

            {/* Sidebar Container */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-dark-950/95 border-r border-gold-600/20 backdrop-blur-xl transform transition-transform duration-300 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="mb-10 flex items-center gap-3">
                        <div className="w-8 h-8 bg-hextech-500 rotate-45 rounded-sm shadow-glow-cyan" />
                        <span className="font-display font-bold text-xl text-gold-300 tracking-wider">ULTIMATE X1</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={`
                    flex items-center gap-4 px-4 py-3 rounded transition-all duration-300 group
                    ${active
                                            ? 'bg-hextech-900/30 text-hextech-400 border-l-2 border-hextech-400'
                                            : 'text-gray-400 hover:text-gold-300 hover:bg-white/5'}
                  `}>
                                        <item.icon className={`w-5 h-5 ${active ? 'shadow-glow-cyan' : ''}`} />
                                        <span className="text-sm font-medium uppercase tracking-wider">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User / Logout */}
                    <div className="pt-6 border-t border-white/5">
                        <button
                            onClick={signOut}
                            className="flex items-center gap-4 px-4 py-3 w-full text-left text-gray-500 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
